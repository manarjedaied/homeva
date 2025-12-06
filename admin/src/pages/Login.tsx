import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminAPI } from "../services/api";
import Auth from "../utils/storage";

export const AdminLogin: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Mode dev – login statique
      const DEV_EMAIL = "admin@homeva.com";
      const DEV_PASSWORD = "admin123";

      if (
        import.meta.env.DEV &&
        email === DEV_EMAIL &&
        password === DEV_PASSWORD
      ) {
        Auth.setSession("dev_access", "dev_refresh");
        navigate("/admin");
        return;
      }

      // 🔥 Login API normal
      const response = await adminAPI.login(email, password);

      // Backend doit renvoyer :
      // { accessToken: "...", refreshToken: "..." }
      const { accessToken, refreshToken } = response as { accessToken: string; refreshToken: string };

      Auth.setSession(accessToken, refreshToken);

      navigate("/admin");
    } catch (err: any) {
      setError(err.message || t("admin.login.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <h1>{t("admin.login.title")}</h1>
          <p>{t("admin.login.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && <div className="admin-error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">{t("admin.login.email")}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t("admin.login.password")}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? t("common.loading") : t("admin.login.submit")}
          </button>
        </form>
      </div>
    </div>
  );
};
