import { useEffect, useState } from 'react'
import { CONFIG } from '@shared/config'
import { copy } from '@shared/copy'
import { formatLong } from '@shared/dates'
import type { AdminReplyItem } from '@shared/types'
import { api, ApiError } from '../lib/api'
import AdminGate from './AdminGate'

type Load = { s: 'loading' } | { s: 'gate' } | { s: 'error' } | { s: 'ready'; items: AdminReplyItem[] }

const stamp = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', {
    timeZone: CONFIG.timezone,
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function Admin({ onClose }: { onClose: () => void }) {
  const [load, setLoad] = useState<Load>({ s: 'loading' })
  const [photosOnly, setPhotosOnly] = useState(false)

  const fetchItems = () => {
    setLoad({ s: 'loading' })
    api
      .adminReplies()
      .then(({ items }) => setLoad({ s: 'ready', items }))
      .catch((e) => setLoad(e instanceof ApiError && e.status === 401 ? { s: 'gate' } : { s: 'error' }))
  }

  useEffect(fetchItems, [])

  if (load.s === 'loading') return <div className="min-h-[100dvh]" />
  if (load.s === 'gate') return <AdminGate onAuthed={fetchItems} />
  if (load.s === 'error') {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-8 pb-24">
        <p className="font-display text-4xl italic">Impossible de charger.</p>
        <button className="quiet-button mt-8 self-start" onClick={fetchItems}>
          Réessayer
        </button>
      </div>
    )
  }

  const items = photosOnly ? load.items.filter((i) => i.reply.photo) : load.items

  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-[34rem] px-7 pb-[max(6rem,env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-10 -mx-7 flex items-end justify-between bg-paper/80 px-7 pb-5 pt-[max(1.75rem,env(safe-area-inset-top))] backdrop-blur-md">
        <h1 className="font-display text-[3rem] italic leading-none">{copy.admin.title}</h1>
        <button className="quiet-button -mr-1" onClick={onClose}>
          {copy.admin.back}
        </button>
      </header>

      <label className="mt-4 flex items-center gap-2.5 font-body text-[1.4rem] text-mute">
        <input
          type="checkbox"
          checked={photosOnly}
          onChange={(e) => setPhotosOnly(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        {copy.admin.photosOnly}
      </label>

      {items.length === 0 ? (
        <p className="rise mt-16 font-display text-3xl italic text-mute">{copy.admin.empty}</p>
      ) : (
        <ol className="rise mt-8 space-y-14">
          {items.map(({ date, reply, entryTitle }) => (
            <li key={date} className="border-b border-rule/60 pb-14 last:border-0">
              <div className="flex items-baseline justify-between gap-4">
                <span className="label">{formatLong(date)}</span>
                <span className="label">{stamp(reply.updatedAt)}</span>
              </div>
              {entryTitle && <p className="mt-2 font-display text-xl italic text-mute">{entryTitle}</p>}

              {reply.photo && (
                <img
                  src={reply.photo}
                  alt=""
                  className="mt-5 max-h-[32rem] w-full rounded-[2px] border border-rule/60 object-cover"
                />
              )}
              {reply.text && (
                <p className="mt-5 whitespace-pre-wrap text-pretty font-serif text-[1.6rem] leading-[1.45] text-ink">
                  {reply.text}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
