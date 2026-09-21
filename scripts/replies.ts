// Affiche toutes ses réponses :  npm run replies
// (lit les variables Upstash dans .env.local ; sans elles, lit .data/replies.json)
import { days } from '../content/days.js'
import { formatLong } from '../shared/dates.js'
import { getStore } from '../server/store.js'

const replies = await getStore().getAll()
const dates = Object.keys(replies).sort()

if (!dates.length) {
  console.log('\nPas encore de réponse.\n')
} else {
  for (const date of dates) {
    const entry = days.find((d) => d.date === date)
    const r = replies[date]
    console.log(`\n── ${formatLong(date)} ${'─'.repeat(30)}`)
    if (entry) console.log(`toi   › ${entry.content.replace(/\s+/g, ' ').slice(0, 90)}…`)
    console.log(`elle  › ${r.text}`)
    console.log(`        (${new Date(r.updatedAt).toLocaleString('fr-FR')})`)
  }
  console.log(`\n${dates.length} réponse(s).\n`)
}
