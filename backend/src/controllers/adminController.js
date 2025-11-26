import Admin from "../models/Admin.js";

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Admin non trouvé" });
    }

    // Comparer mot de passe (ici simple égalité car pas de hash)
    if (admin.password !== password) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // Tout est ok
    res.json({ message: "Connexion réussie !" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
