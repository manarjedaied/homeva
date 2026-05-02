import DescImgProd from "../models/DescImgProd.js";
import { cloudinary } from "../config/cloudinary.js";
import Product from "../models/Product.js";

const safeJsonParse = (value, fallback = null) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeBool = (value) => value === true || value === "true";

// POST upload multiple images (admin)
export const uploadDescImg = async (req, res) => {
  try {
    const { productId, type, alt, caption, position, isMain, items } = req.body;

    if (!productId) return res.status(400).json({ message: "productId requis" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Produit introuvable" });

    const files = req.files || (req.file ? [req.file] : []);
    if (!files.length) return res.status(400).json({ message: "Fichier manquant" });

    const parsedItems = safeJsonParse(items, null);
    const sharedCaption = safeJsonParse(caption, null);
    const basePosition = position !== undefined && position !== null && position !== ""
      ? parseInt(position, 10)
      : 0;

    const docs = await Promise.all(
      files.map(async (file, index) => {
        const item = Array.isArray(parsedItems) ? (parsedItems[index] || {}) : {};

        const doc = new DescImgProd({
          productId,
          url: file.path || file.secure_url || file.url,
          public_id: file.filename || file.public_id || file.originalname,
          alt: item.alt ?? alt ?? "",
          caption: item.caption !== undefined ? item.caption : sharedCaption,
          type: item.type || type || "other",
          position: item.position !== undefined && item.position !== null && item.position !== ""
            ? parseInt(item.position, 10)
            : basePosition + index,
          isMain: item.isMain !== undefined ? normalizeBool(item.isMain) : normalizeBool(isMain) && index === 0,
          metadata: {
            width: file.width || null,
            height: file.height || null,
            size: file.size || null,
            format: file.mimetype ? file.mimetype.split('/').pop() : null
          },
          variants: {}
        });

        return doc.save();
      })
    );

    res.status(201).json({
      message: `${docs.length} image(s) ajoutée(s) avec succès`,
      count: docs.length,
      images: docs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur upload DescImgProd", error: error.message });
  }
};

// GET /products/:id/desc-imgs
export const getDescImgsByProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const imgs = await DescImgProd.find({ productId: id }).sort({ position: 1, createdAt: 1 });
    res.json(imgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH update fields
export const updateDescImg = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.position !== undefined) updates.position = parseInt(updates.position);
    if (updates.isMain !== undefined) updates.isMain = normalizeBool(updates.isMain);
    if (updates.caption) {
      updates.caption = safeJsonParse(updates.caption, updates.caption);
    }

    const updated = await DescImgProd.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: "DescImgProd non trouvé" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE including Cloudinary removal when possible
export const deleteDescImg = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await DescImgProd.findById(id);
    if (!doc) return res.status(404).json({ message: "DescImgProd non trouvé" });

    // Attempt Cloudinary deletion if public_id exists
    if (doc.public_id) {
      try {
        await cloudinary.uploader.destroy(doc.public_id, { resource_type: 'image' });
      } catch (e) {
        console.warn('Échec suppression Cloudinary', e.message);
      }
    }

    await DescImgProd.findByIdAndDelete(id);
    res.json({ message: "DescImgProd supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
