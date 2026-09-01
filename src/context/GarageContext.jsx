import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'kmkiramyki-garage'
const GarageContext = createContext(null)

/**
 * My Garage — the visitor's cars (localStorage). Each car maps to a
 * recommended routine via the quiz matrix keys. No detailing brand
 * offers vehicle personalization; this is a first-mover feature.
 */
export function GarageProvider({ children }) {
  const [cars, setCars] = useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed.slice(0, 6) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cars))
    } catch {
      /* storage unavailable */
    }
  }, [cars])

  const addCar = useCallback((car) => {
    setCars((current) => [...current, { id: `car-${Date.now()}`, ...car }].slice(0, 6))
  }, [])

  const removeCar = useCallback((id) => {
    setCars((current) => current.filter((car) => car.id !== id))
  }, [])

  const value = useMemo(
    () => ({
      cars,
      addCar,
      removeCar,
      /** Map a car to its quiz-routine answer key. */
      routineKeyFor: (car) => {
        const goal =
          car.condition === 'swirled' || car.condition === 'neglected' ? 'deep' : 'maintain'
        const focus = car.focus ?? 'paint'
        return `${goal}|${focus}|any`
      },
      /** Product ids recommended across all garage cars. */
      recommendedProductIds: [],
    }),
    [cars, addCar, removeCar]
  )

  return <GarageContext.Provider value={value}>{children}</GarageContext.Provider>
}

export function useGarage() {
  const context = useContext(GarageContext)
  if (!context) {
    throw new Error('useGarage must be used within a GarageProvider')
  }
  return context
}
