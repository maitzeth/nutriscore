import { useState, useEffect, useCallback } from 'react'
import {
  initDatabase,
  getMonthTracking as dbGetMonthTracking,
  getRangeTracking as dbGetRangeTracking,
  getDayTracking as dbGetDayTracking,
  saveTracking as dbSaveTracking,
  deleteTracking as dbDeleteTracking,
} from '@/lib/db'
import type { DayTracking, TrackingColor } from '@/lib/utils'

export function useTracking() {
  const [isReady, setIsReady] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    initDatabase().then(() => setIsReady(true))
  }, [])

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  const getMonthTracking = useCallback((year: number, month: number): DayTracking[] => {
    if (!isReady) return []
    return dbGetMonthTracking(year, month)
  }, [isReady])

  const getRangeTracking = useCallback((startDate: string, endDate: string): DayTracking[] => {
    if (!isReady) return []
    return dbGetRangeTracking(startDate, endDate)
  }, [isReady])

  const getDayTracking = useCallback((date: string): DayTracking | null => {
    if (!isReady) return null
    return dbGetDayTracking(date)
  }, [isReady])

  const saveTracking = useCallback((date: string, color: TrackingColor, note?: string) => {
    if (!isReady) return
    dbSaveTracking(date, color, note)
    refresh()
  }, [isReady, refresh])

  const deleteTracking = useCallback((date: string) => {
    if (!isReady) return
    dbDeleteTracking(date)
    refresh()
  }, [isReady, refresh])

  const getStreak = useCallback((): { current: number; best: number; bestColor: TrackingColor } => {
    if (!isReady) return { current: 0, best: 0, bestColor: 'green' }
    
    const today = new Date()
    const allTrackings: DayTracking[] = []
    
    // Get last 365 days
    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const tracking = dbGetDayTracking(dateStr)
      if (tracking) {
        allTrackings.push(tracking)
      }
    }

    // Calculate current streak (from today backwards)
    let currentStreak = 0
    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const tracking = dbGetDayTracking(dateStr)
      
      if (tracking) {
        currentStreak++
      } else {
        break
      }
    }

    // Calculate best streak
    let bestStreak = 0
    let bestColor: TrackingColor = 'green'
    let tempStreak = 0
    let tempColor: TrackingColor = 'green'

    // Sort by date
    const sorted = [...allTrackings].sort((a, b) => a.date.localeCompare(b.date))
    
    for (let i = 0; i < sorted.length; i++) {
      if (i === 0) {
        tempStreak = 1
        tempColor = sorted[i].color
      } else {
        const prevDate = new Date(sorted[i - 1].date)
        const currDate = new Date(sorted[i].date)
        const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        
        if (diffDays === 1) {
          tempStreak++
          if (sorted[i].color === 'green') {
            tempColor = 'green'
          }
        } else {
          if (tempStreak > bestStreak) {
            bestStreak = tempStreak
            bestColor = tempColor
          }
          tempStreak = 1
          tempColor = sorted[i].color
        }
      }
    }

    if (tempStreak > bestStreak) {
      bestStreak = tempStreak
      bestColor = tempColor
    }

    return { current: currentStreak, best: bestStreak, bestColor }
  }, [isReady])

  return {
    isReady,
    refreshKey,
    getMonthTracking,
    getRangeTracking,
    getDayTracking,
    saveTracking,
    deleteTracking,
    getStreak,
  }
}
