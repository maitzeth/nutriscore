import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isBefore, addMonths, subMonths } from 'date-fns'
import { Button } from '@/components/ui/Button'
import DayCell from './DayCell'
import type { DayTracking, DayStatus } from '@/lib/utils'

interface CalendarProps {
  getMonthTracking: (year: number, month: number) => DayTracking[]
  onDayClick: (status: DayStatus) => void
  refreshKey: number
}

export default function Calendar({ getMonthTracking, onDayClick, refreshKey }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const trackings = useMemo(() => {
    return getMonthTracking(currentDate.getFullYear(), currentDate.getMonth())
  }, [currentDate, refreshKey, getMonthTracking])

  const trackingMap = useMemo(() => {
    const map = new Map<string, DayTracking>()
    trackings.forEach(t => map.set(t.date, t))
    return map
  }, [trackings])

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days: Date[] = []
    let day = calStart
    while (day <= calEnd) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [currentDate])

  const today = new Date()
  const yesterday = addDays(today, -1)

  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1))
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1))

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const isCurrentMonth = isSameMonth(date, currentDate)
    
    if (!isCurrentMonth) return

    const isTodayDate = isSameDay(date, today)
    const isYesterdayDate = isSameDay(date, yesterday)
    const isPastDate = isBefore(date, yesterday) && !isTodayDate
    const isFutureDate = isBefore(today, date) && !isTodayDate

    const isEditable = isTodayDate || isYesterdayDate

    onDayClick({
      date: dateStr,
      tracking: trackingMap.get(dateStr) || null,
      isEditable,
      isToday: isTodayDate,
      isPast: isPastDate,
      isFuture: isFutureDate,
    })
  }

  const weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevMonth}
          className="h-10 w-10"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <h2 className="text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="h-10 w-10"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isTodayDate = isSameDay(day, today)
          const isYesterdayDate = isSameDay(day, yesterday)
          const isPastDate = isBefore(day, yesterday) && !isTodayDate
          const isFutureDate = isBefore(today, day) && !isTodayDate
          const isEditable = isTodayDate || isYesterdayDate
          
          const tracking = isCurrentMonth ? trackingMap.get(dateStr) || null : null

          return (
            <DayCell
              key={idx}
              date={dateStr}
              dayOfMonth={day.getDate()}
              tracking={tracking}
              isCurrentMonth={isCurrentMonth}
              isEditable={isEditable}
              isToday={isTodayDate}
              isPast={isPastDate}
              isFuture={isFutureDate}
              onClick={() => handleDayClick(day)}
            />
          )
        })}
      </div>
    </div>
  )
}
