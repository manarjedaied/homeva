import express from "express";
import { loginAdmin, logoutAdmin, refreshTokenAdmin, registerAdmin } from "../controllers/adminController.js";

const router = express.Router();

// Routes admin
router.post("/login", loginAdmin);
router.post("/register", registerAdmin);
router.post("/refresh", refreshTokenAdmin);
router.post("/logout", logoutAdmin);

export default router;
