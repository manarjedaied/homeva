import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Initialiser SendGrid si la clé API est fournie
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Configuration du transporteur email
const createTransporter = (port = null, secure = null) => {
  // Options de connexion communes pour éviter les timeouts (optimisées pour Railway)
  const connectionOptions = {
    connectionTimeout: 15000, // 15 secondes pour établir la connexion
    greetingTimeout: 15000,   // 15 secondes pour le greeting SMTP
    socketTimeout: 15000,     // 15 secondes pour les opérations socket
    // Configuration TLS optimisée pour Railway
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1',
      ciphers: 'SSLv3'
    },
    // Options supplémentaires pour améliorer la compatibilité
    pool: false, // Désactiver le pool pour éviter les problèmes de connexion
    requireTLS: false, // Ne pas exiger TLS explicitement
    debug: process.env.EMAIL_DEBUG === 'true', // Activer le debug si nécessaire
  };

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
      ...connectionOptions,
    });
  }
  
  // Configuration Gmail
  const emailUser = process.env.EMAIL_USER;
  let emailPassword = process.env.EMAIL_APP_PASSWORD;
  
  // Nettoyer le mot de passe d'application (enlever les espaces si présents)
  if (emailPassword) {
    emailPassword = emailPassword.replace(/\s/g, '');
  }
  
  if (!emailUser || !emailPassword) {
    throw new Error('EMAIL_USER et EMAIL_APP_PASSWORD doivent être définis dans .env');
  }
  
  // Utiliser SMTP explicite pour Gmail (recommandé pour Railway et plus fiable)
  // Par défaut, essayer le port 587 (TLS), mais permettre de forcer 465 (SSL)
  const usePort465 = process.env.GMAIL_USE_SSL === 'true' || (port === 465);
  const smtpPort = port || (usePort465 ? 465 : 587);
  const smtpSecure = secure !== null ? secure : usePort465;
  
  console.log(`📧 Configuration SMTP Gmail: smtp.gmail.com:${smtpPort} (secure: ${smtpSecure})`);
  
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: smtpPort,
    secure: smtpSecure, // true pour 465 (SSL), false pour 587 (TLS)
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
    ...connectionOptions,
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

// Fonction pour envoyer via SendGrid (recommandé pour Railway)
const sendViaSendGrid = async (emailContent, recipients, fromEmail) => {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY non configuré');
  }

  // Améliorer la délivrabilité avec des en-têtes personnalisés
  const msg = {
    to: recipients, // SendGrid accepte un tableau d'emails
    from: {
      email: fromEmail.includes('<') ? fromEmail.match(/<(.+)>/)[1] : fromEmail,
      name: fromEmail.includes('<') ? fromEmail.match(/(.+)\s*</)[1].trim() : 'Homeva'
    },
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html,
    // Catégorie pour le tracking SendGrid
    categories: ['order-notification'],
    // En-têtes personnalisés pour améliorer la délivrabilité
    headers: {
      'X-Entity-Ref-ID': `order-${Date.now()}`,
      'List-Unsubscribe': `<mailto:${process.env.ADMIN_EMAIL}?subject=unsubscribe>`,
    },
    // Options de délivrabilité
    mailSettings: {
      // Désactiver le tracking de clics si nécessaire (peut aider avec certains filtres spam)
      clickTracking: {
        enable: false
      },
      // Activer le tracking d'ouverture
      openTracking: {
        enable: true
      }
    }
  };

  const response = await sgMail.send(msg);
  return { success: true, messageId: response[0]?.headers['x-message-id'] || 'sent' };
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
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (!adminEmail) {
      console.warn('⚠️  Email de notification non configuré. Définissez ADMIN_EMAIL ou EMAIL_USER dans .env');
      return { success: false, error: 'Email non configuré' };
    }

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
    
    // Construire la liste des destinataires (plusieurs emails supportés)
    const recipients = [adminEmail];
    
    // Ajouter ADMIN_EMAIL_2 si défini
    if (process.env.ADMIN_EMAIL_2) {
      recipients.push(process.env.ADMIN_EMAIL_2);
    }
    
    // Supprimer les doublons et les valeurs vides
    const uniqueRecipients = [...new Set(recipients.filter(email => email && email.trim()))];

    // PRIORITÉ 1: Utiliser SendGrid (recommandé pour Railway)
    if (!process.env.SENDGRID_API_KEY) {
      console.error('❌ SENDGRID_API_KEY non configuré dans .env');
      console.error('💡 Pour utiliser SendGrid:');
      console.error('   1. Créez un compte sur https://sendgrid.com');
      console.error('   2. Allez dans Settings → API Keys → Create API Key');
      console.error('   3. Copiez la clé et ajoutez-la dans .env: SENDGRID_API_KEY="votre_clé"');
      console.error('   4. Vérifiez votre email expéditeur dans SendGrid (Settings → Sender Authentication)');
      return { success: false, error: 'SENDGRID_API_KEY non configuré. Voir les instructions ci-dessus.' };
    }

    try {
      console.log('📧 Envoi de l\'email via SendGrid...');
      const result = await sendViaSendGrid(emailContent, uniqueRecipients, fromEmail);
      console.log('✅ Email envoyé avec succès via SendGrid!');
      console.log('📧 Destinataires:', uniqueRecipients.join(', '));
      return result;
    } catch (sendGridError) {
      console.error('❌ Erreur SendGrid:', sendGridError.message);
      
      // Si l'erreur est liée à l'authentification de l'expéditeur
      if (sendGridError.response?.body?.errors) {
        const errors = sendGridError.response.body.errors;
        const senderError = errors.find(e => e.message?.includes('sender') || e.message?.includes('from'));
        if (senderError) {
          console.error('💡 IMPORTANT: Vous devez vérifier votre email expéditeur dans SendGrid:');
          console.error('   → Allez dans SendGrid: Settings → Sender Authentication');
          console.error('   → Cliquez sur "Verify a Single Sender"');
          console.error('   → Entrez votre email:', fromEmail);
          console.error('   → Vérifiez l\'email reçu de SendGrid');
        }
      }
      
      if (sendGridError.message?.includes('API key') || sendGridError.message?.includes('Unauthorized')) {
        console.error('💡 IMPORTANT: Vérifiez votre clé API SendGrid:');
        console.error('   → Allez dans SendGrid: Settings → API Keys');
        console.error('   → Vérifiez que votre clé API est correcte');
        console.error('   → Assurez-vous que la clé a les permissions "Mail Send"');
      }
      
      // Fallback sur SMTP si configuré
      if (process.env.EMAIL_USER || process.env.SMTP_HOST) {
        console.warn('⚠️  Tentative de fallback sur SMTP...');
        // Continuer avec SMTP en fallback (code ci-dessous)
      } else {
        throw sendGridError;
      }
    }

    // PRIORITÉ 2: Fallback sur SMTP (Gmail) - seulement si SendGrid échoue et SMTP est configuré
    if (!process.env.SMTP_HOST && !process.env.EMAIL_USER) {
      return { success: false, error: 'Aucune méthode d\'envoi d\'email configurée' };
    }

    const mailOptions = {
      from: fromEmail,
      to: uniqueRecipients.join(', '), // Nodemailer accepte plusieurs emails séparés par des virgules
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    };

    // Essayer d'envoyer l'email avec retry et fallback sur différents ports
    // Commencer par 465 (SSL) car souvent mieux supporté sur Railway
    const portsToTry = [
      { port: 465, secure: true, name: 'SSL' },
      { port: 587, secure: false, name: 'TLS' }
    ];
    
    let lastError = null;
    
    for (const portConfig of portsToTry) {
      console.log(`🔄 Tentative d'envoi via port ${portConfig.port} (${portConfig.name})...`);
      
      // Créer un nouveau transporteur avec le port actuel
      let currentTransporter = createTransporter(portConfig.port, portConfig.secure);
      let retryCount = 0;
      const maxRetries = 1; // Réduire à 1 tentative par port pour passer plus vite au suivant
      let portSuccess = false;
      
      while (retryCount <= maxRetries && !portSuccess) {
        try {
          // Essayer d'envoyer l'email avec un timeout plus court
          const sendPromise = currentTransporter.sendMail(mailOptions);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('TIMEOUT')), 15000) // 15 secondes max par tentative
          );
          
          const info = await Promise.race([sendPromise, timeoutPromise]);
          
          console.log(`✅ Email de notification envoyé via port ${portConfig.port} (${portConfig.name}):`, info.messageId);
          console.log('📧 Destinataires:', uniqueRecipients.join(', '));
          
          // Fermer la connexion proprement
          if (currentTransporter.close) {
            currentTransporter.close();
          }
          
          portSuccess = true;
          return { success: true, messageId: info.messageId };
        } catch (sendError) {
          retryCount++;
          lastError = sendError;
          
          // Fermer la connexion en cas d'erreur
          if (currentTransporter.close) {
            try {
              currentTransporter.close();
            } catch (closeError) {
              // Ignorer les erreurs de fermeture
            }
          }
          
          const isTimeout = sendError.code === 'ETIMEDOUT' || 
                           sendError.code === 'ECONNRESET' || 
                           sendError.code === 'ESOCKETTIMEDOUT' ||
                           sendError.message === 'TIMEOUT';
          
          // Si c'est une erreur de timeout et qu'on n'a pas encore fait tous les essais
          if (isTimeout && retryCount <= maxRetries) {
            console.warn(`⚠️  Tentative ${retryCount}/${maxRetries + 1} échouée sur port ${portConfig.port} (${sendError.code || sendError.message}). Nouvelle tentative dans 1 seconde...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Recréer le transporteur pour une nouvelle connexion
            currentTransporter = createTransporter(portConfig.port, portConfig.secure);
            continue;
          }
          
          // Si toutes les tentatives ont échoué pour ce port
          if (retryCount > maxRetries) {
            console.warn(`❌ Échec sur le port ${portConfig.port} (${portConfig.name}) après ${maxRetries + 1} tentatives. Passage au port suivant...`);
            break; // Sortir de la boucle while pour essayer le port suivant
          }
        }
      }
      
      // Si on a réussi sur ce port, on ne continue pas
      if (portSuccess) {
        break;
      }
    }
    
    // Si tous les ports ont échoué, lancer la dernière erreur
    if (lastError) {
      throw lastError;
    }
    throw new Error('Échec de l\'envoi d\'email sur tous les ports');
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error.message);
    console.error('📋 Détails de l\'erreur:', {
      code: error.code,
      command: error.command,
      response: error.response,
    });
    
    // Ne pas faire échouer la création de commande si l'email échoue
    return { success: false, error: error.message };
  }
};

