import mongoose from "mongoose";

const descImgProdSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true
  },

  // URL fournie par Cloudinary (secure_url)
  url: {
    type: String,
    required: true
  },

  // identifiant Cloudinary pour suppression/transformations
  public_id: {
    type: String,
    default: null
  },

  // accessibilité / SEO
  alt: {
    type: String,
    default: ""
  },

  // légende (possibilité d'objet pour i18n : {fr,ar,en})
  caption: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },

  // type d'image pour faciliter le rendu
  type: {
    type: String,
    enum: ["hero", "lifestyle", "infographic", "spec", "other"],
    default: "other"
  },

  // ordre d'affichage
  position: {
    type: Number,
    default: 0
  },

  // image principale pour la description riche
  isMain: {
    type: Boolean,
    default: false
  },

  // métadonnées utiles pour le front (largeur/hauteur/poids/format)
  metadata: {
    width: Number,
    height: Number,
    size: Number,
    format: String
  },

  // URLs transformées / variantes (webp/avif/thumbs)
  variants: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// index pour requêtes fréquentes
descImgProdSchema.index({ productId: 1, position: 1 });

const DescImgProd = mongoose.model("DescImgProd", descImgProdSchema);
export default DescImgProd;
