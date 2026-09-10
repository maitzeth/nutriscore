import { useState, useMemo, useCallback } from 'react'
import { format, subDays, eachDayOfInterval, getDay } from 'date-fns'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Calendar, TrendingUp, Flame, Target, Lightbulb, Download, MessageSquare } from 'lucide-react'
import Header from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useTracking } from '@/hooks/useTracking'
import { getColorValue } from '@/lib/utils'
import type { DayTracking } from '@/lib/utils'

type DateRange = '7d' | '30d' | '90d' | 'custom'

interface DateRangeOption {
  value: DateRange
  label: string
  days?: number
}

const dateRangeOptions: DateRangeOption[] = [
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '90d', label: 'Last 90 days', days: 90 },
  { value: 'custom', label: 'Custom Range' },
]

interface Insight {
  icon: string
  text: string
  type: 'positive' | 'negative' | 'neutral'
}

export default function Reports() {
  const { isReady, getRangeTracking, getStreak } = useTracking()
  const [selectedRange, setSelectedRange] = useState<DateRange>('7d')
  const [showNotes, setShowNotes] = useState(false)
  const [customStartDate, setCustomStartDate] = useState(format(subDays(new Date(), 6), 'yyyy-MM-dd'))
  const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const days = dateRangeOptions.find(r => r.value === selectedRange)?.days || 7

  const endDate = selectedRange === 'custom' ? customEndDate : format(new Date(), 'yyyy-MM-dd')
  const startDate = selectedRange === 'custom' ? customStartDate : format(subDays(new Date(), days - 1), 'yyyy-MM-dd')

  const trackings = useMemo(() => {
    if (!isReady) return []
    return getRangeTracking(startDate, endDate)
  }, [isReady, startDate, endDate, getRangeTracking])

  const trackingMap = useMemo(() => {
    const map = new Map<string, DayTracking>()
    trackings.forEach(t => map.set(t.date, t))
    return map
  }, [trackings])

  const stats = useMemo(() => {
    const totalDays = trackings.length
    const greenDays = trackings.filter(t => t.color === 'green').length
    const yellowDays = trackings.filter(t => t.color === 'yellow').length
    const redDays = trackings.filter(t => t.color === 'red').length

    const greenPercent = totalDays > 0 ? Math.round((greenDays / totalDays) * 100) : 0
    const yellowPercent = totalDays > 0 ? Math.round((yellowDays / totalDays) * 100) : 0
    const redPercent = totalDays > 0 ? Math.round((redDays / totalDays) * 100) : 0

    const avgScore = totalDays > 0
      ? trackings.reduce((sum, t) => sum + getColorValue(t.color), 0) / totalDays
      : 0

    const streak = getStreak()

    const greenTrackings = trackings.filter(t => t.color === 'green')
    const bestDays = greenTrackings.length > 0 
      ? greenTrackings.map(t => t.date).slice(-3) 
      : []

    const redTrackings = trackings.filter(t => t.color === 'red')
    const worstDays = redTrackings.length > 0
      ? redTrackings.map(t => t.date).slice(-3)
      : []

    const notesCount = trackings.filter(t => t.note && t.note.trim().length > 0).length

    return {
      totalDays,
      greenDays,
      yellowDays,
      redDays,
      greenPercent,
      yellowPercent,
      redPercent,
      avgScore: avgScore.toFixed(1),
      currentStreak: streak.current,
      bestStreak: streak.best,
      bestDays,
      worstDays,
      notesCount,
    }
  }, [trackings, getStreak])

  const chartData = useMemo(() => {
    const allDays = eachDayOfInterval({
      start: subDays(new Date(), days - 1),
      end: new Date()
    })

    return allDays.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const tracking = trackingMap.get(dateStr)
      return {
        date: format(day, 'MMM dd'),
        dayOfWeek: format(day, 'EEE'),
        value: tracking ? getColorValue(tracking.color) : null,
        color: tracking?.color || null,
        note: tracking?.note || null,
      }
    })
  }, [days, trackingMap])

  const weeklyData = useMemo(() => {
    const weeks: { week: string; avg: number; count: number }[] = []
    
    for (let w = 0; w < Math.ceil(days / 7); w++) {
      const weekStart = subDays(new Date(), days - 1 - (w * 7))
      const weekEnd = subDays(new Date(), w * 7)
      
      const weekTrackings = trackings.filter(t => {
        const d = new Date(t.date)
        return d >= weekStart && d <= weekEnd
      })

      if (weekTrackings.length > 0) {
        const avg = weekTrackings.reduce((sum, t) => sum + getColorValue(t.color), 0) / weekTrackings.length
        weeks.unshift({
          week: `Week ${Math.ceil(days / 7) - w}`,
          avg: Number(avg.toFixed(2)),
          count: weekTrackings.length,
        })
      }
    }

    return weeks
  }, [days, trackings])

  const insights: Insight[] = useMemo(() => {
    const result: Insight[] = []
    
    if (stats.totalDays === 0) {
      result.push({
        icon: '📊',
        text: 'No data for this period. Start tracking to see insights!',
        type: 'neutral',
      })
      return result
    }

    if (weeklyData.length >= 2) {
      const latestWeek = weeklyData[weeklyData.length - 1]
      const previousWeek = weeklyData[weeklyData.length - 2]
      
      if (latestWeek && previousWeek) {
        const change = ((latestWeek.avg - previousWeek.avg) / previousWeek.avg) * 100
        
        if (change > 10) {
          result.push({
            icon: '📈',
            text: `You've improved ${Math.round(change)}% compared to last week!`,
            type: 'positive',
          })
        } else if (change < -10) {
          result.push({
            icon: '📉',
            text: `You've declined ${Math.round(Math.abs(change))}% compared to last week.`,
            type: 'negative',
          })
        } else {
          result.push({
            icon: '➡️',
            text: `You're consistent — similar performance to last week.`,
            type: 'neutral',
          })
        }
      }
    }

    if (stats.currentStreak > 0) {
      result.push({
        icon: '🔥',
        text: `Your current streak is ${stats.currentStreak} day${stats.currentStreak !== 1 ? 's' : ''}!`,
        type: 'positive',
      })
    }

    if (stats.bestStreak > 0) {
      result.push({
        icon: '🏆',
        text: `Your best streak this period: ${stats.bestStreak} days`,
        type: 'neutral',
      })
    }

    if (stats.greenPercent > 70) {
      result.push({
        icon: '🌟',
        text: `Amazing! ${stats.greenPercent}% of your days were great.`,
        type: 'positive',
      })
    } else if (stats.redPercent > 30) {
      result.push({
        icon: '💪',
        text: `${stats.redPercent}% of days need improvement. You can do this!`,
        type: 'negative',
      })
    }

    const dayStats: Record<string, { total: number; green: number }> = {}
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    trackings.forEach(t => {
      const dayIdx = getDay(new Date(t.date + 'T12:00:00'))
      const day = dayNames[dayIdx]
      if (!dayStats[day]) dayStats[day] = { total: 0, green: 0 }
      dayStats[day].total++
      if (t.color === 'green') dayStats[day].green++
    })

    const worstDay = Object.entries(dayStats)
      .filter(([, s]) => s.total >= 2)
      .sort((a, b) => (a[1].green / a[1].total) - (b[1].green / b[1].total))[0]

    if (worstDay) {
      const [day, s] = worstDay
      const greenRate = Math.round((s.green / s.total) * 100)
      result.push({
        icon: '📅',
        text: `${day}s are your toughest days (${greenRate}% success rate)`,
        type: 'neutral',
      })
    }

    const bestDayOfWeek = Object.entries(dayStats)
      .filter(([, s]) => s.total >= 2)
      .sort((a, b) => (b[1].green / b[1].total) - (a[1].green / a[1].total))[0]

    if (bestDayOfWeek && bestDayOfWeek[0] !== worstDay?.[0]) {
      const [day, s] = bestDayOfWeek
      const greenRate = Math.round((s.green / s.total) * 100)
      result.push({
        icon: '✨',
        text: `${day}s are your best days (${greenRate}% success rate)!`,
        type: 'positive',
      })
    }

    if (stats.notesCount > 0) {
      result.push({
        icon: '📝',
        text: `You've added notes to ${stats.notesCount} day${stats.notesCount !== 1 ? 's' : ''}. Keep journaling!`,
        type: 'neutral',
      })
    }

    if (stats.redDays === 0 && stats.totalDays > 0) {
      result.push({
        icon: '🎉',
        text: `No bad days this period! Incredible discipline!`,
        type: 'positive',
      })
    }

    const avgScoreNum = parseFloat(stats.avgScore)
    if (avgScoreNum >= 2.5) {
      result.push({
        icon: '💎',
        text: `Your average score is ${stats.avgScore}/3 — you're crushing it!`,
        type: 'positive',
      })
    } else if (avgScoreNum < 1.5 && stats.totalDays > 0) {
      result.push({
        icon: '💪',
        text: `Average score is ${stats.avgScore}/3. Small changes lead to big results!`,
        type: 'negative',
      })
    }

    return result.slice(0, 6)
  }, [stats, weeklyData, trackings])

  const handleExport = useCallback(() => {
    const exportData = {
      exportDate: new Date().toISOString(),
      dateRange: { start: startDate, end: endDate },
      summary: stats,
      dailyData: trackings.map(t => ({
        date: t.date,
        color: t.color,
        note: t.note || '',
      })),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nutriscore-export-${format(new Date(), 'yyyy-MM-dd')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [trackings, stats, startDate, endDate])

  const handleRangeChange = useCallback((range: DateRange) => {
    setSelectedRange(range)
  }, [])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4 animate-bounce">📊</div>
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2 animate-fade-in">
            <span>📊</span> Reports
          </h1>
          
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>

        {/* Date Range Selector */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex flex-wrap gap-2 mb-4">
            {dateRangeOptions.map(option => (
              <Button
                key={option.value}
                variant={selectedRange === option.value ? 'default' : 'outline'}
                onClick={() => handleRangeChange(option.value)}
                className="transition-all duration-200"
              >
                {option.label}
              </Button>
            ))}
          </div>
          
          {/* Custom Date Range Inputs */}
          {selectedRange === 'custom' && (
            <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg animate-fade-in-up">
              <div className="flex items-center gap-2">
                <label htmlFor="start-date" className="text-sm font-medium text-muted-foreground">
                  From:
                </label>
                <input
                  type="date"
                  id="start-date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  max={customEndDate}
                  className="px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="end-date" className="text-sm font-medium text-muted-foreground">
                  To:
                </label>
                <input
                  type="date"
                  id="end-date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  className="px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {Math.ceil((new Date(customEndDate).getTime() - new Date(customStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days selected
              </span>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Days Tracked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalDays}</div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                Green Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {stats.greenDays}
                <span className="text-lg font-normal text-muted-foreground ml-1">
                  ({stats.greenPercent}%)
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.currentStreak}
                <span className="text-lg font-normal text-muted-foreground ml-1">days</span>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Avg Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.avgScore}
                <span className="text-lg font-normal text-muted-foreground ml-1">/3</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Color Distribution */}
        <Card className="mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="text-lg">Color Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-4 rounded-full overflow-hidden">
              <div
                className="bg-green-500 transition-all duration-500"
                style={{ width: `${stats.greenPercent}%` }}
                title={`Green: ${stats.greenDays} days (${stats.greenPercent}%)`}
              />
              <div
                className="bg-yellow-400 transition-all duration-500"
                style={{ width: `${stats.yellowPercent}%` }}
                title={`Yellow: ${stats.yellowDays} days (${stats.yellowPercent}%)`}
              />
              <div
                className="bg-red-500 transition-all duration-500"
                style={{ width: `${stats.redPercent}%` }}
                title={`Red: ${stats.redDays} days (${stats.redPercent}%)`}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Green ({stats.greenPercent}%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="text-muted-foreground">Yellow ({stats.yellowPercent}%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-muted-foreground">Red ({stats.redPercent}%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card className="mb-8 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <CardHeader>
            <CardTitle className="text-lg">Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.some(d => d.value !== null) ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    domain={[0, 3]} 
                    ticks={[1, 2, 3]}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      if (value === 1) return '🔴'
                      if (value === 2) return '🟡'
                      if (value === 3) return '🟢'
                      return ''
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg animate-fade-in">
                            <p className="font-medium">{data.date}</p>
                            <p className="text-sm text-muted-foreground">
                              {data.color === 'green' && '🟢 Great day'}
                              {data.color === 'yellow' && '🟡 Okay day'}
                              {data.color === 'red' && '🔴 Bad day'}
                              {!data.color && '⚪ No data'}
                            </p>
                            {data.note && (
                              <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                                📝 {data.note}
                              </p>
                            )}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <ReferenceLine y={stats.avgScore ? parseFloat(stats.avgScore) : 0} stroke="#94a3b8" strokeDasharray="5 5" />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data to display. Start tracking to see your trend!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Comparison */}
        {weeklyData.length > 1 && (
          <Card className="mb-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weeklyData.map((week, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-20 text-sm text-muted-foreground">{week.week}</div>
                    <div className="flex-1">
                      <div className="h-6 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 rounded-full transition-all duration-700"
                          style={{ width: `${(week.avg / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right font-medium">
                      {week.avg.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes Section */}
        {stats.notesCount > 0 && (
          <Card className="mb-8 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => setShowNotes(!showNotes)}
            >
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Notes ({stats.notesCount})
                </div>
                <span className="text-muted-foreground text-sm">
                  {showNotes ? '▲ Hide' : '▼ Show'}
                </span>
              </CardTitle>
            </CardHeader>
            {showNotes && (
              <CardContent className="animate-fade-in-up">
                <div className="space-y-3">
                  {trackings
                    .filter(t => t.note && t.note.trim().length > 0)
                    .reverse()
                    .slice(0, 10)
                    .map((t) => (
                      <div key={t.date} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                          {format(new Date(t.date + 'T12:00:00'), 'MMM dd')}
                        </div>
                        <div className="text-sm">{t.note}</div>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Insights */}
        <Card className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.length > 0 ? (
              <ul className="space-y-3">
                {insights.map((insight, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 transition-all duration-200 hover:bg-muted"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <span className="text-xl">{insight.icon}</span>
                    <span className={`text-sm ${
                      insight.type === 'positive' ? 'text-green-600' :
                      insight.type === 'negative' ? 'text-red-600' :
                      'text-foreground'
                    }`}>
                      {insight.text}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Not enough data for insights. Keep tracking!
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
