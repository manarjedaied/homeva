import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../utils/formatPrice";
import { Order } from "../types";

declare global {
  interface Window {
    fbq?: (action: string, event: string, data?: Record<string, any>) => void;
  }
}

export const OrderSuccess: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const order = location.state as Order | null;

  useEffect(() => {
    if (window.fbq && order) {
      // 🔹 Utiliser le même event_id envoyé au backend
      const eventId = order.event_id || order._id || `order_${Date.now()}`;

      window.fbq("track", "Purchase", {
        value: order.totalAmount,
        currency: "TND",
        event_id: eventId,
      });
    }
  }, [order]);

  if (!order) {
    navigate("/");
    return null;
  }

  return (
    <div className="order-success-page">
      <div className="order-success-card">
        <div className="success-icon">✅</div>
        <h1>{t("orders.thankYou")}</h1>
        <p className="success-message">{t("orders.successMessage")}</p>

        <div className="order-summary">
          <h3>🧾 {t("orders.orderSummary")}</h3>

          {order.products.map((p, idx) => (
            <div key={idx} className="summary-row">
              <span>{t("orders.product")} :</span>
              <strong>{p.productId}</strong>
            </div>
          ))}

          <div className="summary-row total">
            <span>{t("orders.totalAmount")} :</span>
            <strong>{formatPrice(order.totalAmount)}</strong>
          </div>
        </div>

        <div className="contact-support">
          <p>📞 {t("orders.needHelp")}</p>
          <p>
            {t("orders.callUs")} :
            <strong style={{ direction: "ltr", unicodeBidi: "embed" }}>
              +216 94877906
            </strong>
          </p>
          <a
            className="whatsapp-link"
            href="https://wa.me/21694877906"
            target="_blank"
            rel="noreferrer"
          >
            💬 {t("orders.contactWhatsapp")}
          </a>
        </div>

        <button className="btn-back-home" onClick={() => navigate("/products")}>
          {t("orders.continueShopping")}
        </button>
      </div>
    </div>
  );
};
