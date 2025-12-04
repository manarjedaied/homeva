import Category from "../models/Category.js";

// Récupérer toutes les catégories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ajouter une catégorie (admin)
export const addCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const existing = await Category.findOne({ name });
    if (existing) return res.status(400).json({ message: "Catégorie déjà existante" });

    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une catégorie (admin)
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await Category.findByIdAndDelete(id);
    res.json({ message: "Catégorie supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
