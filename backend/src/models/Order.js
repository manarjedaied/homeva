import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  ville: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  
  // ===== INFORMATIONS DE PRIX =====
  
  // Prix unitaire original du produit
  unitPrice: {
    type: Number,
    required: true
  },
  
  // Pourcentage de promo du produit (si applicable)
  productPromoPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Prix unitaire après promo produit
  unitPriceWithPromo: {
    type: Number,
    required: true
  },
  
  // Sous-total (prix unitaire avec promo × quantité)
  subtotal: {
    type: Number,
    required: true
  },
  
  // Remise pour achat de 2 produits (5%)
  quantityDiscountPercentage: {
    type: Number,
    default: 0
  },
  
  // Montant de la remise quantité
  quantityDiscountAmount: {
    type: Number,
    default: 0
  },
  
  // Prix après remise quantité
  priceAfterDiscount: {
    type: Number,
    required: true
  },
  
  // Frais de livraison
  deliveryFee: {
    type: Number,
    default: 7
  },
  
  // Livraison gratuite (≥ 3 produits)
  isFreeDelivery: {
    type: Boolean,
    default: false
  },
  
  // Prix total final
  totalPrice: {
    type: Number,
    required: true
  },
  
  // Type de livraison
  deliveryType: {
    type: String,
    enum: ["domicile"],
    default: "domicile"
  },
  
  // ===== STATUT =====
  status: {
    type: String,
    enum: ["Nouveau", "En cours", "Terminé", "Annulé"],
    default: "Nouveau"
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour recherche rapide
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ clientName: 1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;