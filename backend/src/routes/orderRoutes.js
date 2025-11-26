import express from "express";
import { getOrders, createOrder, updateOrderStatus } from "../controllers/orderController.js";

const router = express.Router();

// Routes commandes
router.get("/", getOrders);                 // GET /api/orders → toutes les commandes
router.post("/", createOrder);             // POST /api/orders → créer une commande
router.put("/:id/status", updateOrderStatus); // PUT /api/orders/:id/status → changer statut commande

export default router;
