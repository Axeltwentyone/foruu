import { useState, type FormEvent } from 'react'
import { copy } from '@shared/copy'
import { api, ApiError } from '../lib/api'

export default function AdminGate({ onAuthed }: { onAuthed: () => void }) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!value.trim() || busy) return
    setBusy(true)
    setError(null)
    try {
      await api.adminLogin(value)
      onAuthed()
    } catch (err) {
      setBusy(false)
      setError(
        err instanceof ApiError && err.status === 429 ? 'Doucement. Réessaie un peu plus tard.' : copy.admin.error,
      )
      setValue('')
    }
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-8 pb-24">
      <p className="label mb-10">{copy.admin.kicker}</p>
      <form onSubmit={submit}>
        <label htmlFor="admin-pw" className="block font-display text-[2.6rem] leading-[1.1] sm:text-5xl">
          {copy.admin.prompt}
        </label>
        <input
          id="admin-pw"
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="current-password"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          autoFocus
          className="mt-8 block w-full border-0 border-b border-rule bg-transparent py-3 font-serif text-2xl outline-none transition-colors focus:border-accent"
        />
        <div className="mt-6 flex h-10 items-center justify-between">
          <p role="alert" className="font-serif text-xl text-accent">
            {error}
          </p>
          <button type="submit" className="quiet-button" disabled={busy || !value.trim()}>
            {copy.admin.button}
          </button>
        </div>
      </form>
    </div>
  )
}
