import jwt from "jsonwebtoken";

export const refreshAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: "Refresh token manquant" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    req.admin = decoded; // Infos extraites du refresh token
    next();
  } catch (e) {
    return res.status(403).json({ message: "Refresh token invalide ou expiré" });
  }
};
