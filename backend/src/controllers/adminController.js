import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Login admin
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Admin non trouvé" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mot de passe incorrect" });

    // Access token
    const accessToken = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Refresh token
    const refreshToken = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Connexion réussie",
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Refresh token
export const refreshTokenAdmin = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(401).json({ message: "Refresh token manquant" });

  try {
    // Vérifie le refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Génère un nouveau access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: "Refresh token invalide ou expiré" });
  }
};

// Register admin
export const registerAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password)
      return res.status(400).json({ message: "Email et mot de passe requis" });

    const exists = await Admin.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Admin déjà existant" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({ email, password: hashedPassword });

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(201).json({
      message: "Admin créé",
      admin: { id: admin._id, email: admin.email },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Logout admin
export const logoutAdmin = (req, res) => {
  res.json({ message: "Déconnexion réussie" });
};
