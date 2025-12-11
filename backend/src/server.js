import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

dotenv.config();

// Vérifier que les variables d'environnement critiques sont chargées
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error("❌ ERREUR: JWT_SECRET ou JWT_REFRESH_SECRET manquant dans .env");
  console.error("Assurez-vous que le fichier .env existe dans le dossier backend/");
  console.error("Et qu'il contient JWT_SECRET et JWT_REFRESH_SECRET");
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error("❌ ERREUR: MONGO_URI manquant dans .env");
  process.exit(1);
}

console.log("✅ Variables d'environnement chargées avec succès");

const app = express();

// Middlewares
// Configuration CORS - permet toutes les origines en développement
// Pour la production, vous pouvez restreindre aux origines de votre frontend
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // '*' = toutes les origines, ou spécifiez votre URL frontend
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Connexion DB
connectDB();

// Route test
app.get("/", (req, res) => {
  res.send("API Homeva fonctionne !");
});

// Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 URL locale: http://localhost:${PORT}`);
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    console.log(`🌐 URL publique: https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
  }
});


app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/settings", settingsRoutes);
// Route statique pour les anciennes images locales (peut être supprimée après migration vers Cloudinary)
app.use("/uploads", express.static("uploads"));

