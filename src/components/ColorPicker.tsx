import { cn } from '@/lib/utils'
import type { TrackingColor } from '@/lib/utils'

interface ColorPickerProps {
  selectedColor: TrackingColor | null
  onSelect: (color: TrackingColor) => void
  note: string
  onNoteChange: (note: string) => void
  date: string
}

const colors: { value: TrackingColor; label: string; emoji: string; bgClass: string }[] = [
  { value: 'red', label: 'Bad', emoji: '🔴', bgClass: 'bg-tracking-red' },
  { value: 'yellow', label: 'Okay', emoji: '🟡', bgClass: 'bg-tracking-yellow' },
  { value: 'green', label: 'Great', emoji: '🟢', bgClass: 'bg-tracking-green' },
]

export default function ColorPicker({ selectedColor, onSelect, note, onNoteChange, date }: ColorPickerProps) {
  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h3 className="text-lg font-medium text-foreground animate-fade-in">
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
              'active:scale-95',
              selectedColor === value
                ? 'ring-2 ring-offset-2 scale-110 shadow-lg'
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
              'transition-transform duration-200',
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

      {/* Note Input */}
      <div className="w-full max-w-sm animate-fade-in-up">
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="What did you eat today? (optional)"
          className={cn(
            'w-full p-3 text-sm rounded-lg border bg-muted/50 resize-none',
            'placeholder:text-muted-foreground/60',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
            'transition-all duration-200',
          )}
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground text-right mt-1">
          {note.length}/500
        </p>
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-xs animate-pulse-soft">
        {selectedColor === 'red' && "It's okay, tomorrow is a new day!"}
        {selectedColor === 'yellow' && "Not bad, but there's room for improvement."}
        {selectedColor === 'green' && "Amazing! Keep up the great work! 🎉"}
        {!selectedColor && "How did you eat today?"}
      </p>
    </div>
  )
}
