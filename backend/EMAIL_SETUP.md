# Configuration des Notifications Email

Ce guide vous explique comment configurer les notifications email pour recevoir un email à chaque nouvelle commande.

## Option 1: Gmail (Recommandé pour commencer)

### Étapes :

1. **Activez l'authentification à 2 facteurs** sur votre compte Gmail
   - Allez sur https://myaccount.google.com/security
   - Activez la "Validation en deux étapes"

2. **Générez un mot de passe d'application**
   - Allez sur https://myaccount.google.com/apppasswords
   - Sélectionnez "Autre (nom personnalisé)" et entrez "Homeva"
   - Copiez le mot de passe généré (16 caractères)

3. **Configurez le fichier `.env`** dans le dossier `backend/` :
   ```env
   EMAIL_USER=votre_email@gmail.com
   EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx  # Le mot de passe d'application (sans espaces)
   ADMIN_EMAIL=votre_email@gmail.com
   EMAIL_FROM=votre_email@gmail.com  # Ou "Homeva <votre_email@gmail.com>" pour afficher un nom
   ```

4. **Installez les dépendances** :
   ```bash
   cd backend
   npm install
   ```

5. **Redémarrez le serveur** pour que les changements prennent effet.

## Option 2: SMTP Personnalisé

Si vous utilisez un autre service email (Outlook, Yahoo, ou votre propre serveur SMTP) :

1. **Configurez le fichier `.env`** :
   ```env
   SMTP_HOST=smtp.votre-domaine.com
   SMTP_PORT=587
   SMTP_SECURE=false  # true pour 465 (SSL), false pour 587 (TLS)
   SMTP_USER=votre_email@votre-domaine.com
   SMTP_PASSWORD=votre_mot_de_passe
   ADMIN_EMAIL=votre_email@votre-domaine.com
   EMAIL_FROM=votre_email@votre-domaine.com  # Ou "Homeva <votre_email@votre-domaine.com>" pour afficher un nom
   ```

## Test

Après configuration, testez en passant une commande. Vous devriez recevoir un email avec tous les détails de la commande.

## Désactiver temporairement les emails

Si vous voulez désactiver les emails temporairement (pour continuer à travailler sans configurer Gmail) :

```env
EMAIL_DISABLED=true
```

Les commandes seront créées normalement, mais aucun email ne sera envoyé.

## Dépannage

- **Erreur d'authentification** : Vérifiez que vous utilisez un mot de passe d'application (pas votre mot de passe Gmail normal)
- **Email non reçu** : Vérifiez les logs du serveur pour voir les erreurs éventuelles
- **Spam** : Vérifiez votre dossier spam/courrier indésirable
- **Voir le guide complet** : Consultez `TROUBLESHOOTING_EMAIL.md` pour plus de détails

