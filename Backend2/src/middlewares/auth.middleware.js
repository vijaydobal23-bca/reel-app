const jwt = require("jsonwebtoken");
const foodPartnerModel = require("../models/foodpartner.model");
const userModel = require("../models/user.model");

function verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

async function authFoodPartnerMiddleware(req, res, next) {
    const token = req.cookies.partnerToken;

    if (!token) {
        return res.status(401).json({ message: "Partner login required" });
    }

    try {
        const decoded = verifyToken(token);

        if (decoded.role !== "food-partner") {
            return res.status(403).json({ message: "Invalid partner session" });
        }

        const foodPartner = await foodPartnerModel.findById(decoded.id).select("-password");

        if (!foodPartner) {
            return res.status(401).json({ message: "Partner not found" });
        }

        req.foodPartner = foodPartner;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired partner token" });
    }
}

async function authUserMiddleware(req, res, next) {
    const token = req.cookies.userToken;

    if (!token) {
        return res.status(401).json({ message: "User login required" });
    }

    try {
        const decoded = verifyToken(token);

        if (decoded.role !== "user") {
            return res.status(403).json({ message: "Invalid user session" });
        }

        const user = await userModel.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired user token" });
    }
}

module.exports = {
    authFoodPartnerMiddleware,
    authUserMiddleware
};
