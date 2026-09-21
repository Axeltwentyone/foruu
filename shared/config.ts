// Réglages de l'expérience. Ce fichier est visible côté navigateur : rien de secret ici.

export const CONFIG = {
  // Fuseau horaire de sa localisation. Le "jour" change à minuit dans CE fuseau.
  // Exemples : 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'
  timezone: 'America/New_York',

  // Premier et dernier jour (inclus), format AAAA-MM-JJ.
  start: '2026-09-21',
  end: '2026-12-31',

  sender: 'Ton amoureux',
} as const

export const INTROS = [
  "J'ai quelque chose pour toi.",
  'Viens voir.',
  "Je t'ai laissé un truc.",
  "Ce matin, j'ai pensé à toi.",
  'Pour toi, rien que pour toi.',
]
