import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuration du transporteur email
const createTransporter = () => {
  // Si SMTP personnalisé est configuré
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true', // true pour 465, false pour autres ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  
  // Sinon, utiliser Gmail (plus simple pour commencer)
  const emailUser = process.env.EMAIL_USER;
  let emailPassword = process.env.EMAIL_APP_PASSWORD;
  
  // Nettoyer le mot de passe d'application (enlever les espaces si présents)
  if (emailPassword) {
    emailPassword = emailPassword.replace(/\s/g, '');
  }
  
  if (!emailUser || !emailPassword) {
    throw new Error('EMAIL_USER et EMAIL_APP_PASSWORD doivent être définis dans .env');
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword, // Mot de passe d'application Gmail (16 caractères sans espaces)
    },
  });
};

// Template d'email pour nouvelle commande
const createOrderNotificationEmail = (order, product) => {
  const orderDate = new Date(order.createdAt).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const productName = typeof product === 'object' ? product.name : 'Produit';
  
  return {
    subject: `🛒 Nouvelle commande - ${productName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #8B6F47 0%, #A6895F 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .content {
            background: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
            border-top: none;
          }
          .info-section {
            background: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            border-left: 4px solid #8B6F47;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: bold;
            color: #666;
          }
          .value {
            color: #333;
          }
          .total {
            background: #8B6F47;
            color: white;
            padding: 15px;
            border-radius: 5px;
            margin-top: 15px;
            text-align: center;
            font-size: 1.2em;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🛒 Nouvelle Commande</h1>
          <p>Une nouvelle commande a été passée sur Homeva</p>
        </div>
        
        <div class="content">
          <div class="info-section">
            <h3 style="margin-top: 0; color: #8B6F47;">Informations Client</h3>
            <div class="info-row">
              <span class="label">Nom:</span>
              <span class="value">${order.clientName}</span>
            </div>
            <div class="info-row">
              <span class="label">Téléphone:</span>
              <span class="value">${order.phone}</span>
            </div>
            <div class="info-row">
              <span class="label">Adresse:</span>
              <span class="value">${order.address}</span>
            </div>
          </div>

          <div class="info-section">
            <h3 style="margin-top: 0; color: #8B6F47;">Détails de la Commande</h3>
            <div class="info-row">
              <span class="label">Produit:</span>
              <span class="value">${productName}</span>
            </div>
            <div class="info-row">
              <span class="label">Quantité:</span>
              <span class="value">${order.quantity}</span>
            </div>
            <div class="info-row">
              <span class="label">Date:</span>
              <span class="value">${orderDate}</span>
            </div>
            <div class="info-row">
              <span class="label">Statut:</span>
              <span class="value"><strong>${order.status}</strong></span>
            </div>
          </div>

          <div class="info-section">
            <h3 style="margin-top: 0; color: #8B6F47;">Détails de Prix</h3>
            ${order.unitPrice ? `
            <div class="info-row">
              <span class="label">Prix unitaire:</span>
              <span class="value">${order.unitPrice.toFixed(3)} د.ت</span>
            </div>
            ` : ''}
            ${order.productPromoPercentage && order.productPromoPercentage > 0 ? `
            <div class="info-row">
              <span class="label">Promo produit:</span>
              <span class="value">-${order.productPromoPercentage}%</span>
            </div>
            ` : ''}
            ${order.subtotal ? `
            <div class="info-row">
              <span class="label">Sous-total:</span>
              <span class="value">${order.subtotal.toFixed(3)} د.ت</span>
            </div>
            ` : ''}
            ${order.quantityDiscountPercentage && order.quantityDiscountPercentage > 0 ? `
            <div class="info-row">
              <span class="label">Remise quantité:</span>
              <span class="value">-${order.quantityDiscountPercentage}% (${order.quantityDiscountAmount?.toFixed(3) || 0} د.ت)</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="label">Frais de livraison:</span>
              <span class="value">${order.isFreeDelivery ? 'Gratuit' : `${order.deliveryFee?.toFixed(3) || 0} د.ت`}</span>
            </div>
          </div>

          <div class="total">
            Total: ${order.totalPrice?.toFixed(3) || 0} د.ت
          </div>
        </div>

        <div class="footer">
          <p>Cette notification a été envoyée automatiquement par le système Homeva.</p>
          <p>ID Commande: ${order._id}</p>
        </div>
      </body>
      </html>
    `,
    text: `
Nouvelle Commande - Homeva

Informations Client:
- Nom: ${order.clientName}
- Téléphone: ${order.phone}
- Adresse: ${order.address}

Détails de la Commande:
- Produit: ${productName}
- Quantité: ${order.quantity}
- Date: ${orderDate}
- Statut: ${order.status}

Détails de Prix:
${order.unitPrice ? `- Prix unitaire: ${order.unitPrice.toFixed(3)} د.ت` : ''}
${order.subtotal ? `- Sous-total: ${order.subtotal.toFixed(3)} د.ت` : ''}
${order.quantityDiscountPercentage && order.quantityDiscountPercentage > 0 ? `- Remise quantité: -${order.quantityDiscountPercentage}%` : ''}
- Frais de livraison: ${order.isFreeDelivery ? 'Gratuit' : `${order.deliveryFee?.toFixed(3) || 0} د.ت`}
- Total: ${order.totalPrice?.toFixed(3) || 0} د.ت

ID Commande: ${order._id}
    `,
  };
};

// Fonction pour envoyer une notification de nouvelle commande
export const sendOrderNotification = async (order) => {
  try {
    // Option pour désactiver les emails temporairement
    if (process.env.EMAIL_DISABLED === 'true') {
      console.log('📧 Emails désactivés (EMAIL_DISABLED=true). Notification non envoyée.');
      return { success: false, error: 'Emails désactivés' };
    }
    
    // Vérifier que l'email est configuré
    const recipientEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (!recipientEmail) {
      console.warn('⚠️  Email de notification non configuré. Définissez ADMIN_EMAIL ou EMAIL_USER dans .env');
      return { success: false, error: 'Email non configuré' };
    }

    // Vérifier que les credentials email sont configurés
    if (!process.env.SMTP_HOST && !process.env.EMAIL_USER) {
      console.warn('⚠️  Configuration email manquante. Définissez SMTP_HOST ou EMAIL_USER dans .env');
      return { success: false, error: 'Configuration email manquante' };
    }

    const transporter = createTransporter();
    
    // Le produit devrait déjà être populate depuis le contrôleur
    // Si ce n'est pas le cas, le récupérer
    let product = order.product;
    if (typeof product === 'string') {
      const OrderModel = (await import('../models/Order.js')).default;
      const orderWithProduct = await OrderModel.findById(order._id).populate('product');
      if (orderWithProduct) {
        product = orderWithProduct.product;
      }
    }

    const emailContent = createOrderNotificationEmail(order, product);

    // Format EMAIL_FROM : peut être juste l'email ou "Nom <email>"
    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@homeva.com';
    
    const mailOptions = {
      from: fromEmail,
      to: recipientEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de notification envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error.message);
    
    // Messages d'aide selon le type d'erreur
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      console.error('\n⚠️  ERREUR D\'AUTHENTIFICATION GMAIL:');
      console.error('1. Vérifiez que vous utilisez un MOT DE PASSE D\'APPLICATION (pas votre mot de passe Gmail)');
      console.error('2. Générez un nouveau mot de passe d\'application: https://myaccount.google.com/apppasswords');
      console.error('3. Assurez-vous que l\'authentification à 2 facteurs est activée');
      console.error('4. Le mot de passe doit être de 16 caractères (sans espaces)\n');
    }
    
    // Ne pas faire échouer la création de commande si l'email échoue
    return { success: false, error: error.message };
  }
};

