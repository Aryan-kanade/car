import { useState } from 'react'
import { CloudRainIcon } from '@phosphor-icons/react/dist/csr/CloudRain'
import { CrosshairIcon } from '@phosphor-icons/react/dist/csr/Crosshair'
import { SunIcon } from '@phosphor-icons/react/dist/csr/Sun'

const MUMBAI = { lat: 19.076, lon: 72.8777, label: 'Mumbai' }

function washQuality(precip, humidity) {
  if (precip > 4)
    return { label: 'Poor', note: 'Rain expected — postpone the wash', icon: CloudRainIcon }
  if (precip > 0.5 || humidity > 80)
    return { label: 'Fair', note: 'Damp air — extend drying time', icon: CloudRainIcon }
  return { label: 'Good', note: 'Clear window — perfect wash day', icon: SunIcon }
}

/**
 * Weather-aware detailing coach — geolocation + Open-Meteo (free, keyless).
 * Opt-in for location; falls back to Mumbai. Non-commercial demo use.
 */
export default function WeatherCoach() {
  const [state, setState] = useState({ status: 'idle' })

  const load = async (coords, label) => {
    setState({ status: 'loading' })
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}` +
        '&daily=precipitation_probability_max,relative_humidity_2m_max&forecast_days=2&timezone=auto'
      const response = await fetch(url)
      const data = await response.json()
      const day0 = {
        precipProb: data.daily.precipitation_probability_max?.[0] ?? 0,
        humidity: data.daily.relative_humidity_2m_max?.[0] ?? 60,
      }
      const day1 = {
        precipProb: data.daily.precipitation_probability_max?.[1] ?? 0,
        humidity: data.daily.relative_humidity_2m_max?.[1] ?? 60,
      }
      setState({ status: 'ready', label, day0, day1 })
    } catch {
      setState({ status: 'error' })
    }
  }

  const locate = () => {
    if (!navigator.geolocation) return load(MUMBAI, MUMBAI.label)
    navigator.geolocation.getCurrentPosition(
      (position) =>
        load(
          { lat: position.coords.latitude.toFixed(3), lon: position.coords.longitude.toFixed(3) },
          'your location'
        ),
      () => load(MUMBAI, MUMBAI.label),
      { timeout: 5000 }
    )
  }

  // Day names for "wax today" advice
  const dayName = (offset) => {
    const date = new Date()
    date.setDate(date.getDate() + offset)
    return date.toLocaleDateString('en-IN', { weekday: 'short' })
  }

  const advice = (state) => {
    if (state.status !== 'ready') return null
    const { day0, day1 } = state
    if (day1.precipProb > 55 && day0.precipProb < 30) {
      return `Rain likely ${dayName(1)} — protect the paint today while it is dry.`
    }
    if (day0.precipProb > 55) {
      return `Wet day today — a good moment for interior and glass work.`
    }
    return `Clear spell holding — a safe window for a full wash and dry.`
  }

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[11px] font-semibold tracking-[0.25em] text-zinc-900 dark:text-zinc-100 uppercase">
          Wash-day forecast
        </h2>
        {state.status === 'idle' ? (
          <button
            type="button"
            onClick={locate}
            className="flex cursor-pointer items-center gap-2 text-xs font-semibold tracking-[0.15em] text-zinc-800 dark:text-zinc-300 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
          >
            <CrosshairIcon size={14} weight="light" aria-hidden="true" />
            Use my location
          </button>
        ) : (
          <span className="text-xs text-zinc-800 dark:text-zinc-300">{state.label ?? '—'}</span>
        )}
      </div>

      {state.status === 'idle' && (
        <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-zinc-800 dark:text-zinc-300">
          Check the next 48 hours before you start — rain, dust and humidity change what the studio
          would do today. Location stays on your device.
        </p>
      )}

      {state.status === 'loading' && (
        <p className="mt-4 text-sm text-zinc-800 dark:text-zinc-300">Checking the sky…</p>
      )}

      {state.status === 'error' && (
        <p className="mt-4 text-sm text-zinc-800 dark:text-zinc-400">
          Could not reach the forecast service — trust the window instead.
        </p>
      )}

      {state.status === 'ready' && (
        <>
          <div className="mt-5 grid grid-cols-2 gap-4">
            {[0, 1].map((offset) => {
              const day = offset === 0 ? state.day0 : state.day1
              const quality = washQuality(
                day.precipProb > 40 ? day.precipProb / 10 : 0,
                day.humidity
              )
              const Icon = quality.icon
              return (
                <div
                  key={offset}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3.5"
                >
                  <p className="text-xs font-medium tracking-[0.15em] text-zinc-800 dark:text-zinc-300 uppercase">
                    {dayName(offset)}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    <Icon size={16} weight="light" aria-hidden="true" />
                    {quality.label} wash window
                  </p>
                  <p className="mt-1 text-xs text-zinc-800 dark:text-zinc-300">{quality.note}</p>
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-zinc-800 dark:text-zinc-300">
            {advice(state)}
          </p>
        </>
      )}
    </div>
  )
}
