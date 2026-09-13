# Lettre — page à usage unique

Une feuille de papier vieilli, du texte manuscrit qui apparaît doucement au scroll. Rien d'autre.

## Modifier le contenu

Tout est dans [src/content.js](src/content.js) — cherche les `[À REMPLACER]` :

- `date` — la date en haut de la lettre
- `salutation` — la formule d'appel
- `paragraphs` — un tableau de paragraphes, affichés dans l'ordre, qui apparaissent au fil du scroll
- `closing` — la phrase avant la signature
- `signature` — ton prénom

## Lancer en local

```bash
npm install
npm run dev
```

Ouvre l'URL affichée — teste sur ton téléphone en te connectant au même Wi-Fi (Vite affiche aussi une URL réseau type `http://192.168.x.x:5173`).

## Build de production

```bash
npm run build
```

Le résultat statique est généré dans `dist/`. `npm run preview` permet de le tester avant déploiement.

## Déployer

### Vercel
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```
Build command : `npm run build` — Publish directory : `dist`.

Ou glisse-dépose simplement le dossier `dist/` sur [app.netlify.com/drop](https://app.netlify.com/drop) pour un déploiement instantané sans compte.

## Générer le QR code

Une fois l'URL de déploiement obtenue :

```bash
npx qrcode "https://ton-url-ici.vercel.app" -o qrcode.png -w 1000
```

Génère un `qrcode.png` (1000×1000px) prêt à imprimer ou envoyer. Ou utilise n'importe quel générateur en ligne (ex. [qr-code-generator.com](https://www.qr-code-generator.com)).

## Confidentialité

La page n'est référencée nulle part (`meta robots: noindex, nofollow`) et n'a aucun lien vers un site principal — accessible uniquement via le lien/QR code direct.
# foruu
