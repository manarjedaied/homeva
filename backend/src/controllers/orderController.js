import Order from "../models/Order.js";

// GET /api/orders
export const getOrders = async (req, res) => {
  try {
const orders = await Order.find()
  .populate("product")
  .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: "Erreur création commande", error: error.message });
  }
};

// PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Nouveau", "En cours", "Terminé"].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updatedOrder) return res.status(404).json({ message: "Commande non trouvée" });
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
