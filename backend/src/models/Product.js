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

  // Stock total initial
  stockTotal: {
    type: Number,
    default: 0,
    min: 0
  },

  // ===== PARAMÈTRES DE REMISE ET LIVRAISON (spécifiques au produit) =====
  // Si null/undefined, utilise les paramètres globaux
  
  // Remise quantité
  quantityDiscountEnabled: {
    type: Boolean,
    default: null // null = utilise les paramètres globaux
  },
  quantityDiscountMinQuantity: {
    type: Number,
    default: null
  },
  quantityDiscountPercentage: {
    type: Number,
    default: null
  },
  
  // Livraison gratuite
  freeDeliveryEnabled: {
    type: Boolean,
    default: null
  },
  freeDeliveryMinQuantity: {
    type: Number,
    default: null
  },
  
  // Frais de livraison spécifique (optionnel)
  customDeliveryFee: {
    type: Number,
    default: null // null = utilise les paramètres globaux
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
