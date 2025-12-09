import Settings from "../models/Settings.js";

// GET /api/settings
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// PUT /api/settings
export const updateSettings = async (req, res) => {
  try {
    const {
      quantityDiscountEnabled,
      quantityDiscountMinQuantity,
      quantityDiscountPercentage,
      freeDeliveryEnabled,
      freeDeliveryMinQuantity,
      defaultDeliveryFee
    } = req.body;

    // Validation
    if (quantityDiscountMinQuantity !== undefined && quantityDiscountMinQuantity < 1) {
      return res.status(400).json({ message: "La quantité minimale doit être au moins 1" });
    }
    if (quantityDiscountPercentage !== undefined && (quantityDiscountPercentage < 0 || quantityDiscountPercentage > 100)) {
      return res.status(400).json({ message: "Le pourcentage doit être entre 0 et 100" });
    }
    if (freeDeliveryMinQuantity !== undefined && freeDeliveryMinQuantity < 1) {
      return res.status(400).json({ message: "La quantité minimale doit être au moins 1" });
    }
    if (defaultDeliveryFee !== undefined && defaultDeliveryFee < 0) {
      return res.status(400).json({ message: "Les frais de livraison ne peuvent pas être négatifs" });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }

    // Mise à jour des champs fournis
    if (quantityDiscountEnabled !== undefined) settings.quantityDiscountEnabled = quantityDiscountEnabled;
    if (quantityDiscountMinQuantity !== undefined) settings.quantityDiscountMinQuantity = quantityDiscountMinQuantity;
    if (quantityDiscountPercentage !== undefined) settings.quantityDiscountPercentage = quantityDiscountPercentage;
    if (freeDeliveryEnabled !== undefined) settings.freeDeliveryEnabled = freeDeliveryEnabled;
    if (freeDeliveryMinQuantity !== undefined) settings.freeDeliveryMinQuantity = freeDeliveryMinQuantity;
    if (defaultDeliveryFee !== undefined) settings.defaultDeliveryFee = defaultDeliveryFee;

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

