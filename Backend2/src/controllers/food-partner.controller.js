const foodPartnerModel = require("../models/foodpartner.model");
const foodModel = require("../models/food.model");

async function getFoodPartnerById(req, res) {
    try {
        const foodPartnerId = req.params.id;

        const foodPartner = await foodPartnerModel.findById(foodPartnerId).select("-password").lean();
        if (!foodPartner) {
            return res.status(404).json({ message: "Food partner not found" });
        }

        const foodItemsByFoodPartner = await foodModel
            .find({ foodPartner: foodPartnerId })
            .sort({ createdAt: -1 })
            .lean();

        const base = process.env.BACKEND_BASE_URL || "http://localhost:3000";
        const foodItems = foodItemsByFoodPartner.map((item) => ({
            ...item,
            video: item.video.startsWith("/upload/") ? `${base}${item.video}` : item.video
        }));

        return res.status(200).json({
            message: "Food partner retrieved successfully",
            foodPartner: {
                ...foodPartner,
                totalMeals: foodItems.length,
                customersServed: foodItems.reduce((sum, item) => sum + (item.likeCount || 0), 0),
                foodItems
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Unable to fetch food partner profile" });
    }
}

module.exports = {
    getFoodPartnerById
};
