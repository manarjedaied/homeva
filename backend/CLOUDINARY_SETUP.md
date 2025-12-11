# Configuration Cloudinary

Ce projet utilise maintenant Cloudinary pour le stockage des images au lieu du stockage local.

## Configuration

1. Créez un compte sur [Cloudinary](https://cloudinary.com/) si vous n'en avez pas déjà un.

2. Dans votre tableau de bord Cloudinary, récupérez vos identifiants :
   - Cloud Name
   - API Key
   - API Secret

3. Ajoutez ces variables dans votre fichier `.env` :

```env
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

## Vérifier que Cloudinary fonctionne

### 1. Test de connexion

Exécutez le script de test pour vérifier la connexion :

```bash
npm run test:cloudinary
```

Ce script va :
- ✅ Vérifier que les variables d'environnement sont configurées
- ✅ Tester la connexion à Cloudinary
- ✅ Lister les images déjà uploadées dans le dossier `homeva`

### 2. Vérifier dans les logs du serveur

Lorsque vous uploadez une image, vous verrez dans la console :

```
✅ Configuration Cloudinary chargée avec succès
   Cloud Name: votre_cloud_name
✅ Image uploadée sur Cloudinary: https://res.cloudinary.com/...
📸 1 image(s) uploadée(s) avec succès sur Cloudinary
```

### 3. Vérifier dans le tableau de bord Cloudinary

1. Connectez-vous à [Cloudinary Dashboard](https://console.cloudinary.com/)
2. Allez dans l'onglet **Media Library**
3. Ouvrez le dossier `homeva`
4. Vous devriez voir toutes vos images uploadées

### 4. Vérifier dans la base de données

Les URLs des images dans MongoDB ressembleront maintenant à :
```
https://res.cloudinary.com/votre_cloud_name/image/upload/v1234567890/homeva/1234567890-987654321.jpg
```

Au lieu de :
```
/uploads/1234567890-987654321.jpg
```

## Supprimer le dossier uploads

**OUI, vous pouvez supprimer le dossier `uploads/`** une fois que :

1. ✅ Toutes vos images sont migrées vers Cloudinary
2. ✅ Vous avez testé que les nouvelles images s'uploadent bien sur Cloudinary
3. ✅ Les anciennes images dans la base de données pointent vers Cloudinary (ou vous les avez migrées)

**Pour supprimer :**
- Supprimez le dossier `backend/uploads/`
- Supprimez la ligne `app.use("/uploads", express.static("uploads"));` dans `server.js`

## Migration des images existantes

Si vous avez des images existantes stockées localement dans le dossier `uploads/`, vous devrez :

1. Les uploader manuellement sur Cloudinary via le tableau de bord
2. Mettre à jour les URLs dans votre base de données pour pointer vers les nouvelles URLs Cloudinary

Ou utiliser un script de migration pour automatiser ce processus.

## Notes

- Les images sont maintenant stockées dans le dossier `homeva` sur Cloudinary
- Les formats d'images supportés restent les mêmes (jpg, png, webp, gif, svg, bmp, tiff, ico, heic, heif, avif)
- Les URLs Cloudinary sont automatiquement générées et stockées dans la base de données
- Le frontend détecte automatiquement si l'URL est complète (Cloudinary) ou relative (local)

