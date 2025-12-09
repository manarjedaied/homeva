# Dépannage - Erreur d'authentification Gmail

## Erreur : "535-5.7.8 Username and Password not accepted"

Cette erreur signifie que Gmail refuse vos identifiants. Voici comment la résoudre :

### ✅ Solution étape par étape

#### 1. Vérifiez que l'authentification à 2 facteurs est activée

- Allez sur https://myaccount.google.com/security
- Vérifiez que "Validation en deux étapes" est **ACTIVÉE**
- Si ce n'est pas le cas, activez-la d'abord

#### 2. Générez un mot de passe d'application

**⚠️ IMPORTANT : Vous DEVEZ utiliser un mot de passe d'application, pas votre mot de passe Gmail normal !**

1. Allez sur https://myaccount.google.com/apppasswords
2. Si vous ne voyez pas cette page, activez d'abord l'authentification à 2 facteurs
3. Sélectionnez "Autre (nom personnalisé)" 
4. Entrez "Homeva" comme nom
5. Cliquez sur "Générer"
6. **Copiez le mot de passe de 16 caractères** (format : `xxxx xxxx xxxx xxxx`)

#### 3. Configurez votre fichier `.env`

Dans le fichier `backend/.env`, mettez :

```env
EMAIL_USER=votre_email@gmail.com
EMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
ADMIN_EMAIL=votre_email@gmail.com
EMAIL_FROM=votre_email@gmail.com
```

**⚠️ IMPORTANT :**
- Utilisez le mot de passe d'application de 16 caractères
- **Sans espaces** dans le `.env` (le code les enlève automatiquement)
- Exemple : `EMAIL_APP_PASSWORD=abcd efgh ijkl mnop` → le code utilisera `abcdefghijklmnop`

#### 4. Vérifiez votre configuration

Assurez-vous que :
- ✅ `EMAIL_USER` = votre adresse Gmail complète
- ✅ `EMAIL_APP_PASSWORD` = le mot de passe d'application (16 caractères)
- ✅ Pas d'espaces supplémentaires
- ✅ Pas de guillemets autour des valeurs

#### 5. Redémarrez le serveur

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez-le
npm run dev
```

### 🔍 Vérification

Pour tester si ça fonctionne, passez une commande. Si l'email est envoyé, vous verrez dans les logs :
```
✅ Email de notification envoyé: <message-id>
```

### ❌ Si ça ne fonctionne toujours pas

1. **Générez un nouveau mot de passe d'application** (supprimez l'ancien et créez-en un nouveau)
2. **Vérifiez que vous n'utilisez pas votre mot de passe Gmail normal**
3. **Vérifiez les logs** pour voir l'erreur exacte
4. **Essayez avec un autre compte Gmail** pour tester

### Alternative : Utiliser SMTP personnalisé

Si Gmail continue à poser problème, vous pouvez utiliser un autre service email avec SMTP :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre_email@gmail.com
SMTP_PASSWORD=votre_mot_de_passe_application
ADMIN_EMAIL=votre_email@gmail.com
EMAIL_FROM=votre_email@gmail.com
```

