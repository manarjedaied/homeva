import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../utils/formatPrice";

declare global {
  interface Window {
    fbq?: (action: string, event: string, data?: Record<string, any>) => void;
  }
}

export const OrderSuccess: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const order = location.state as any;
useEffect(() => {
  if (window.fbq && order) {
    window.fbq("track", "Purchase", {
      value: order.totalPrice,
      currency: "TND",
      event_id: order._id.toString(),
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
        {/* ICON */}
        <div className="success-icon">✅</div>

        {/* TITLE */}
        <h1>{t("orders.thankYou")}</h1>

        {/* MESSAGE */}
        <p className="success-message">
          {t("orders.successMessage")}
        </p>

        {/* ORDER SUMMARY */}
        <div className="order-summary">
          <h3>🧾 {t("orders.orderSummary")}</h3>

          <div className="summary-row">
            <span>{t("orders.product")} :</span>
            <strong>{order.productName}</strong>
          </div>

          <div className="summary-row">
            <span>{t("orders.quantityLabel")} :</span>
            <strong>{order.quantity}</strong>
          </div>

          <div className="summary-row">
            <span>{t("orders.city")} :</span>
            <strong>{order.ville}</strong>
          </div>

          <div className="summary-row">
            <span>{t("orders.deliveryType")} :</span>
            <strong>{order.deliveryType}</strong>
          </div>

          <div className="summary-row total">
            <span>{t("orders.totalAmount")} :</span>
            <strong>{formatPrice(order.totalPrice)}</strong>
          </div>
        </div>

        {/* CONTACT */}
        <div className="contact-support">
          <p>📞 {t("orders.needHelp")}</p>

            <p>
            {t("orders.callUs")} :
            <strong
                style={{ direction: "ltr", unicodeBidi: "embed" }}
            >
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

        {/* CTA */}
        <button
          className="btn-back-home"
          onClick={() => navigate("/products")}
        >
          {t("orders.continueShopping")}
        </button>
      </div>
    </div>
  );
};
