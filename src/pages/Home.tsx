import { useState, useCallback } from 'react'
import Header from '@/components/Header'
import Calendar from '@/components/Calendar'
import ColorPicker from '@/components/ColorPicker'
import { Dialog, DialogContent } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { useTracking } from '@/hooks/useTracking'
import type { DayStatus, TrackingColor } from '@/lib/utils'

export default function Home() {
  const { isReady, refreshKey, getMonthTracking, saveTracking, deleteTracking, getStreak } = useTracking()
  const [selectedDay, setSelectedDay] = useState<DayStatus | null>(null)
  const [selectedColor, setSelectedColor] = useState<TrackingColor | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const streak = getStreak()

  const handleDayClick = useCallback((status: DayStatus) => {
    if (!status.isEditable) return
    setSelectedDay(status)
    setSelectedColor(status.tracking?.color || null)
  }, [])

  const handleSave = useCallback(async () => {
    if (!selectedDay || !selectedColor) return
    
    setIsSaving(true)
    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 200))
    
    saveTracking(selectedDay.date, selectedColor)
    setIsSaving(false)
    setSelectedDay(null)
    setSelectedColor(null)
  }, [selectedDay, selectedColor, saveTracking])

  const handleDelete = useCallback(() => {
    if (!selectedDay) return
    deleteTracking(selectedDay.date)
    setSelectedDay(null)
    setSelectedColor(null)
  }, [selectedDay, deleteTracking])

  const handleClose = useCallback(() => {
    setSelectedDay(null)
    setSelectedColor(null)
  }, [])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🍎</div>
          <p className="text-muted-foreground">Loading NutriScore...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Calendar
          getMonthTracking={getMonthTracking}
          onDayClick={handleDayClick}
          refreshKey={refreshKey}
        />

        {/* Streak Info */}
        <div className="mt-8 text-center">
          {streak.current > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
              <span className="text-lg">🔥</span>
              <span className="text-sm font-medium">
                Current streak: {streak.current} day{streak.current !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          {streak.best > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted ml-2">
              <span className="text-lg">🏆</span>
              <span className="text-sm font-medium">
                Best streak: {streak.best} day{streak.best !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </main>

      {/* Color Picker Dialog */}
      <Dialog open={selectedDay !== null} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <ColorPicker
            selectedColor={selectedColor}
            onSelect={setSelectedColor}
            date={selectedDay?.date || ''}
          />
          
          <div className="flex justify-center gap-3 pt-4">
            {selectedDay?.tracking && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isSaving}
              >
                Remove
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!selectedColor || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
