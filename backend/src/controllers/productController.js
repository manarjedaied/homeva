import Product from "../models/Product.js";
import Order from "../models/Order.js";

// GET /api/products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    
    // Calculer le stock restant pour chaque produit
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        const productObj = product.toObject();
        
        // Calculer la quantité totale commandée (non annulée)
        const totalOrdered = await Order.aggregate([
          {
            $match: {
              product: product._id,
              status: { $ne: "Annulé" }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$quantity" }
            }
          }
        ]);
        
        const orderedQuantity = totalOrdered.length > 0 ? totalOrdered[0].total : 0;
        const remainingStock = product.stockTotal > 0 
          ? Math.max(0, product.stockTotal - orderedQuantity)
          : null;
        
        return {
          ...productObj,
          orderedQuantity,
          remainingStock
        };
      })
    );
    
    res.json(productsWithStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) return res.status(404).json({ message: "Produit non trouvé" });
    
    // Calculer le stock restant
    const totalOrdered = await Order.aggregate([
      {
        $match: {
          product: product._id,
          status: { $ne: "Annulé" }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" }
        }
      }
    ]);
    
    const orderedQuantity = totalOrdered.length > 0 ? totalOrdered[0].total : 0;
    const remainingStock = product.stockTotal > 0 
      ? Math.max(0, product.stockTotal - orderedQuantity)
      : null;
    
    const productObj = product.toObject();
    res.json({
      ...productObj,
      orderedQuantity,
      remainingStock
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Fonction helper pour parser les valeurs null
const parseNullableValue = (value) => {
  if (value === 'null' || value === null || value === undefined || value === '') {
    return null;
  }
  return value;
};

// POST /api/products
export const addProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      category,
      pourcentagePromo,
      stockLimite,
      stockTotal,
      quantityDiscountEnabled,
      quantityDiscountMinQuantity,
      quantityDiscountPercentage,
      freeDeliveryEnabled,
      freeDeliveryMinQuantity,
      customDeliveryFee
    } = req.body;

    // Images uploadées sur Cloudinary
    const images = req.files?.map(file => {
      const imageUrl = file.path; // URL Cloudinary complète
      console.log('✅ Image uploadée sur Cloudinary:', imageUrl);
      return imageUrl;
    }) || [];
    
    if (images.length > 0) {
      console.log(`📸 ${images.length} image(s) uploadée(s) avec succès sur Cloudinary`);
    }

    const product = new Product({
      name,
      price,
      description,
      category,
      pourcentagePromo,
      stockLimite,
      stockTotal: stockTotal ? parseInt(stockTotal) : 0,
      images,
      // Paramètres de remise et livraison
      quantityDiscountEnabled: parseNullableValue(quantityDiscountEnabled) === 'true' ? true : parseNullableValue(quantityDiscountEnabled) === 'false' ? false : null,
      quantityDiscountMinQuantity: parseNullableValue(quantityDiscountMinQuantity) ? parseInt(quantityDiscountMinQuantity) : null,
      quantityDiscountPercentage: parseNullableValue(quantityDiscountPercentage) ? parseFloat(quantityDiscountPercentage) : null,
      freeDeliveryEnabled: parseNullableValue(freeDeliveryEnabled) === 'true' ? true : parseNullableValue(freeDeliveryEnabled) === 'false' ? false : null,
      freeDeliveryMinQuantity: parseNullableValue(freeDeliveryMinQuantity) ? parseInt(freeDeliveryMinQuantity) : null,
      customDeliveryFee: parseNullableValue(customDeliveryFee) ? parseFloat(customDeliveryFee) : null
    });

    await product.save();
    const savedProduct = await product.populate("category");
    
    // Pour un nouveau produit, stock restant = stock total
    const productObj = savedProduct.toObject();
    res.status(201).json({
      ...productObj,
      orderedQuantity: 0,
      remainingStock: product.stockTotal > 0 ? product.stockTotal : null
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'upload sur Cloudinary:', error);
    res.status(500).json({ message: "Erreur création produit", error: error.message });
  }
};

// PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    let updatedData = {
      ...req.body
    };

    // Convertir stockTotal en nombre si fourni
    if (updatedData.stockTotal !== undefined) {
      updatedData.stockTotal = parseInt(updatedData.stockTotal) || 0;
    }

    // Parser les paramètres de remise et livraison
    if (updatedData.quantityDiscountEnabled !== undefined) {
      updatedData.quantityDiscountEnabled = parseNullableValue(updatedData.quantityDiscountEnabled) === 'true' ? true : parseNullableValue(updatedData.quantityDiscountEnabled) === 'false' ? false : null;
    }
    if (updatedData.quantityDiscountMinQuantity !== undefined) {
      updatedData.quantityDiscountMinQuantity = parseNullableValue(updatedData.quantityDiscountMinQuantity) ? parseInt(updatedData.quantityDiscountMinQuantity) : null;
    }
    if (updatedData.quantityDiscountPercentage !== undefined) {
      updatedData.quantityDiscountPercentage = parseNullableValue(updatedData.quantityDiscountPercentage) ? parseFloat(updatedData.quantityDiscountPercentage) : null;
    }
    if (updatedData.freeDeliveryEnabled !== undefined) {
      updatedData.freeDeliveryEnabled = parseNullableValue(updatedData.freeDeliveryEnabled) === 'true' ? true : parseNullableValue(updatedData.freeDeliveryEnabled) === 'false' ? false : null;
    }
    if (updatedData.freeDeliveryMinQuantity !== undefined) {
      updatedData.freeDeliveryMinQuantity = parseNullableValue(updatedData.freeDeliveryMinQuantity) ? parseInt(updatedData.freeDeliveryMinQuantity) : null;
    }
    if (updatedData.customDeliveryFee !== undefined) {
      updatedData.customDeliveryFee = parseNullableValue(updatedData.customDeliveryFee) ? parseFloat(updatedData.customDeliveryFee) : null;
    }

    // Si nouvelles images uploadées sur Cloudinary
    if (req.files && req.files.length > 0) {
      updatedData.images = req.files.map(file => {
        const imageUrl = file.path; // URL Cloudinary complète
        console.log('✅ Image uploadée sur Cloudinary:', imageUrl);
        return imageUrl;
      });
      console.log(`📸 ${req.files.length} nouvelle(s) image(s) uploadée(s) avec succès sur Cloudinary`);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    ).populate("category");

    if (!updatedProduct) return res.status(404).json({ message: "Produit non trouvé" });

    // Calculer le stock restant
    const totalOrdered = await Order.aggregate([
      {
        $match: {
          product: updatedProduct._id,
          status: { $ne: "Annulé" }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" }
        }
      }
    ]);
    
    const orderedQuantity = totalOrdered.length > 0 ? totalOrdered[0].total : 0;
    const remainingStock = updatedProduct.stockTotal > 0 
      ? Math.max(0, updatedProduct.stockTotal - orderedQuantity)
      : null;
    
    const productObj = updatedProduct.toObject();
    res.json({
      ...productObj,
      orderedQuantity,
      remainingStock
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'upload sur Cloudinary:', error);
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

// GET products by category
export const getProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const products = await Product.find({ category: categoryId }).populate("category");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
