const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// User auth APIs
router.post("/user/register", authController.registerUser);
router.post("/user/login", authController.loginUser);
router.post("/user/logout", authController.logoutUser);
router.get("/user/me", authMiddleware.authUserMiddleware, authController.userMe);

// Food partner auth APIs
router.post("/food-partner/register", authController.registerFoodPartner);
router.post("/food-partner/login", authController.loginFoodPartner);
router.post("/food-partner/logout", authController.logoutFoodPartner);
router.get("/food-partner/me", authMiddleware.authFoodPartnerMiddleware, authController.foodPartnerMe);

// Generic session helper
router.get("/session", authController.getSession);

module.exports = router;
