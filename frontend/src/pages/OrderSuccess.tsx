import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../utils/formatPrice";

declare global {
  interface Window {
    fbq?: (action: string, event: string, data?: Record<string, any>) => void;
  }
}

type OrderSuccessState = {
  productName: string;
  quantity: number;
  totalPrice: number;
  phone: string;
  ville: string;
  deliveryType: string;
};

export const OrderSuccess: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const order = location.state as OrderSuccessState | null;

  // 🔹 Facebook Pixel Purchase
  useEffect(() => {
    if (window.fbq && order) {
      window.fbq("track", "Purchase", {
        value: order.totalPrice,
        currency: "TND",
      });
    }
  }, [order]);

  // 🔹 Sécurité si accès direct
  if (!order) {
    navigate("/products");
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

          <div className="summary-row">
            <span>{t("orders.product")} :</span>
            <strong>{order.productName}</strong>
          </div>

          <div className="summary-row">
            <span>{t("orders.quantity")} :</span>
            <strong>{order.quantity}</strong>
          </div>

          <div className="summary-row">
            <span>{t("orders.delivery")} :</span>
            <strong>{order.deliveryType}</strong>
          </div>

          <div className="summary-row total">
            <span>{t("orders.totalAmount")} :</span>
            <strong>{formatPrice(order.totalPrice)}</strong>
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
