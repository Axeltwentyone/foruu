import { useRef, useState } from 'react'

const clock = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export default function Voice({ src }: { src: string }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const toggle = () => {
    const a = audio.current
    if (!a) return
    if (a.paused) void a.play()
    else a.pause()
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audio.current
    if (!a || !duration) return
    const r = e.currentTarget.getBoundingClientRect()
    a.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * duration
  }

  return (
    <div className="flex items-center gap-5">
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause' : 'Écouter'}
        className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-rule transition-colors hover:border-accent active:scale-95"
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <rect x="2" y="1" width="3.5" height="12" />
            <rect x="8.5" y="1" width="3.5" height="12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M3 1.2v11.6L12.6 7z" />
          </svg>
        )}
      </button>
      <div className="flex-1">
        <div onClick={seek} className="group flex h-6 cursor-pointer items-center">
          <div className="relative h-px w-full bg-rule">
            <div
              className="absolute inset-y-0 left-0 h-px bg-accent"
              style={{ width: duration ? `${(time / duration) * 100}%` : 0 }}
            />
          </div>
        </div>
        <p className="label mt-1">
          {clock(time)} {duration ? `/ ${clock(duration)}` : ''}
        </p>
      </div>
    </div>
  )
}
