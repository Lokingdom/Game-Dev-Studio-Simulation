# Game Dev Studio Simulation

Corrections appliquées au projet pour permettre un lancement local minimal.

Ce que j'ai fait :
- Corrigé les chemins dans index.html :
  - stylesheet → ./styles.css
  - scripts → ./i18n.js et ./main.js
  - préchargements d'images → /assets/bg_level{1..5}_v4.svg
- Mis à jour styles.css pour utiliser /assets/bg_level1_v4.svg comme background par défaut.
- Ajouté 5 images SVG de remplacement dans public/assets/ (bg_level1_v4.svg → bg_level5_v4.svg). Ces SVG sont des placeholders graphiques simples pour éviter les erreurs 404.

Comment lancer en dev :

1) Installer les dépendances :

   npm install

2) Lancer le serveur Vite :

   npm run dev

Le serveur écoute par défaut sur le port configuré (script `dev` dans package.json). Si vous servez le dossier avec un autre serveur statique, assurez-vous que le dossier `public/` est servi à la racine (les assets sont référencés sous `/assets/...`).

Prochaines améliorations recommandées :
- Ajouter un README plus complet (features, contribution, licence). (J'ai ajouté ce README minimal.)
- Renommer le champ `name` dans package.json si nécessaire.
- Remplacer les SVG de placeholder par des vraies images JPG/PNG optimisées.

Si tu veux, je peux :
- déplacer les JS/CSS dans des dossiers js/ et css/ (et adapter les imports),
- ou bien laisser la structure actuelle et mettre à jour les imports comme fait ici.
