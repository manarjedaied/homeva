import express from "express";
import { getCategories, addCategory, deleteCategory } from "../controllers/categoryController.js";

const router = express.Router();

// Public → récupérer toutes les catégories
router.get("/", getCategories);

// Admin → ajouter ou supprimer une catégorie
router.post("/", addCategory);
router.delete("/:id", deleteCategory);

export default router;
