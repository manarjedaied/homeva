# Guide de déploiement sur Railway

Ce guide vous explique comment déployer le backend sur Railway.

## 📋 Prérequis

1. Un compte Railway (gratuit) : [railway.app](https://railway.app)
2. Un compte MongoDB Atlas (gratuit) : [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
3. Un compte Cloudinary (gratuit) : [cloudinary.com](https://cloudinary.com)
4. Votre code backend prêt dans un dépôt Git (GitHub, GitLab, etc.)

## 🚀 Étapes de déploiement

### Étape 1 : Préparer votre code

1. **Assurez-vous que votre code est sur GitHub/GitLab**
   - Créez un dépôt si nécessaire
   - Poussez votre code backend

2. **Vérifiez que `.gitignore` contient `.env`** (déjà fait ✅)

### Étape 2 : Créer un projet sur Railway

1. Allez sur [railway.app](https://railway.app)
2. Cliquez sur **"Start a New Project"**
3. Choisissez **"Deploy from GitHub repo"** (ou GitLab)
4. Sélectionnez votre dépôt
5. Railway détectera automatiquement que c'est un projet Node.js

### Étape 3 : Configurer les variables d'environnement

Dans Railway, allez dans l'onglet **"Variables"** et ajoutez toutes ces variables :

#### Variables obligatoires :

```env
# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT Secrets
JWT_SECRET=votre_secret_jwt_super_securise
JWT_REFRESH_SECRET=votre_refresh_secret_super_securise

# Cloudinary
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

#### Variables optionnelles :

```env
# Port (Railway le définit automatiquement, mais vous pouvez le laisser)
PORT=5000

# Email (si vous utilisez nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app
```

### Étape 4 : Configurer MongoDB Atlas

1. Créez un cluster gratuit sur MongoDB Atlas
2. Créez un utilisateur avec un mot de passe
3. Ajoutez l'IP `0.0.0.0/0` dans "Network Access" (pour permettre Railway)
4. Copiez la connection string et remplacez `<password>` et `<dbname>`
5. Collez-la dans `MONGO_URI` sur Railway

### Étape 5 : Déployer

1. Railway va automatiquement détecter votre `package.json`
2. Il va installer les dépendances avec `npm install`
3. Il va lancer votre app avec `npm start`
4. Votre backend sera déployé ! 🎉

### Étape 6 : Obtenir l'URL de votre API

1. Dans Railway, allez dans l'onglet **"Settings"**
2. Cliquez sur **"Generate Domain"** pour obtenir une URL publique
3. Votre API sera accessible sur : `https://votre-projet.railway.app`

## 🔧 Configuration CORS (Important pour le frontend)

Par défaut, CORS est configuré pour accepter toutes les origines. Pour la production, vous pouvez restreindre aux origines de votre frontend en modifiant `server.js` (voir section "Modifications optionnelles").

## ✅ Vérification

1. Visitez `https://votre-projet.railway.app` → Vous devriez voir "API Homeva fonctionne !"
2. Testez une route : `https://votre-projet.railway.app/api/products`
3. Vérifiez les logs dans Railway pour voir si tout fonctionne

## 🔄 Mises à jour

À chaque push sur votre branche principale, Railway redéploiera automatiquement votre application.

## 📝 Notes importantes

- Railway fournit automatiquement le PORT via `process.env.PORT` ✅
- Les variables d'environnement sont sécurisées dans Railway
- Les logs sont disponibles dans l'onglet "Deployments" → "View Logs"
- Railway offre un plan gratuit avec des limites (500 heures/mois)

## 🆘 Dépannage

### L'application ne démarre pas
- Vérifiez les logs dans Railway
- Vérifiez que toutes les variables d'environnement sont définies
- Vérifiez que MongoDB Atlas autorise les connexions depuis Railway

### Erreur de connexion MongoDB
- Vérifiez que l'IP `0.0.0.0/0` est dans Network Access
- Vérifiez que le mot de passe dans MONGO_URI est correct
- Vérifiez que le nom de la base de données est correct

### Erreur Cloudinary
- Vérifiez que les 3 variables Cloudinary sont définies
- Vérifiez les logs pour voir quelle variable manque

