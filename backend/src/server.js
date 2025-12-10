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
app.use(cors());
app.use(express.json());

// Connexion DB
connectDB();

// Route test
app.get("/", (req, res) => {
  res.send("API Homeva fonctionne !");
});

// Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));


app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/uploads", express.static("uploads"));

