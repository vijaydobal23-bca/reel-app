const express = require("express");
const multer = require("multer");
const foodController = require("../controllers/food.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: Number(process.env.MAX_VIDEO_SIZE_BYTES) || 100 * 1024 * 1024
    }
});

/* POST /api/food/ [food partner protected] */
router.post(
    "/",
    authMiddleware.authFoodPartnerMiddleware,
    upload.single("video"),
    foodController.createFood
);

/* GET /api/food/ [user protected] */
router.get("/", authMiddleware.authUserMiddleware, foodController.getFoodItems);

router.post("/like", authMiddleware.authUserMiddleware, foodController.likeFood);
router.post("/save", authMiddleware.authUserMiddleware, foodController.saveFood);
router.get("/save", authMiddleware.authUserMiddleware, foodController.getSaveFood);

module.exports = router;
