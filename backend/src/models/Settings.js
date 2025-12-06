import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  // Remise quantité
  quantityDiscountEnabled: {
    type: Boolean,
    default: true
  },
  quantityDiscountMinQuantity: {
    type: Number,
    default: 2,
    min: 1
  },
  quantityDiscountPercentage: {
    type: Number,
    default: 5,
    min: 0,
    max: 100
  },
  
  // Livraison gratuite
  freeDeliveryEnabled: {
    type: Boolean,
    default: true
  },
  freeDeliveryMinQuantity: {
    type: Number,
    default: 3,
    min: 1
  },
  
  // Frais de livraison
  defaultDeliveryFee: {
    type: Number,
    default: 7,
    min: 0
  }
}, {
  timestamps: true
});

// S'assurer qu'il n'y a qu'un seul document de settings
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;

