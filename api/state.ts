import { CONFIG } from '../shared/config.js'
import { eachDay } from '../shared/dates.js'
import type { StateResponse } from '../shared/types.js'
import { daysLeft, getPhase, getToday } from '../server/clock.js'
import { json } from '../server/http.js'
import { getStore } from '../server/store.js'

export async function GET() {
  const today = getToday()
  let replies: Record<string, unknown> = {}
  try {
    replies = await getStore().getAll()
  } catch {
    // Le stockage peut être indisponible : l'expérience reste lisible.
  }

  const body: StateResponse = {
    today,
    phase: getPhase(today),
    daysLeft: daysLeft(today),
    days: eachDay(CONFIG.start, CONFIG.end).map((date) => ({ date, hasReply: date in replies })),
  }
  return json(body)
}
