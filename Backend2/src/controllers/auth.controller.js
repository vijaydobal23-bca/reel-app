const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const foodPartnerModel = require("../models/foodpartner.model");

const USER_COOKIE = "userToken";
const PARTNER_COOKIE = "partnerToken";
const PARTNER_REGISTRATION_KEY = process.env.PARTNER_REGISTRATION_KEY || "1234";

const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
};

const clearCookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
};

function createToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function sanitizeUser(user) {
    return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email
    };
}

function sanitizeFoodPartner(foodPartner) {
    return {
        _id: foodPartner._id,
        name: foodPartner.name,
        email: foodPartner.email,
        phone: foodPartner.phone,
        address: foodPartner.address,
        contactName: foodPartner.contactName
    };
}

function clearAuthCookies(res) {
    res.clearCookie(USER_COOKIE, clearCookieOptions);
    res.clearCookie(PARTNER_COOKIE, clearCookieOptions);
}

function verifyTokenSafely(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}

async function registerUser(req, res) {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "fullName, email and password are required" });
        }

        const existingUser = await userModel.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const user = await userModel.create({
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            password: await bcrypt.hash(password, 10)
        });

        const token = createToken({ id: user._id, role: "user" });
        res.cookie(USER_COOKIE, token, cookieOptions);
        res.clearCookie(PARTNER_COOKIE, clearCookieOptions);

        return res.status(201).json({
            message: "User registered successfully",
            user: sanitizeUser(user)
        });
    } catch (err) {
        return res.status(500).json({ message: "Unable to register user" });
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "email and password are required" });
        }

        const user = await userModel.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = createToken({ id: user._id, role: "user" });
        res.cookie(USER_COOKIE, token, cookieOptions);
        res.clearCookie(PARTNER_COOKIE, clearCookieOptions);

        return res.status(200).json({
            message: "User logged in successfully",
            user: sanitizeUser(user)
        });
    } catch (err) {
        return res.status(500).json({ message: "Unable to login user" });
    }
}

function logoutUser(req, res) {
    clearAuthCookies(res);
    return res.status(200).json({ message: "User logged out successfully" });
}

async function registerFoodPartner(req, res) {
    try {
        const { name, email, password, phone, address, contactName, partnerKey } = req.body;

        if (!name || !email || !password || !phone || !address || !contactName || !partnerKey) {
            return res.status(400).json({ message: "All partner fields are required, including partner key" });
        }

        if (String(partnerKey).trim() !== PARTNER_REGISTRATION_KEY) {
            return res.status(403).json({ message: "Invalid partner registration key" });
        }

        const existingPartner = await foodPartnerModel.findOne({ email: email.toLowerCase().trim() });
        if (existingPartner) {
            return res.status(409).json({ message: "Food partner account already exists" });
        }

        const foodPartner = await foodPartnerModel.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: await bcrypt.hash(password, 10),
            phone: phone.trim(),
            address: address.trim(),
            contactName: contactName.trim()
        });

        const token = createToken({ id: foodPartner._id, role: "food-partner" });
        res.cookie(PARTNER_COOKIE, token, cookieOptions);
        res.clearCookie(USER_COOKIE, clearCookieOptions);

        return res.status(201).json({
            message: "Food partner registered successfully",
            foodPartner: sanitizeFoodPartner(foodPartner)
        });
    } catch (err) {
        return res.status(500).json({ message: "Unable to register food partner" });
    }
}

async function loginFoodPartner(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "email and password are required" });
        }

        const foodPartner = await foodPartnerModel.findOne({ email: email.toLowerCase().trim() });
        if (!foodPartner) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const passwordValid = await bcrypt.compare(password, foodPartner.password);
        if (!passwordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = createToken({ id: foodPartner._id, role: "food-partner" });
        res.cookie(PARTNER_COOKIE, token, cookieOptions);
        res.clearCookie(USER_COOKIE, clearCookieOptions);

        return res.status(200).json({
            message: "Food partner logged in successfully",
            foodPartner: sanitizeFoodPartner(foodPartner)
        });
    } catch (err) {
        return res.status(500).json({ message: "Unable to login food partner" });
    }
}

function logoutFoodPartner(req, res) {
    clearAuthCookies(res);
    return res.status(200).json({ message: "Food partner logged out successfully" });
}

function userMe(req, res) {
    return res.status(200).json({
        user: sanitizeUser(req.user)
    });
}

function foodPartnerMe(req, res) {
    return res.status(200).json({
        foodPartner: sanitizeFoodPartner(req.foodPartner)
    });
}

async function getSession(req, res) {
    const userToken = req.cookies.userToken;
    const partnerToken = req.cookies.partnerToken;

    const session = {
        user: null,
        foodPartner: null
    };

    const userDecoded = userToken ? verifyTokenSafely(userToken) : null;
    if (userDecoded?.role === "user") {
        const user = await userModel.findById(userDecoded.id).select("-password");
        if (user) {
            session.user = sanitizeUser(user);
        }
    }

    const partnerDecoded = partnerToken ? verifyTokenSafely(partnerToken) : null;
    if (partnerDecoded?.role === "food-partner") {
        const foodPartner = await foodPartnerModel.findById(partnerDecoded.id).select("-password");
        if (foodPartner) {
            session.foodPartner = sanitizeFoodPartner(foodPartner);
        }
    }

    return res.status(200).json(session);
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    registerFoodPartner,
    loginFoodPartner,
    logoutFoodPartner,
    userMe,
    foodPartnerMe,
    getSession
};
