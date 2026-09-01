import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { m } from 'motion/react'
import { PauseIcon } from '@phosphor-icons/react/dist/csr/Pause'
import { PlayIcon } from '@phosphor-icons/react/dist/csr/Play'
import { SkipForwardIcon } from '@phosphor-icons/react/dist/csr/SkipForward'
import PageHeader from '../components/PageHeader'
import { getSessionRoutine, logSession, sessionRoutines, sessionStreak } from '../utils/sessions'
import { usePageMeta } from '../hooks/usePageMeta'

function formatClock(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const RING = 2 * Math.PI * 54

/** Guided detailing session — a workout app for your car. */
export default function SessionPage() {
  usePageMeta(
    'Guided Session',
    'Step-by-step guided detailing with stage cues, timers and streak tracking — a workout app for your car.'
  )

  const [routineId, setRoutineId] = useState(null)
  const routine = routineId ? getSessionRoutine(routineId) : null

  const [stepIndex, setStepIndex] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const intervalRef = useRef(null)

  const streak = useMemo(() => sessionStreak(), [routineId])

  const start = (id) => {
    setRoutineId(id)
    setStepIndex(0)
    setRemaining(getSessionRoutine(id).steps[0].seconds)
    setRunning(true)
    setDone(false)
  }

  const advance = () => {
    if (!routine) return
    const next = stepIndex + 1
    if (next >= routine.steps.length) {
      finish()
    } else {
      setStepIndex(next)
      setRemaining(routine.steps[next].seconds)
    }
  }

  const finish = () => {
    setRunning(false)
    setDone(true)
    if (routineId) logSession(routineId)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  useEffect(() => {
    if (!running || !routine) return
    intervalRef.current = setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          advance()
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, stepIndex, routine])

  const step = routine?.steps[stepIndex]
  const progress = step ? 1 - remaining / step.seconds : 0

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Guided Session' }]}
        title="Guided Session"
        subtext="Pick a routine and the studio walks you through it — timed stages, technique cues, and a streak to keep honest."
      />

      <div className="mx-auto max-w-2xl px-6 py-14 md:py-20">
        {/* Routine picker */}
        {!routine && (
          <ul className="space-y-4">
            {sessionRoutines.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => start(entry.id)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-5 text-left transition-colors hover:border-zinc-900 dark:hover:border-white"
                >
                  <span>
                    <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {entry.title}
                    </span>
                    <span className="mt-1 block text-sm text-zinc-800 dark:text-zinc-300">
                      {entry.steps.length} stages ·{' '}
                      {formatClock(entry.steps.reduce((total, s) => total + s.seconds, 0))}
                    </span>
                  </span>
                  <PlayIcon
                    size={18}
                    weight="fill"
                    className="shrink-0 text-zinc-900 dark:text-zinc-100"
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Active session */}
        {routine && step && !done && (
          <m.div
            key={stepIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex flex-col items-center text-center"
          >
            <p
              aria-live="polite"
              className="text-xs font-medium tracking-[0.25em] text-zinc-800 dark:text-zinc-300 uppercase"
            >
              {routine.title} · Stage {stepIndex + 1} of {routine.steps.length}
            </p>

            {/* Progress ring */}
            <div
              className="relative mt-8"
              role="timer"
              aria-label={`${formatClock(remaining)} remaining`}
            >
              <svg width="140" height="140" viewBox="0 0 120 120" aria-hidden="true">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  strokeWidth="6"
                  className="stroke-zinc-200 dark:stroke-zinc-800"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className="stroke-zinc-900 dark:stroke-white"
                  strokeDasharray={RING}
                  strokeDashoffset={RING * (1 - progress)}
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                />
              </svg>
              <span className="font-display absolute inset-0 flex items-center justify-center text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                {formatClock(remaining)}
              </span>
            </div>

            <h2 className="font-display mt-8 text-2xl font-bold tracking-[0.04em] uppercase text-zinc-900 dark:text-zinc-100">
              {step.name}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-800 dark:text-zinc-300">
              {step.cue}
            </p>

            <div className="mt-8 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setRunning((value) => !value)}
                aria-label={running ? 'Pause session' : 'Resume session'}
                className="flex cursor-pointer items-center justify-center rounded-full bg-zinc-900 dark:bg-white p-4 text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                {running ? (
                  <PauseIcon size={20} weight="fill" />
                ) : (
                  <PlayIcon size={20} weight="fill" />
                )}
              </button>
              <button
                type="button"
                onClick={advance}
                className="flex cursor-pointer items-center gap-2 border border-zinc-300 dark:border-zinc-700 px-6 py-3.5 text-xs font-semibold tracking-[0.2em] text-zinc-900 dark:text-zinc-100 uppercase transition-colors hover:border-zinc-900 dark:hover:border-white"
              >
                <SkipForwardIcon size={14} weight="light" aria-hidden="true" />
                Skip stage
              </button>
            </div>

            {/* Stage dots */}
            <ol className="mt-8 flex items-center gap-2" aria-label="Stage progress">
              {routine.steps.map((s, index) => (
                <li
                  key={s.name}
                  aria-current={index === stepIndex ? 'step' : undefined}
                  className={`h-1.5 w-8 rounded-full ${
                    index < stepIndex
                      ? 'bg-zinc-900 dark:bg-white'
                      : index === stepIndex
                        ? 'bg-zinc-400 dark:bg-zinc-600'
                        : 'bg-zinc-200 dark:bg-zinc-800'
                  }`}
                />
              ))}
            </ol>
          </m.div>
        )}

        {/* Completion */}
        {done && (
          <m.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col items-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-14 text-center"
          >
            <p className="font-display text-4xl font-bold text-zinc-900 dark:text-zinc-100">
              {Math.max(1, streak)}-day streak
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-800 dark:text-zinc-300">
              {routine?.title} complete. The paint thanks you — come back tomorrow to keep the
              streak alive.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setRoutineId(null)}
                className="cursor-pointer bg-zinc-900 dark:bg-white px-8 py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                Another session
              </button>
              <Link
                to="/account"
                className="inline-flex items-center justify-center border border-zinc-300 dark:border-zinc-700 px-8 py-4 text-xs font-semibold tracking-[0.2em] text-zinc-900 dark:text-zinc-100 uppercase transition-colors hover:border-zinc-900 dark:hover:border-white"
              >
                View your wash log
              </Link>
            </div>
          </m.div>
        )}
      </div>
    </>
  )
}
