// Tous les petits textes de l'interface, au même endroit.

export const copy = {
  replyPrompt: "Et toi, tu me réponds quoi aujourd'hui ?",
  replyPromptPast: "Et toi, qu'est-ce que tu réponds ?",
  replyPlaceholder: 'Écris ici…',
  replyButton: 'Répondre',
  replySending: 'Envoi…',
  replySent: 'Reçu.',
  replyEdit: 'Modifier',
  replyError: "Ça n'est pas parti. Réessaie dans un instant.",
  addPhoto: 'Ajouter une photo',
  removePhoto: 'Retirer la photo',
  photoSending: 'Envoi de la photo…',
  photoConverting: 'Un instant…',
  photoTooBig: 'Cette photo est trop lourde (15 Mo max).',
  photoBadType: "Ce type de fichier n'est pas pris en charge.",
  yourReply: 'Ta réponse',
  history: 'Nos jours',
  historyToday: 'Aujourd’hui',
  skipHint: 'toucher pour continuer',
  before: (startLabel: string) => `Ça commence le ${startLabel}.`,
  ended: {
    title: 'Cette édition est terminée.',
    body: 'Les jours restent là, tous. Tu peux les relire quand tu veux.',
  },
  emptyDay: 'Rien ici pour ce jour-là.',
  locked: 'Pas encore.',
  counter: (n: number) => {
    if (n === 0) return 'Dernier jour de cette année.'
    if (n === 1) return 'Encore 1 jour ensemble cette année.'
    return `Encore ${n} jours ensemble cette année.`
  },
}
