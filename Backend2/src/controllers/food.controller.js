const foodModel = require("../models/food.model");
const storageService = require("../services/storage.service");
const likeModel = require("../models/likes.model");
const saveModel = require("../models/save.model");

async function createFood(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Video file is required" });
        }

        const name = (req.body.name || "").trim();
        const description = (req.body.description || "").trim();

        if (!name) {
            return res.status(400).json({ message: "Food name is required" });
        }

        const fileUploadResult = await storageService.uploadFile(req.file.buffer, req.file.mimetype);

        const foodItem = await foodModel.create({
            name,
            description,
            video: fileUploadResult.url,
            foodPartner: req.foodPartner._id
        });

        return res.status(201).json({
            message: "Food created successfully",
            food: foodItem
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to create food item"
        });
    }
}

async function getFoodItems(req, res) {
    try {
        const userId = req.user._id;
        const foodItems = await foodModel.find({}).sort({ createdAt: -1 }).lean();

        const ids = foodItems.map((item) => item._id);
        const [likes, saves] = await Promise.all([
            likeModel.find({ user: userId, food: { $in: ids } }).select("food"),
            saveModel.find({ user: userId, food: { $in: ids } }).select("food")
        ]);

        const likedSet = new Set(likes.map((x) => String(x.food)));
        const savedSet = new Set(saves.map((x) => String(x.food)));

        const enriched = foodItems.map((item) => ({
            ...item,
            video: item.video.startsWith("/upload/") ? `${process.env.BACKEND_BASE_URL || "http://localhost:3000"}${item.video}` : item.video,
            isLiked: likedSet.has(String(item._id)),
            isSaved: savedSet.has(String(item._id))
        }));

        return res.status(200).json({
            message: "Food items fetched successfully",
            foodItems: enriched
        });
    } catch (error) {
        return res.status(500).json({ message: "Unable to fetch food items" });
    }
}

async function likeFood(req, res) {
    try {
        const { foodId } = req.body;
        const userId = req.user._id;

        if (!foodId) {
            return res.status(400).json({ message: "foodId is required" });
        }

        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ message: "Food item not found" });
        }

        const existingLike = await likeModel.findOne({ user: userId, food: foodId });

        if (existingLike) {
            await likeModel.deleteOne({ _id: existingLike._id });
            const updated = await foodModel.findByIdAndUpdate(
                foodId,
                { $inc: { likeCount: -1 } },
                { new: true }
            );

            return res.status(200).json({
                message: "Food unliked successfully",
                action: "unliked",
                likeCount: Math.max(0, updated?.likeCount || 0)
            });
        }

        await likeModel.create({ user: userId, food: foodId });
        const updated = await foodModel.findByIdAndUpdate(
            foodId,
            { $inc: { likeCount: 1 } },
            { new: true }
        );

        return res.status(201).json({
            message: "Food liked successfully",
            action: "liked",
            likeCount: updated?.likeCount || 1
        });
    } catch (error) {
        return res.status(500).json({ message: "Unable to update like state" });
    }
}

async function saveFood(req, res) {
    try {
        const { foodId } = req.body;
        const userId = req.user._id;

        if (!foodId) {
            return res.status(400).json({ message: "foodId is required" });
        }

        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ message: "Food item not found" });
        }

        const existingSave = await saveModel.findOne({ user: userId, food: foodId });

        if (existingSave) {
            await saveModel.deleteOne({ _id: existingSave._id });
            const updated = await foodModel.findByIdAndUpdate(
                foodId,
                { $inc: { savesCount: -1 } },
                { new: true }
            );

            return res.status(200).json({
                message: "Food unsaved successfully",
                action: "unsaved",
                savesCount: Math.max(0, updated?.savesCount || 0)
            });
        }

        await saveModel.create({ user: userId, food: foodId });
        const updated = await foodModel.findByIdAndUpdate(
            foodId,
            { $inc: { savesCount: 1 } },
            { new: true }
        );

        return res.status(201).json({
            message: "Food saved successfully",
            action: "saved",
            savesCount: updated?.savesCount || 1
        });
    } catch (error) {
        return res.status(500).json({ message: "Unable to update save state" });
    }
}

async function getSaveFood(req, res) {
    try {
        const userId = req.user._id;

        const savedFoods = await saveModel
            .find({ user: userId })
            .populate("food")
            .sort({ createdAt: -1 })
            .lean();

        const payload = savedFoods
            .filter((entry) => Boolean(entry.food))
            .map((entry) => ({
                ...entry,
                food: {
                    ...entry.food,
                    video: entry.food.video.startsWith("/upload/")
                        ? `${process.env.BACKEND_BASE_URL || "http://localhost:3000"}${entry.food.video}`
                        : entry.food.video,
                    isSaved: true
                }
            }));

        return res.status(200).json({
            message: "Saved foods retrieved successfully",
            savedFoods: payload
        });
    } catch (error) {
        return res.status(500).json({ message: "Unable to fetch saved foods" });
    }
}

module.exports = {
    createFood,
    getFoodItems,
    likeFood,
    saveFood,
    getSaveFood
};
