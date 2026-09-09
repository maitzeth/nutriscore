import { cn, getColorClass, getTextColorForBg } from '@/lib/utils'
import type { DayTracking } from '@/lib/utils'

interface DayCellProps {
  date: string
  dayOfMonth: number
  tracking: DayTracking | null
  isCurrentMonth: boolean
  isEditable: boolean
  isToday: boolean
  isPast: boolean
  isFuture: boolean
  onClick: () => void
}

export default function DayCell({
  date,
  dayOfMonth,
  tracking,
  isCurrentMonth,
  isEditable,
  isToday,
  isPast,
  onClick,
}: DayCellProps) {
  if (!isCurrentMonth) {
    return (
      <div className="aspect-square p-1">
        <div className="w-full h-full rounded-lg bg-gray-50 opacity-30" />
      </div>
    )
  }

  const hasTracking = tracking !== null
  const colorClass = hasTracking ? getColorClass(tracking!.color) : ''
  const textColorClass = hasTracking ? getTextColorForBg(tracking!.color) : 'text-foreground'

  return (
    <div className="aspect-square p-1">
      <button
        onClick={onClick}
        disabled={!isEditable}
        className={cn(
          'w-full h-full rounded-lg flex flex-col items-center justify-center transition-all duration-200 relative',
          // Base styles
          !hasTracking && 'border-2 border-dashed border-gray-200 bg-white',
          hasTracking && colorClass,
          hasTracking && textColorClass,
          // Today
          isToday && 'ring-2 ring-primary ring-offset-2',
          // Editable
          isEditable && 'hover:scale-105 hover:shadow-md cursor-pointer',
          // Not editable
          !isEditable && 'cursor-default opacity-70',
          // Past days slightly more muted
          isPast && !hasTracking && 'opacity-50',
        )}
        title={isEditable ? `Click to track ${date}` : date}
      >
        <span className={cn(
          'text-sm sm:text-base font-medium',
          isToday && !hasTracking && 'text-primary',
        )}>
          {dayOfMonth}
        </span>
        
        {hasTracking && (
          <span className="text-xs mt-0.5">
            {tracking!.color === 'green' && '✓'}
            {tracking!.color === 'yellow' && '~'}
            {tracking!.color === 'red' && '!'}
          </span>
        )}
      </button>
    </div>
  )
}
