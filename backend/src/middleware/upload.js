import multer from "multer";
import path from "path";

// Stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    );
  },
});

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
