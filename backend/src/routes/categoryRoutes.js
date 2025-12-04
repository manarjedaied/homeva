import express from "express";
import {
  getCategories,
  addCategory,
  deleteCategory,
  updateCategory
} from "../controllers/categoryController.js";

const router = express.Router();

// Public → récupérer toutes les catégories
router.get("/", getCategories);

// Admin → CRUD catégories
router.post("/", addCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
