import Product from "../models/Product.js";

// GET /api/products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Produit non trouvé" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// POST /api/products
export const addProduct = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;

    // Récupérer les fichiers uploadés
    const images = req.files?.map(file => `/uploads/${file.filename}`) || [];

    const product = new Product({
      name,
      price,
      description,
      category,
      images
    });

    await product.save();
    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({ message: "Erreur création produit", error: error.message });
  }
};

// PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    let updatedData = { ...req.body };

    // Si l'utilisateur upload de nouvelles images
    if (req.files && req.files.length > 0) {
      updatedData.images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!updatedProduct) return res.status(404).json({ message: "Produit non trouvé" });

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: "Erreur mise à jour produit", error: error.message });
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await Product.findByIdAndDelete(id);
    res.json({ message: "Produit supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

// Récupérer les produits d'une catégorie
export const getProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const products = await Product.find({ category: categoryId }).populate("category");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

