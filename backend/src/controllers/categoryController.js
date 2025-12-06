import Category, { createSlug } from "../models/Category.js";
import Product from "../models/Product.js";

// GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const filter = includeInactive ? {} : { isActive: true };

    const [categories, productCounts] = await Promise.all([
      Category.find(filter).sort({ createdAt: -1 }).lean(),
      Product.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ])
    ]);

    const countMap = productCounts.reduce((acc, item) => {
      if (!item._id) return acc;
      acc.set(item._id.toString(), item.count);
      return acc;
    }, new Map());

    const enriched = categories.map((category) => ({
      ...category,
      productCount: countMap.get(category._id.toString()) || 0
    }));

    res.json(enriched);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: error.message || "Erreur lors de la récupération des catégories" });
  }
};

// POST /api/categories
export const addCategory = async (req, res) => {
  const { name, description = "", isActive = true } = req.body;
  
  // Validation
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ message: "Le nom de la catégorie est requis" });
  }

  try {
    const trimmedName = name.trim();
    const slug = createSlug(trimmedName);
    
    // Vérifier si une catégorie avec le même nom ou slug existe déjà
    const existing = await Category.findOne({ 
      $or: [
        { name: trimmedName },
        { slug: slug }
      ]
    });
    if (existing) {
      return res.status(400).json({ message: "Catégorie déjà existante" });
    }

    const category = new Category({
      name: trimmedName,
      slug: slug,
      description: description || "",
      isActive: isActive !== undefined ? isActive : true
    });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    // Gestion des erreurs de validation Mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message).join(", ");
      return res.status(400).json({ message: messages });
    }
    // Gestion des erreurs de duplication (slug unique)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Une catégorie avec un nom similaire existe déjà" });
    }
    console.error("Error creating category:", error);
    res.status(500).json({ message: error.message || "Erreur lors de la création de la catégorie" });
  }
};

// PUT /api/categories/:id
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description, isActive } = req.body;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Catégorie introuvable" });
    }

    // Validation du nom si fourni
    if (name !== undefined) {
      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ message: "Le nom de la catégorie est requis" });
      }
      const trimmedName = name.trim();
      category.name = trimmedName;
      category.slug = createSlug(trimmedName);
    }
    if (typeof description === "string") category.description = description;
    if (typeof isActive === "boolean") category.isActive = isActive;

    await category.save();
    res.json(category);
  } catch (error) {
    // Gestion des erreurs de validation Mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message).join(", ");
      return res.status(400).json({ message: messages });
    }
    // Gestion des erreurs de duplication (slug unique)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Une catégorie avec un nom similaire existe déjà" });
    }
    console.error("Error updating category:", error);
    res.status(500).json({ message: error.message || "Erreur lors de la mise à jour de la catégorie" });
  }
};

// DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Catégorie introuvable" });
    }
    await category.deleteOne();
    res.json({ message: "Catégorie supprimée" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: error.message || "Erreur lors de la suppression de la catégorie" });
  }
};
