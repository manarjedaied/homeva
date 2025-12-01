import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false,
    default: ''
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  product: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ["Nouveau", "En cours", "Terminé"],
    default: "Nouveau"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
