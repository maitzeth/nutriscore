import { useState, useMemo, useCallback } from 'react'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Calendar, TrendingUp, Flame, Target, Lightbulb } from 'lucide-react'
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
  days: number
}

const dateRangeOptions: DateRangeOption[] = [
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '90d', label: 'Last 90 days', days: 90 },
]

interface Insight {
  icon: string
  text: string
  type: 'positive' | 'negative' | 'neutral'
}

export default function Reports() {
  const { isReady, getRangeTracking, getStreak } = useTracking()
  const [selectedRange, setSelectedRange] = useState<DateRange>('7d')

  const days = dateRangeOptions.find(r => r.value === selectedRange)?.days || 7

  const endDate = format(new Date(), 'yyyy-MM-dd')
  const startDate = format(subDays(new Date(), days - 1), 'yyyy-MM-dd')

  const trackings = useMemo(() => {
    if (!isReady) return []
    return getRangeTracking(startDate, endDate)
  }, [isReady, startDate, endDate, getRangeTracking])

  const trackingMap = useMemo(() => {
    const map = new Map<string, DayTracking>()
    trackings.forEach(t => map.set(t.date, t))
    return map
  }, [trackings])

  // Calculate stats
  const stats = useMemo(() => {
    const totalDays = trackings.length
    const greenDays = trackings.filter(t => t.color === 'green').length
    const yellowDays = trackings.filter(t => t.color === 'yellow').length
    const redDays = trackings.filter(t => t.color === 'red').length

    const greenPercent = totalDays > 0 ? Math.round((greenDays / totalDays) * 100) : 0
    const yellowPercent = totalDays > 0 ? Math.round((yellowDays / totalDays) * 100) : 0
    const redPercent = totalDays > 0 ? Math.round((redDays / totalDays) * 100) : 0

    // Average score
    const avgScore = totalDays > 0
      ? trackings.reduce((sum, t) => sum + getColorValue(t.color), 0) / totalDays
      : 0

    // Current streak
    const streak = getStreak()

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
    }
  }, [trackings, getStreak])

  // Chart data
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
      }
    })
  }, [days, trackingMap])

  // Weekly comparison
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

  // Insights
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

    // Trend
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
        }
      }
    }

    // Streak
    if (stats.currentStreak > 0) {
      result.push({
        icon: '🔥',
        text: `Your current streak is ${stats.currentStreak} day${stats.currentStreak !== 1 ? 's' : ''}!`,
        type: 'positive',
      })
    }

    // Best streak
    if (stats.bestStreak > 0) {
      result.push({
        icon: '🏆',
        text: `Your best streak this period: ${stats.bestStreak} days`,
        type: 'neutral',
      })
    }

    // Color distribution insight
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

    // Day of week pattern
    const dayStats: Record<string, { total: number; green: number }> = {}
    trackings.forEach(t => {
      const day = format(new Date(t.date + 'T12:00:00'), 'EEEE')
      if (!dayStats[day]) dayStats[day] = { total: 0, green: 0 }
      dayStats[day].total++
      if (t.color === 'green') dayStats[day].green++
    })

    const worstDay = Object.entries(dayStats)
      .filter(([_, s]) => s.total >= 2)
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

    return result.slice(0, 5)
  }, [stats, weeklyData, trackings])

  const handleRangeChange = useCallback((range: DateRange) => {
    setSelectedRange(range)
  }, [])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span>📊</span> Reports
        </h1>

        {/* Date Range Selector */}
        <div className="flex flex-wrap gap-2 mb-8">
          {dateRangeOptions.map(option => (
            <Button
              key={option.value}
              variant={selectedRange === option.value ? 'default' : 'outline'}
              onClick={() => handleRangeChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
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

          <Card>
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

          <Card>
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

          <Card>
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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Color Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-4 rounded-full overflow-hidden">
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${stats.greenPercent}%` }}
                title={`Green: ${stats.greenDays} days (${stats.greenPercent}%)`}
              />
              <div
                className="bg-yellow-400 transition-all"
                style={{ width: `${stats.yellowPercent}%` }}
                title={`Yellow: ${stats.yellowDays} days (${stats.yellowPercent}%)`}
              />
              <div
                className="bg-red-500 transition-all"
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
        <Card className="mb-8">
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
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{data.date}</p>
                            <p className="text-sm text-muted-foreground">
                              {data.color === 'green' && '🟢 Great day'}
                              {data.color === 'yellow' && '🟡 Okay day'}
                              {data.color === 'red' && '🔴 Bad day'}
                              {!data.color && '⚪ No data'}
                            </p>
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
          <Card className="mb-8">
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
                          className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 rounded-full transition-all"
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

        {/* Insights */}
        <Card>
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
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
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
