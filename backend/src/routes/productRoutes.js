import express from "express";
import { getProducts, getProductById, updateProduct, deleteProduct, addProduct, getProductsByCategory } from "../controllers/productController.js";
import { upload } from "../middleware/upload.js";
const router = express.Router();

// Routes produits
router.get("/", getProducts);               // GET /api/products → liste tous les produits
router.get("/:id", getProductById);        // GET /api/products/:id → détails d’un produit
router.post("/", upload.array("images", 10), addProduct);  // upload multiple
router.put("/:id", upload.array("images", 10), updateProduct);
router.delete("/:id", deleteProduct);      // DELETE /api/products/:id → supprimer un produit
router.get("/category/:categoryId", getProductsByCategory);

export default router;
