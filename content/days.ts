// ============================================================================
// LE CONTENU DE CHAQUE JOUR — c'est ici que tu écris.
//
// Une entrée par jour, avec un helper selon le type :
//   letter(date, [paragraphes], options?)   → une lettre (titre, signature… en options)
//   word(date, "Mot.")                      → un seul mot, très grand
//   line(date, "Une phrase.")               → une phrase courte, en grand
//   question(date, "Une question ?")        → une question ; sa réponse est le cœur du jour
//   quote(date, "Une pensée.", "d'où")      → une pensée / citation personnelle
//
// Pour un souvenir, une photo ou une note vocale, écris l'objet complet :
//   { date, type: 'memory', attribution: 'Juin 2025', content: '…' }
//   { date, type: 'photo', content: 'Légende', media: { kind: 'image', src: '/media/k3x9-2f.jpg', alt: '…' } }
//   { date, type: 'voice', content: 'Écoute.', media: { kind: 'audio', src: '/media/k3x9-2f.m4a' } }
// (crée le dossier public/media/ et donne aux fichiers un nom difficile à deviner)
//
// Options utiles sur n'importe quel jour :
//   intro        → remplace la petite phrase d'ouverture ("J'ai quelque chose pour toi.")
//   reveal       → 'lines' | 'words' | 'typing' (manière dont le texte apparaît)
//   signature    → true = ton prénom, false = aucune, ou un texte (\n = retour à la ligne)
//   replyPrompt  → remplace "Et toi, tu me réponds quoi aujourd'hui ?"
//   label        → petit libellé au-dessus du message
//
// Le contenu reste côté serveur : rien n'est visible avant son jour.
// Le 22/09 est de toi ; le reste (dont la lettre d'ouverture du 21) est un BROUILLON à relire :
// remplace ce que tu veux par tes propres mots, jour après jour.
//
// Vérifier ce qu'il manque :  npm run check-content
// ============================================================================

import type { DayEntry } from '../shared/types.js'

type Extra = Partial<Omit<DayEntry, 'date' | 'type' | 'content'>>

const letter = (date: string, paragraphs: string[], extra: Extra = {}): DayEntry => ({
  date,
  type: 'letter',
  content: paragraphs.join('\n\n'),
  reveal: 'lines',
  ...extra,
})
const word = (date: string, content: string, extra: Extra = {}): DayEntry => ({
  date,
  type: 'word',
  content,
  reveal: 'typing',
  ...extra,
})
const line = (date: string, content: string, extra: Extra = {}): DayEntry => ({
  date,
  type: 'line',
  content,
  reveal: 'words',
  ...extra,
})
const question = (date: string, content: string, extra: Extra = {}): DayEntry => ({
  date,
  type: 'question',
  content,
  replyPrompt: 'Ta réponse',
  ...extra,
})
const quote = (date: string, content: string, attribution?: string, extra: Extra = {}): DayEntry => ({
  date,
  type: 'quote',
  content,
  attribution,
  ...extra,
})

export const days: DayEntry[] = [
  // ───────────── SEPTEMBRE ─────────────
  letter(
    '2026-09-21',
    [
      "Alors voilà, j'ai fait un truc pour toi. Pas une lettre qu'on lit une fois et qu'on range : un petit coin à nous, rien qu'à toi et moi.",
      "À partir d'aujourd'hui, je te laisse quelque chose chaque jour. Parfois une lettre, parfois juste un mot, une question, une pensée, une bêtise. Tu ne sauras jamais à l'avance, et c'est ça qui est bien.",
      "Chaque matin, quand tu te réveilles, il y aura un nouveau truc de ma part. Et en dessous, tu pourras me répondre, je lirai tout. Comme ça, même loin l'un de l'autre, on garde une vraie conversation.",
      "Je voulais que tu aies un petit rituel qui vienne de moi. Un truc qui te dit « il a pensé à moi aujourd'hui ». Et c'est vrai, je pense à toi tous les jours, pour de vrai.",
      "Tu me manques, mon petit bébé. Prépare-toi, il y aura des trucs sérieux, des trucs doux, et des trucs complètement random mdrr.",
      'À demain.',
    ],
    { title: 'Hello lovee', signature: 'Ton amoureuuxxxx\n17' },
  ),
  line('2026-09-22', "C'est comment ma petite ? bisous tu me manques love love"),
  question('2026-09-23', "Salut, je te manques ?"),
  word('2026-09-24', 'Fuck trump.'),
  letter('2026-09-25', [
    'Vendredi. Petit message sans occasion particulière.',
    "Cette semaine, chaque fois que ça devenait un peu lourd, j'ai pensé à toi et ça allait mieux. Pas de grande explication, c'est juste comme ça.",
    'Passe une belle journée, ma petite.',
  ]),
  quote('2026-09-26', 'Il y a des gens qui te font sentir chez toi, même de loin. Toi, tu es ça pour moi.'),
  letter('2026-09-27', [
    'Dimanche matin. Je prie pour toi.',
    "Pour que ta semaine soit douce, que tu sois fière de la femme que tu deviens, et que tu sentes que quelqu'un croit en toi, tout le temps.",
    'Que Dieu te garde. Je suis là.',
  ]),
  line('2026-09-28', 'Nouvelle semaine. Même équipe : toi et moi.'),
  question('2026-09-29', 'Si on pouvait se retrouver là, tout de suite, on ferait quoi en premier ? ( on allait se manger ) '),
  word('2026-09-30', 'Merci.'),

  // ───────────── OCTOBRE ─────────────
  letter('2026-10-01', [
    'Octobre. Déjà.',
    "Je ne compte pas les jours pour qu'ils passent vite. Je les compte parce que chacun est un jour de plus avec toi dans ma vie, et ça, j'y tiens.",
    'Bon mois, ma petite.',
  ]),
  line('2026-10-02', "Deux octobre, aout est loin hein bébé tchai."),
  question('2026-10-03', "ehhhh ? t'es ouuuuuuuuuuuuuuuu ?"),
  quote('2026-10-04', "Aimer, c'est aussi savoir attendre sans se perdre.", "Je l'ai appris avec toi, oui oh j'ai changé j'upgrade seulement"),
  letter('2026-10-05', [
    "Lundi. Je sais, personne n'aime les lundis.",
    "Alors voilà ta dose de courage : tu es plus forte que ta liste de choses à faire, tu es plus douée que tu le crois, et tu es beaucoup plus aimée que tu l'imagines.",
    'Et si ça ne va pas, tu me le dis. On règle ça ensemble. Ou au moins on en rigole, mdrrrr.',
  ]),
  word('2026-10-06', 'LOVE.'),
  line('2026-10-07', "Aujourd'hui, prends soin de toi. C'est un ordre de ton amoureux."),
  question('2026-10-08', "Qu'est-ce qui t'a fait sourire cette semaine ? Raconte-moi."),
  letter('2026-10-09', [
    'Vendredi. On a fait du chemin, toi et moi.',
    "Je suis fier de la manière dont on se parle, dont on se soutient quand l'un de nous va moins bien. Beaucoup de gens n'y arrivent pas. Nous, on y arrive parce qu'on le veut vraiment.",
    'Continuons comme ça.',
  ]),
  word('2026-10-10', 'Ensemble.'),
  letter('2026-10-11', [
    'Dimanche tranquille.',
    "J'ai envie de te faire les dinguerie tchai, depuis la le temps ne passe pas 11 octobre ? bref",
  ]),
  line('2026-10-12', 'Je n\'ai pas envie d\'aller au taff mais bon bref.'),
  line('2026-10-13', "Petit rappel du jour : t'es trop belle. C'est tout. Bonne journée."),
  question('2026-10-14', "Un mot pour décrire comment tu te sens aujourd'hui ?", { replyPrompt: 'Ton mot du jour' }),
  letter('2026-10-15', [
    "Je t'avais dit que j'avais envie de m'améliorer, pour toi, pour moi, pour nous.",
    "Je le pense toujours autant. Chaque jour j'essaie d'être un peu meilleur qu'hier, et tu es la raison pour laquelle je n'abandonne pas quand ça devient dur.",
    'Merci de croire en moi. Je vais tout faire pour que tu sois fière.',
  ]),
  line('2026-10-16', "Bon j'ai rien de spécial à dire aujourd'hui mais je pensais à toi donc voilà mdrr"),
  letter('2026-10-17', [
    "Samedi. J'espère que tu fais quelque chose qui te ressemble aujourd'hui.",
    'Sors, ris, mange quelque chose de bon. Profite. Et ce soir, si tu as un moment, raconte-moi tout.',
  ]),
  line('2026-10-18', 'Que Dieu nous garde toujours ensemble.'),
  question('2026-10-19', "Si tu pouvais me demander une seule chose aujourd'hui, ce serait quoi ?"),
  word('2026-10-20', 'Coucou.'),
  letter('2026-10-21', [
    'Un mois.',
    "Ça fait un mois que je te laisse un petit quelque chose chaque matin. Et je réalise que c'est devenu mon moment préféré : imaginer ta tête quand tu ouvres ça.",
    "J'espère que ça te fait sourire. Moi, en tout cas, j'adore le faire.",
  ]),
  question('2026-10-22', 'Pizza ou burger ? Réponds vite, ça décidera de tout.'),
  question('2026-10-23', "C'était quand, ton plus beau fou rire ? Je veux le revivre."),
  letter('2026-10-24', [
    'Je repense encore à ta lettre.',
    "À la façon dont tu écris, aux mots que tu as choisis, à l'odeur de ton parfum sur le papier. Je l'ai relue plus de fois que je ne veux l'avouer, not gonna lie.",
    "Merci de m'avoir écrit. Ça m'a fait un bien fou.",
  ]),
  word('2026-10-25', 'Bisous.'),
  line('2026-10-26', "Lundi. T'as mangé ? Non ? Va manger. Je t'attends."),
  quote('2026-10-27', "Je ne te promets pas une vie parfaite. Je te promets d'être là, à chaque fois.", 'Une promesse'),
  question('2026-10-28', "Qu'est-ce que je pourrais faire pour te rendre la vie un peu plus douce ?"),
  letter('2026-10-29', [
    'Petit moment de gratitude.',
    "Merci de me répondre, de me lire, de me supporter quand je suis dans mes phases. Merci d'être curieuse de ce que je t'écris chaque jour.",
    "Tu rends mes journées meilleures, c'est aussi simple que ça.",
  ]),
  line('2026-10-30', 'Demain, Halloween. Si tu te déguises, je veux une photo. Sinon, je veux quand même une photo.'),
  word('2026-10-31', 'Boo !', { intro: 'Attention. Ça fait peur.' }),

  // ───────────── NOVEMBRE ─────────────
  letter('2026-11-01', [
    'Novembre. Il fait plus froid, plus sombre, plus tôt.',
    "Mais toi, tu me tiens chaud, même de loin. C'est peut-être le meilleur truc que quelqu'un ait jamais fait pour moi.",
  ]),
  line('2026-11-02', 'Coucou, toi. Oui, toi.'),
  question('2026-11-03', "Si on écrivait un livre sur nous, il s'appellerait comment ?"),
  word('2026-11-04', 'Hello.'),
  letter('2026-11-05', [
    "Il y a des jours où je doute de moi. Tu le sais, tu l'as vu.",
    'Et dans ces jours-là, tu es celle qui me remet debout, sans faire de bruit, sans jugement. Tu me rappelles que je vaux mieux que ce que je pense.',
    "Je voulais te dire merci pour ça. Pas juste aujourd'hui : tout le temps.",
  ]),
  line('2026-11-06', 'Défi du jour : sourire à trois inconnus. Je veux un rapport détaillé ce soir.'),
  question('2026-11-07', 'Tu es plutôt du matin ou de la nuit ? (Spoiler : ça ne changera rien pour moi.)'),
  line('2026-11-08', "Dimanche. Grasse mat' obligatoire. Je te surveille."),
  letter('2026-11-09', [
    "Lundi. Pas de grande déclaration aujourd'hui.",
    "Juste un rappel : quoi qu'il arrive dans ta journée, il y a quelqu'un quelque part qui est de ton côté, sans condition. C'est moi.",
  ]),
  word('2026-11-10', 'Yo.'),
  question('2026-11-11', "Qu'est-ce qu'on doit absolument faire avant la fin de l'année, toi et moi ?"),
  line('2026-11-12', "Je n'ai pas grand-chose à dire aujourd'hui. Juste que je t'aime."),
  letter('2026-11-13', [
    'Vendredi 13. On ne va pas jouer les superstitieux.',
    "Avec toi, j'ai déjà eu plus de chance que je n'en mérite. Alors ce vendredi-là, je n'ai peur de rien.",
  ]),
  question('2026-11-14', 'Tu as pensé à moi ce matin ? Réponse honnête. (Je le saurai.)'),
  letter('2026-11-15', [
    'Dimanche. Je prie pour toi, comme souvent.',
    'Pour ta santé, ta paix, tes projets, ton sourire. Pour que tu ne portes jamais seule ce qui est trop lourd.',
    "Amen. Et je t'aime.",
  ]),
  word('2026-11-16', 'Câlin.'),
  question('2026-11-17', 'Dis-moi une chose que tu aimes chez toi. Une vraie, sans fausse modestie.'),
  line('2026-11-18', "Note à moi-même : dire à ma copine qu'elle est incroyable. C'est fait."),
  letter('2026-11-19', [
    "On est déjà bien avancés dans l'année.",
    "Et je réalise que t'écrire chaque jour est devenu quelque chose que j'attends autant que toi, peut-être plus. C'est mon petit rituel à moi aussi.",
    'Merci de le rendre vivant en me répondant.',
  ]),
  word('2026-11-20', 'Toc toc.'),
  question('2026-11-21', 'Une chanson qui te fait penser à nous ? Envoie-moi le titre.'),
  line('2026-11-22', "C'est ton anniversaire dans deux jours hein coucou"),
  line('2026-11-23', 'Demain, c\'est ton jour. Prépare-toi.'),
  letter(
    '2026-11-24',
    [
      "Aujourd'hui, c'est ton jour. Et je veux que tu le sentes dès le réveil : quelque part, quelqu'un est infiniment content que tu sois née.",
      "Merci d'être la personne que tu es. Douce, forte, patiente avec moi quand je ne le mérite pas, capable de me faire sourire même quand je n'en ai pas envie. Tu rends ma vie plus belle, et je ne te le dirai jamais assez.",
      "Je te souhaite une journée légère, pleine de gens qui t'aiment, de rires, de bonnes choses à manger et de tout ce que ton cœur désire. Je prie pour que Dieu te donne la santé, la paix et la joie, cette année et toutes celles qui viennent.",
      "Je ne suis pas à côté de toi aujourd'hui, mais je suis avec toi, vraiment. Et ce soir, si tu en as envie, raconte-moi tout.",
      "Je t'aime, mon amoureuse. Joyeux anniversaire.",
    ],
    { intro: 'Joyeux anniversaire, mon amoureuse.', signature: 'Ton amoureuuxxxx\n17' },
  ),
  question('2026-11-25', "Fuck thanksgiving hein tchai"),
  letter(
    '2026-11-26',
    [
      "Chez toi, c'est le jour où l'on dit merci. Alors moi aussi.",
      "Merci d'être entrée dans ma vie. Merci pour tes mots, ta patience, ton énergie, ton parfum sur une lettre, ta façon de me faire sentir que j'ai de la valeur.",
      'Si je devais garder une seule chose de cette année, ce serait toi. Passe une belle journée, et mange pour deux.',
    ],
    { intro: 'Joyeux Thanksgiving.' },
  ),
  line('2026-11-27', 'Black Friday. Si tu vois une bonne affaire, pense à ton amoureux. (Je plaisante. Presque.)'),
  question('2026-11-28', "Si tu devais m'écrire une lettre aujourd'hui, elle commencerait comment ?"),
  letter('2026-11-29', [
    'Dernier dimanche de novembre.',
    'Le mois passe vite, et pourtant chaque jour avec toi, même de loin, a un goût particulier. Je ne prends rien pour acquis.',
    'Bonne fin de week-end, ma petite.',
  ]),
  line('2026-11-30', 'Demain, décembre. Le mois où tout brille un peu plus. Toi, tu brilles déjà.'),

  // ───────────── DÉCEMBRE ─────────────
  letter('2026-12-01', [
    "Décembre. Le dernier mois de l'année.",
    "Je ne sais pas ce que la nouvelle année nous réserve, mais je sais avec qui je veux la traverser. Et c'est déjà beaucoup.",
    'Bon début de mois, mon amour.',
  ]),
  line('2026-12-02', "Il fait froid ? Habille-toi bien. Sinon je m'inquiète."),
  question('2026-12-03', "C'est quoi ton plat préféré pendant les fêtes ?"),
  word('2026-12-04', 'Chocolat chaud.'),
  letter('2026-12-05', [
    'Samedi. Je fais rien de spécial, et toi ?',
    'Raconte-moi ta journée en trois mots minimum. Je veux les détails, même les trucs nuls. Surtout les trucs nuls.',
  ]),
  question('2026-12-06', 'Petit test : si tu lis ça, réponds « présente ».', { replyPrompt: 'Présente ?' }),
  line('2026-12-07', "Lundi. J'ai un truc à te dire… non, en fait rien. Je voulais juste que tu sois curieuse. Bisous."),
  question('2026-12-08', "Si je pouvais t'offrir n'importe quoi, tu voudrais quoi ?"),
  word('2026-12-09', 'Pizza ?', { intro: 'Question importante.' }),
  letter('2026-12-10', [
    "Je commence à faire le bilan de l'année dans ma tête.",
    "Il y a eu des hauts, des bas, des doutes, des fous rires. Et au milieu de tout ça, toi, qui ne m'as jamais lâché.",
    "Si l'année devait s'arrêter ici, je serais déjà reconnaissant.",
  ]),
  line('2026-12-11', 'Vendredi ! Danse dans ta cuisine ou ton salon, même si personne ne regarde. Surtout si personne ne regarde.'),
  question('2026-12-12', "De quoi es-tu la plus fière cette année ?"),
  letter('2026-12-13', [
    "Dimanche. Merci à Dieu de t'avoir mise sur mon chemin.",
    "Je le pense vraiment : je ne crois pas aux hasards, et toi, tu n'en es pas un.",
    'Passe un dimanche paisible.',
  ]),
  word('2026-12-14', 'Bonjour.'),
  line('2026-12-15', 'Noël approche. Je te préviens : je vais t\'envoyer des câlins virtuels en quantité industrielle.'),
  question('2026-12-16', 'Pull de Noël moche : pour ou contre ?'),
  question('2026-12-17', "Si tu pouvais faire un vœu pour l'année prochaine, ce serait quoi ?"),
  letter('2026-12-18', [
    'Vendredi. Dernière ligne droite avant les fêtes.',
    "Je sais que cette période peut être fatigante, émotionnelle, parfois un peu nostalgique. Si tu as besoin de parler, de râler ou de ne rien dire du tout, je suis là.",
    'Prends soin de toi.',
  ]),
  word('2026-12-19', 'Neige ?'),
  letter('2026-12-20', [
    "Dimanche. Je pense aux gens que tu aimes, et à ceux qui t'aiment.",
    'Et les jours où tu te sens un peu seule, souviens-toi que je suis avec toi.',
  ]),
  line('2026-12-21', "C'est le jour le plus court de l'année. Avec toi, je parie qu'il dure plus longtemps."),
  question('2026-12-22', "Ton plus beau cadeau de Noël, c'était quoi ?"),
  word('2026-12-23', 'Presque.'),
  letter(
    '2026-12-24',
    [
      "Ce soir, tout le monde parle de cadeaux. Moi, je pense à celui que j'ai déjà reçu : toi.",
      'Je te souhaite une belle soirée, entourée de gens qui te font du bien, avec de la bonne nourriture et beaucoup de rires.',
      'Et quand tout sera calme, pense à moi une seconde. Moi, je penserai à toi bien plus longtemps.',
      "Joyeux réveillon, ma petite. Je t'aime.",
    ],
    { intro: 'Joyeux réveillon.' },
  ),
  letter(
    '2026-12-25',
    [
      'Joyeux Noël.',
      "Merci d'exister, d'être toi, de me choisir. Je te souhaite une journée douce, pleine de chaleur et de sourires.",
      'Que Dieu te bénisse, toi et ceux que tu aimes.',
    ],
    { intro: 'Joyeux Noël, ma petite.' },
  ),
  line('2026-12-26', 'Lendemain de fête. Repos autorisé. Câlins virtuels obligatoires.'),
  question('2026-12-27', "Qu'est-ce que tu retiens de cette année ?"),
  line('2026-12-28', "Ma résolution pour l'année prochaine : plus de rires, plus de câlins, plus de toi."),
  word('2026-12-29', 'Chut.'),
  letter('2026-12-30', [
    "Demain, c'est le dernier jour de l'année.",
    "Je t'ai laissé un petit message ce matin, comme chaque jour. Mais demain, j'ai quelque chose de plus à te dire. Tu verras.",
    'À demain, ma petite.',
  ]),
  letter(
    '2026-12-31',
    [
      "Voilà. Une année qui se termine, une autre qui commence, et moi qui suis là, à t'écrire depuis le début de la journée avec le sourire.",
      "Cette année, tu es devenue la personne la plus importante pour moi. Tu m'as fait grandir, tu m'as fait rire, tu m'as supporté dans mes moments de down, et tu m'as donné envie d'être meilleur, pour toi, pour moi, pour nous.",
      "Je ne sais pas ce que l'année prochaine nous réserve, mais je sais une chose : je veux la vivre avec toi. Je te souhaite la santé, la paix, la réussite et tout ce que ton cœur désire. Je te souhaite d'être fière de toi, comme je le suis de toi.",
      "Ce soir, à minuit, je penserai à toi, où que tu sois. Et si je pouvais te dire une seule chose, ce serait celle-ci : je t'aime. Vraiment. Pour toujours.",
      'Bonne année, ma petite.',
    ],
    { title: 'Bonne année, mon amour.', intro: "Dernier message de l'année.", signature: 'Ton amoureuuxxxx\n17' },
  ),
]
