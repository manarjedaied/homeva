import multer from "multer";
import { storage } from "../config/cloudinary.js";

// Liste complète des images supportées
const allowedImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  "image/x-icon", // .ico
  "image/vnd.microsoft.icon",
  "image/heic",
  "image/heif",
  "image/avif"
];

// Filtre
const fileFilter = (req, file, cb) => {
  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format image non supporté"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
});
