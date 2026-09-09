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
  const [note, setNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showSavedToast, setShowSavedToast] = useState(false)

  const streak = getStreak()

  const handleDayClick = useCallback((status: DayStatus) => {
    if (!status.isEditable) return
    setSelectedDay(status)
    setSelectedColor(status.tracking?.color || null)
    setNote(status.tracking?.note || '')
  }, [])

  const handleSave = useCallback(async () => {
    if (!selectedDay || !selectedColor) return
    
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 200))
    
    saveTracking(selectedDay.date, selectedColor, note || undefined)
    setIsSaving(false)
    setSelectedDay(null)
    setSelectedColor(null)
    setNote('')
    
    // Show toast
    setShowSavedToast(true)
    setTimeout(() => setShowSavedToast(false), 2000)
  }, [selectedDay, selectedColor, note, saveTracking])

  const handleDelete = useCallback(() => {
    if (!selectedDay) return
    deleteTracking(selectedDay.date)
    setSelectedDay(null)
    setSelectedColor(null)
    setNote('')
  }, [selectedDay, deleteTracking])

  const handleClose = useCallback(() => {
    setSelectedDay(null)
    setSelectedColor(null)
    setNote('')
  }, [])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4 animate-bounce">🍎</div>
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
        <div className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-in-up">
          {streak.current > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted transition-all duration-300 hover:scale-105">
              <span className="text-lg">🔥</span>
              <span className="text-sm font-medium">
                Current streak: {streak.current} day{streak.current !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          {streak.best > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted transition-all duration-300 hover:scale-105">
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
            note={note}
            onNoteChange={setNote}
            date={selectedDay?.date || ''}
          />
          
          <div className="flex justify-center gap-3 pt-4">
            {selectedDay?.tracking && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isSaving}
                className="transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Remove
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!selectedColor || isSaving}
              className="transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Saved Toast */}
      {showSavedToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-up z-50">
          ✓ Saved!
        </div>
      )}
    </div>
  )
}
