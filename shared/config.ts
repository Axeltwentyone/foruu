// Réglages de l'expérience. Ce fichier est visible côté navigateur : rien de secret ici.

export const CONFIG = {
  // Fuseau horaire de sa localisation. Le "jour" change à minuit dans CE fuseau.
  // Exemples : 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'
  timezone: 'America/New_York',

  // Premier et dernier jour (inclus), format AAAA-MM-JJ.
  start: '2026-09-21',
  end: '2026-12-31',

  sender: 'Ton amoureux',

  // Heure locale visée pour la notification quotidienne, à titre indicatif :
  // le cron qui l'envoie tourne à heure UTC fixe (vercel.json, "0 15 * * *"),
  // réglé pour tomber à 11h en heure d'été (EDT, jusqu'à début novembre).
  // Après le changement d'heure (retour à EST), elle arrivera vers 10h.
  // Change le cron pour ajuster.
  wakeHour: 11,
} as const

export const INTROS = [
  "J'ai quelque chose pour toi.",
  'Viens voir.',
  "Je t'ai laissé un truc.",
  "Ce matin, j'ai pensé à toi.",
  'Pour toi, rien que pour toi.',
]
