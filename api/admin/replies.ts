import { days } from '../../content/days.js'
import type { AdminReplyItem } from '../../shared/types.js'
import { isAdminAuthed } from '../../server/adminAuth.js'
import { json } from '../../server/http.js'
import { getStore } from '../../server/store.js'

export async function GET(req: Request) {
  if (!isAdminAuthed(req)) return json({ error: 'unauthorized' }, 401)

  const replies = await getStore().getAll()

  const items: AdminReplyItem[] = Object.entries(replies)
    .map(([date, reply]) => ({
      date,
      reply,
      entryTitle: days.find((d) => d.date === date)?.title ?? null,
    }))
    .sort((a, b) => b.date.localeCompare(a.date))

  return json({ items })
}
