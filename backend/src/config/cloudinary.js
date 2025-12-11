import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Vérification de la configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('⚠️  ATTENTION: Variables Cloudinary manquantes dans .env');
  console.warn('Les images ne pourront pas être uploadées sur Cloudinary');
  console.warn('Ajoutez CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans votre .env');
} else {
  console.log('✅ Configuration Cloudinary chargée avec succès');
  console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
}

export { cloudinary };

// Configuration du stockage Cloudinary pour Multer
export const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // Liste des formats d'images supportés
    const allowedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'tiff', 'ico', 'heic', 'heif', 'avif'];
    
    // Extraire l'extension du fichier
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    
    return {
      folder: 'homeva', // Dossier dans Cloudinary
      format: allowedFormats.includes(fileExtension) ? fileExtension : 'auto',
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      resource_type: 'auto', // Détecte automatiquement le type (image, video, etc.)
    };
  },
});

