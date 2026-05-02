// import dotenv from 'dotenv';
// import crypto from 'crypto';

// dotenv.config();

// /**
//  * Service pour envoyer des événements à Meta Conversions API (CAPI)
//  * Documentation: https://developers.facebook.com/docs/marketing-api/conversions-api
//  */

// // Configuration Meta CAPI
// const META_PIXEL_ID = process.env.META_PIXEL_ID;
// const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
// const META_API_VERSION = process.env.META_API_VERSION || 'v21.0';
// const META_TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE; // Pour tester sans affecter les vraies conversions

// const META_CAPI_URL = `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events`;

// /**
//  * Hasher les données sensibles (email, téléphone) pour la privacy
//  * Meta recommande de hasher les données PII (Personally Identifiable Information)
//  */
// const hashData = (data) => {
//   if (!data) return null;
//   return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
// };

// /**
//  * Normaliser le numéro de téléphone pour Meta
//  */
// const normalizePhone = (phone) => {
//   if (!phone) return null;
//   // Enlever tous les caractères non numériques
//   const cleaned = phone.replace(/\D/g, '');
//   // Si le numéro commence par 0, le remplacer par l'indicatif du pays (ex: 216 pour Tunisie)
//   if (cleaned.startsWith('0')) {
//     return '216' + cleaned.substring(1);
//   }
//   return cleaned;
// };

// /**
//  * Obtenir les informations du client depuis la requête
//  * Meta CAPI nécessite des données pour le matching (email, phone, etc.)
//  */
// const getUserData = (req, order) => {
//   const userData = {
//     // Email (hashé)
//     em: order.clientEmail ? hashData(order.clientEmail) : null,
//     // Téléphone (hashé et normalisé)
//     ph: order.phone ? hashData(normalizePhone(order.phone)) : null,
//     // Prénom (hashé)
//     fn: order.clientName ? hashData(order.clientName.split(' ')[0]) : null,
//     // Nom (hashé)
//     ln: order.clientName ? hashData(order.clientName.split(' ').slice(1).join(' ')) : null,
//     // Ville
//     ct: order.ville ? hashData(order.ville.toLowerCase()) : null,
//     // Pays (par défaut Tunisie)
//     country: hashData('tunisia'),
//   };

//   // Enlever les valeurs null
//   Object.keys(userData).forEach(key => {
//     if (userData[key] === null) {
//       delete userData[key];
//     }
//   });

//   return userData;
// };

// /**
//  * Obtenir l'IP du client depuis la requête
//  */
// const getClientIP = (req) => {
//   return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
//          req.headers['x-real-ip'] ||
//          req.connection?.remoteAddress ||
//          req.socket?.remoteAddress ||
//          '0.0.0.0';
// };

// /**
//  * Obtenir le User-Agent depuis la requête
//  */
// const getUserAgent = (req) => {
//   return req.headers['user-agent'] || '';
// };

// /**
//  * Obtenir le fbp (Facebook Pixel cookie) depuis la requête
//  * Le frontend doit envoyer ce cookie dans les headers
//  */
// const getFbp = (req) => {
//   // Le frontend doit envoyer le cookie _fbp dans un header personnalisé
//   return req.headers['x-fbp'] || req.cookies?._fbp || null;
// };

// /**
//  * Obtenir le fbc (Facebook Click ID) depuis la requête
//  * Le frontend doit envoyer ce cookie dans les headers
//  */
// const getFbc = (req) => {
//   // Le frontend doit envoyer le cookie _fbc dans un header personnalisé
//   return req.headers['x-fbc'] || req.cookies?._fbc || null;
// };

// /**
//  * Envoyer un événement à Meta Conversions API
//  * @param {string} eventName - Nom de l'événement (Purchase, InitiateCheckout, etc.)
//  * @param {Object} order - Objet commande
//  * @param {Object} req - Requête Express (pour obtenir IP, User-Agent, etc.)
//  */
// export const sendMetaEvent = async (eventName, order, req = null) => {
//   try {
//     // Vérifier la configuration
//     if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
//       console.warn('⚠️  Meta CAPI non configuré. META_PIXEL_ID et META_ACCESS_TOKEN requis.');
//       return { success: false, error: 'Meta CAPI non configuré' };
//     }

//     // Données utilisateur pour le matching
//     const userData = getUserData(req, order);

//     // Si pas assez de données utilisateur, on ne peut pas envoyer l'événement
//     if (Object.keys(userData).length === 0) {
//       console.warn('⚠️  Pas assez de données utilisateur pour Meta CAPI');
//       return { success: false, error: 'Données utilisateur insuffisantes' };
//     }

//     // Préparer l'événement
//     const event = {
//       event_name: eventName,
//       event_time: Math.floor(new Date(order.createdAt || Date.now()).getTime() / 1000),
//       event_id: order._id?.toString() || `order_${Date.now()}`, // ID unique pour éviter les doublons
//       event_source_url: req?.headers?.referer || req?.headers?.origin || 'https://homeva.com',
//       action_source: 'website', // website, email, app, phone_call, etc.
//       user_data: userData,
//       custom_data: {
//         currency: 'TND', // Dinar tunisien
//         value: order.totalPrice || 0,
//         content_name: typeof order.product === 'object' ? order.product.name : 'Produit',
//         content_ids: [order.product?._id?.toString() || order.product?.toString() || ''],
//         content_type: 'product',
//         num_items: order.quantity || 1,
//       },
//     };

//     // Ajouter l'IP et User-Agent si disponibles
//     if (req) {
//       const clientIP = getClientIP(req);
//       const userAgent = getUserAgent(req);
      
//       if (clientIP && clientIP !== '0.0.0.0') {
//         event.user_data.client_ip_address = clientIP;
//       }
//       if (userAgent) {
//         event.user_data.client_user_agent = userAgent;
//       }

//       // Ajouter les cookies Facebook si disponibles
//       const fbp = getFbp(req);
//       const fbc = getFbc(req);
      
//       if (fbp) {
//         event.user_data.fbp = fbp;
//       }
//       if (fbc) {
//         event.user_data.fbc = fbc;
//       }
//     }

//     // Préparer la requête
//     const payload = {
//       data: [event],
//       access_token: META_ACCESS_TOKEN,
//     };

//     // Ajouter le test event code si en mode test
//     if (META_TEST_EVENT_CODE) {
//       payload.test_event_code = META_TEST_EVENT_CODE;
//       console.log('🧪 Mode TEST activé pour Meta CAPI');
//     }

//     // Envoyer à Meta
//     const response = await fetch(META_CAPI_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(payload),
//     });

//     const result = await response.json();

//     if (!response.ok) {
//       console.error('❌ Erreur Meta CAPI:', result);
//       return { success: false, error: result.error?.message || 'Erreur inconnue' };
//     }

//     console.log(`✅ Événement Meta CAPI envoyé: ${eventName}`, {
//       event_id: event.event_id,
//       events_received: result.events_received,
//     });

//     return { 
//       success: true, 
//       events_received: result.events_received,
//       messages: result.messages,
//     };

//   } catch (error) {
//     console.error('❌ Erreur lors de l\'envoi à Meta CAPI:', error.message);
//     return { success: false, error: error.message };
//   }
// };

// /**
//  * Envoyer un événement Purchase (achat complet)
//  */
// export const sendPurchaseEvent = async (order, req = null) => {
//   return await sendMetaEvent('Purchase', order, req);
// };

// /**
//  * Envoyer un événement InitiateCheckout (début du checkout)
//  */
// export const sendInitiateCheckoutEvent = async (order, req = null) => {
//   return await sendMetaEvent('InitiateCheckout', order, req);
// };

// /**
//  * Envoyer un événement AddToCart (ajout au panier)
//  */
// export const sendAddToCartEvent = async (order, req = null) => {
//   return await sendMetaEvent('AddToCart', order, req);
// };




