import { cn } from '@/lib/utils'
import type { TrackingColor } from '@/lib/utils'

interface ColorPickerProps {
  selectedColor: TrackingColor | null
  onSelect: (color: TrackingColor) => void
  date: string
}

const colors: { value: TrackingColor; label: string; emoji: string; bgClass: string }[] = [
  { value: 'red', label: 'Bad', emoji: '🔴', bgClass: 'bg-tracking-red' },
  { value: 'yellow', label: 'Okay', emoji: '🟡', bgClass: 'bg-tracking-yellow' },
  { value: 'green', label: 'Great', emoji: '🟢', bgClass: 'bg-tracking-green' },
]

export default function ColorPicker({ selectedColor, onSelect, date }: ColorPickerProps) {
  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h3 className="text-lg font-medium text-foreground">
        {formattedDate}
      </h3>
      
      <div className="flex gap-4">
        {colors.map(({ value, label, emoji, bgClass }) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200',
              'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2',
              selectedColor === value
                ? 'ring-2 ring-offset-2 scale-110'
                : 'opacity-70 hover:opacity-100',
              value === 'red' && selectedColor === value && 'ring-tracking-red',
              value === 'yellow' && selectedColor === value && 'ring-tracking-yellow',
              value === 'green' && selectedColor === value && 'ring-tracking-green',
              value === 'red' && 'focus:ring-tracking-red',
              value === 'yellow' && 'focus:ring-tracking-yellow',
              value === 'green' && 'focus:ring-tracking-green',
            )}
          >
            <div className={cn(
              'w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-lg',
              bgClass,
            )}>
              {emoji}
            </div>
            <span className={cn(
              'text-sm font-medium',
              selectedColor === value ? 'text-foreground' : 'text-muted-foreground',
            )}>
              {label}
            </span>
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-xs">
        {selectedColor === 'red' && "It's okay, tomorrow is a new day!"}
        {selectedColor === 'yellow' && "Not bad, but there's room for improvement."}
        {selectedColor === 'green' && "Amazing! Keep up the great work! 🎉"}
        {!selectedColor && "How did you eat today?"}
      </p>
    </div>
  )
}
