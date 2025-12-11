import dotenv from 'dotenv';
import { cloudinary } from '../config/cloudinary.js';

// Charger les variables d'environnement
dotenv.config();

/**
 * Test de connexion à Cloudinary
 * Vérifie si la configuration est correcte
 */
export const testCloudinaryConnection = async () => {
  try {
    console.log('🔍 Test de connexion à Cloudinary...');
    
    // Vérifier les variables d'environnement
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Variables Cloudinary manquantes dans .env');
      return false;
    }
    
    // Tester la connexion en récupérant les informations du compte
    const result = await cloudinary.api.ping();
    
    if (result.status === 'ok') {
      console.log('✅ Connexion à Cloudinary réussie!');
      console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
      
      // Lister les ressources dans le dossier homeva
      try {
        const resources = await cloudinary.api.resources({
          type: 'upload',
          prefix: 'homeva/',
          max_results: 10
        });
        
        console.log(`📁 ${resources.resources.length} image(s) trouvée(s) dans le dossier 'homeva'`);
        
        if (resources.resources.length > 0) {
          console.log('\n📸 Dernières images uploadées:');
          resources.resources.slice(0, 5).forEach((resource, index) => {
            console.log(`   ${index + 1}. ${resource.public_id}`);
            console.log(`      URL: ${resource.secure_url}`);
            console.log(`      Taille: ${(resource.bytes / 1024).toFixed(2)} KB`);
            console.log(`      Date: ${new Date(resource.created_at).toLocaleString()}\n`);
          });
        }
      } catch (err) {
        console.warn('⚠️  Impossible de lister les ressources:', err.message);
      }
      
      return true;
    } else {
      console.error('❌ Échec de la connexion à Cloudinary');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors du test de connexion:', error.message);
    return false;
  }
};

// Si le script est exécuté directement
if (process.argv[1] && process.argv[1].endsWith('testCloudinary.js')) {
  testCloudinaryConnection().then(success => {
    process.exit(success ? 0 : 1);
  });
}

