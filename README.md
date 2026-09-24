# Nos jours

Un message par jour, du 21 septembre au 31 décembre. Chaque jour se débloque à minuit dans son fuseau horaire ; les jours futurs ne quittent jamais le serveur.

## Écrire les jours

Tout est dans [content/days.ts](content/days.ts). Un objet par date, avec un `type` (`letter`, `word`, `line`, `question`, `quote`, `memory`, `photo`, `voice`) et des options (`intro`, `reveal`, `signature`, `replyPrompt`…). Les explications sont en tête du fichier.

```bash
npm run check-content   # jours sans contenu, [À REMPLACER] restants, photos manquantes
```

Photos et notes vocales : crée le dossier `public/media/` et dépose-y le fichier avec un nom difficile à deviner (ex. `k3x9-2f.jpg`), puis `media: { kind: 'image', src: '/media/k3x9-2f.jpg' }`.

Petits textes de l'interface : [shared/copy.ts](shared/copy.ts). Fuseau horaire, dates, prénom, phrases d'ouverture : [shared/config.ts](shared/config.ts).

## Lancer en local

```bash
npm install
cp .env.example .env.local     # facultatif en local
npm run dev
```

Pour prévisualiser un autre jour, ajoute `FAKE_TODAY=2026-10-03` dans `.env.local` (ignoré en production) et relance.

Tester l'envoi de photo en local demande aussi `BLOB_READ_WRITE_TOKEN` dans `.env.local` (voir `.env.example`) : sans lui, seul le texte fonctionne. Les photos passent directement du navigateur vers Vercel Blob (pas de limite de taille de requête serverless à gérer), donc même en dev, une vraie photo test atterrit dans le vrai store — supprimable depuis Vercel.

## Déployer (Vercel)

1. Pousse le dépôt sur GitHub et importe-le dans Vercel (preset Vite détecté).
2. Ajoute une base **Upstash Redis** gratuite (Vercel → Storage → Upstash) : elle fournit les variables de stockage pour ses réponses.
3. Ajoute aussi **Vercel Blob** (Vercel → Storage → Blob → Create, plan gratuit) : elle fournit la variable `BLOB_READ_WRITE_TOKEN`, pour les photos qu'elle joint à ses réponses.
4. Déploie (ou redéploie), puis teste sur ton téléphone.

Sans Vercel Blob, elle peut quand même répondre par texte ; seul le bouton « Ajouter une photo » échouera.

## Lire ses réponses

```bash
npm run replies
```

Lit les variables Upstash de `.env.local` (copie-les depuis Vercel). Les photos jointes s'affichent comme un lien : ouvre-le pour la voir.

## Comment c'est protégé

Il n'y a plus de mot de passe : le lien (ou le QR code) suffit. Le lien reste privé (`noindex`, `no-referrer`, aucun lien vers ailleurs).

- Le contenu vit dans `content/`, importé uniquement par les fonctions `api/`. Il n'est pas dans le JavaScript envoyé au navigateur, et `/api/day` refuse (403) toute date postérieure à « aujourd'hui » dans le fuseau configuré.
- Quiconque a le lien peut lire les jours déjà débloqués et écrire une réponse : ne partage pas l'URL.
- Les photos/audios que tu ajoutes toi-même sont servis depuis `public/`. Leurs noms ne sont pas listés, mais quelqu'un qui connaît l'URL exacte peut les ouvrir.
- Les photos qu'elle envoie dans ses réponses sont stockées sur Vercel Blob, avec un nom aléatoire imprévisible ; personne ne peut les retrouver sans le lien exact.
