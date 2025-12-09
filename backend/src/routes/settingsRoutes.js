import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";

const router = express.Router();

// Routes settings
router.get("/", getSettings);        // GET /api/settings → obtenir les paramètres
router.put("/", updateSettings);    // PUT /api/settings → mettre à jour les paramètres

export default router;

