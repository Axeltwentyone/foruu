export type EntryType =
  | 'letter'
  | 'word'
  | 'line'
  | 'question'
  | 'quote'
  | 'memory'
  | 'photo'
  | 'voice'

export type RevealMode = 'lines' | 'words' | 'typing'

export interface Media {
  kind: 'image' | 'audio'
  /** Chemin dans /public, ex. "/media/k3x9.jpg" */
  src: string
  caption?: string
  alt?: string
}

export interface DayEntry {
  /** AAAA-MM-JJ */
  date: string
  type: EntryType
  /** Remplace la petite phrase d'introduction du jour. */
  intro?: string
  /** Petit libellé en capitales au-dessus du message. */
  label?: string
  title?: string
  /** Paragraphes séparés par une ligne vide. */
  content: string
  /** Pour "quote" : d'où vient la phrase. Pour "memory" : quand. */
  attribution?: string
  /** true = "— Axel", false = rien, texte = signature personnalisée. */
  signature?: boolean | string
  media?: Media | null
  /** Manière dont le texte apparaît. */
  reveal?: RevealMode
  /** Remplace "Et toi, tu me réponds quoi aujourd'hui ?" */
  replyPrompt?: string
}

export interface Reply {
  text: string
  /** URL de la photo qu'elle a jointe à sa réponse, s'il y en a une. */
  photo?: string
  createdAt: string
  updatedAt: string
}

export interface DaySummary {
  date: string
  hasReply: boolean
}

export type Phase = 'before' | 'running' | 'ended'

export interface StateResponse {
  today: string
  phase: Phase
  daysLeft: number
  days: DaySummary[]
}

export interface DayResponse {
  date: string
  entry: DayEntry | null
  reply: Reply | null
}
