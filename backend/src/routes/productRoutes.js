import express from "express";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";

const router = express.Router();

// Routes produits
router.get("/", getProducts);               // GET /api/products → liste tous les produits
router.get("/:id", getProductById);        // GET /api/products/:id → détails d’un produit
router.post("/", createProduct);           // POST /api/products → ajouter un produit
router.put("/:id", updateProduct);         // PUT /api/products/:id → modifier un produit
router.delete("/:id", deleteProduct);      // DELETE /api/products/:id → supprimer un produit

export default router;
