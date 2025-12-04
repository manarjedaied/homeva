import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ""
  },

  // Plusieurs images
  images: [{ type: String }],

  // Promo en pourcentage
  pourcentagePromo: {
    type: Number,
    default: 0 // si pas de promo
  },

  // Stock limité : oui/non
  stockLimite: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  }
});

const Product = mongoose.model("Product", productSchema);
export default Product;
