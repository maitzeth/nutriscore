import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type TrackingColor = 'red' | 'yellow' | 'green'

export interface DayTracking {
  id: number
  date: string
  color: TrackingColor
  note?: string
  created_at: string
  updated_at: string
}

export interface DayStatus {
  date: string
  tracking: DayTracking | null
  isEditable: boolean
  isToday: boolean
  isPast: boolean
  isFuture: boolean
}

export function getColorValue(color: TrackingColor): number {
  switch (color) {
    case 'green': return 3
    case 'yellow': return 2
    case 'red': return 1
  }
}

export function getColorClass(color: TrackingColor): string {
  switch (color) {
    case 'green': return 'bg-tracking-green'
    case 'yellow': return 'bg-tracking-yellow'
    case 'red': return 'bg-tracking-red'
  }
}

export function getTextColorForBg(color: TrackingColor): string {
  switch (color) {
    case 'green': return 'text-white'
    case 'yellow': return 'text-gray-900'
    case 'red': return 'text-white'
  }
}
