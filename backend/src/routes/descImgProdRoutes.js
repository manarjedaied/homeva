import express from "express";
import { upload } from "../middleware/upload.js";
import { refreshAuth } from "../middleware/authMiddleware.js";
import {
  uploadDescImg,
  getDescImgsByProduct,
  updateDescImg,
  deleteDescImg
} from "../controllers/descImgProdController.js";

const router = express.Router();

// Admin upload multiple images in one request (multipart/form-data) -> field name 'files'
router.post("/", refreshAuth, upload.array('files', 20), uploadDescImg);

// Get images for a product (public)
router.get("/product/:id", getDescImgsByProduct);

// Update metadata
router.patch("/:id", refreshAuth, updateDescImg);

// Delete
router.delete("/:id", refreshAuth, deleteDescImg);

export default router;
