# Nos jours

Un message par jour, du 21 septembre au 31 décembre. Chaque jour se débloque à minuit dans son fuseau horaire ; les jours futurs ne quittent jamais le serveur. C'est une PWA : elle peut l'ajouter à son écran d'accueil et recevoir une notification chaque jour.

## Écrire les jours

Tout est dans [content/days.ts](content/days.ts). Un objet par date, avec un `type` (`letter`, `word`, `line`, `question`, `quote`, `memory`, `photo`, `voice`) et des options (`intro`, `reveal`, `signature`, `replyPrompt`…). Les explications sont en tête du fichier.

```bash
npm run check-content   # jours sans contenu, [À REMPLACER] restants, photos manquantes
```

Photos et notes vocales : crée le dossier `public/media/` et dépose-y le fichier avec un nom difficile à deviner (ex. `k3x9-2f.jpg`), puis `media: { kind: 'image', src: '/media/k3x9-2f.jpg' }`.

Petits textes de l'interface : [shared/copy.ts](shared/copy.ts). Fuseau horaire, dates, prénom, phrases d'ouverture : [shared/config.ts](shared/config.ts).

Icône de l'app (écran d'accueil, notifications) : [public/icons/](public/icons/) — un simple pli de lettre généré par défaut, remplaçable par tes propres PNG en gardant les mêmes noms et tailles (192×192, 512×512, 512×512 « maskable »).

## Lancer en local

```bash
npm install
cp .env.example .env.local     # facultatif en local
npm run dev
```

Pour prévisualiser un autre jour, ajoute `FAKE_TODAY=2026-10-03` dans `.env.local` (ignoré en production) et relance.

Tester l'envoi de photo en local demande aussi `BLOB_READ_WRITE_TOKEN` dans `.env.local` (voir `.env.example`) : sans lui, seul le texte fonctionne. Les photos sont réduites côté navigateur (1920px max, ~1 Mo) avant d'être envoyées à notre fonction `/api/upload`, qui les transmet à Vercel Blob — donc même en dev, une vraie photo test atterrit dans le vrai store — supprimable depuis Vercel.

## Déployer (Vercel)

1. Pousse le dépôt sur GitHub et importe-le dans Vercel (preset Vite détecté).
2. Ajoute une base **Upstash Redis** gratuite (Vercel → Storage → Upstash) : elle fournit les variables de stockage pour ses réponses.
3. Ajoute aussi **Vercel Blob** (Vercel → Storage → Create Database → Blob, plan gratuit). **Choisis bien l'accès « Public »** à la création (pas « Private ») — ce réglage ne peut plus être changé ensuite, et les photos ne s'affichent que si le store est public. Vérifie que `BLOB_READ_WRITE_TOKEN` est bien ajoutée dans Environment Variables — sinon copie-la manuellement depuis l'onglet `.env.local` de la page du store.
4. Génère une paire de clés VAPID (une seule fois, sur ta machine) :
   ```bash
   npx web-push generate-vapid-keys
   ```
   Ajoute `VITE_VAPID_PUBLIC_KEY` et `VAPID_PRIVATE_KEY` dans Environment Variables (Production), et une valeur aléatoire pour `CRON_SECRET` (ex. `openssl rand -hex 24`).
5. Choisis un mot de passe pour la page admin et ajoute `ADMIN_PASSWORD` + `ADMIN_SESSION_SECRET` (une valeur aléatoire, ex. `openssl rand -hex 24`).
6. Déploie (ou redéploie), puis teste sur ton téléphone.

Sans Vercel Blob, elle peut quand même répondre par texte ; seul le bouton « Ajouter une photo » échouera. Sans les clés VAPID, le site fonctionne pareil ; seul le bouton « Me prévenir chaque jour » ne fera rien.

### Notifications push

Le cron `/api/cron/notify` (défini dans `vercel.json`) tourne une fois par jour et envoie une notification générique (« Il y a quelque chose pour toi aujourd'hui. », sans révéler le contenu) à tous les appareils abonnés. Réglages :

- **Heure d'envoi** : `vercel.json` → `crons[0].schedule`, en heure UTC. Calé par défaut sur 11h heure d'été (voir le commentaire dans `shared/config.ts`).
- **Sur iPhone**, les notifications web ne marchent que si le site a été ajouté à l'écran d'accueil (Safari → Partager → Sur l'écran d'accueil) — pas juste ouvert dans l'onglet Safari — et demandent iOS 16.4 ou plus récent. Le bouton affiche un rappel si ce n'est pas encore fait.
- **Sur le plan Hobby de Vercel**, un cron ne peut tourner qu'une fois par jour maximum — largement suffisant ici.

## Lire ses réponses

**Sur le site**, va sur `/#admin` — une page protégée par mot de passe (`ADMIN_PASSWORD`, différent du reste du site), avec toutes ses réponses et une case pour n'afficher que celles avec une photo. Aucun lien n'y mène depuis le reste de l'app : il faut taper l'adresse.

**En ligne de commande** :
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
- Quiconque a le lien peut aussi s'abonner aux notifications (même limite que pour lire/répondre : c'est le lien qui protège, pas un compte).
- La page `/#admin` (ses réponses) a son propre mot de passe (`ADMIN_PASSWORD`), séparé de tout le reste, avec un cookie de session (~90 jours) après connexion.
