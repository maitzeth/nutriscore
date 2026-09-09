# NutriScore v1 — Design Document

## Design Principles

1. **Simplicity First** — One action per day, minimal cognitive load
2. **Visual Clarity** — Color is the primary information carrier
3. **Mobile-First** — Designed for daily phone check-ins
4. **Delightful Feedback** — Smooth animations, satisfying interactions
5. **Accessible** — Works for everyone, regardless of ability

## Layout Structure

### Home Page (Calendar)

```
┌─────────────────────────────────────────────────────────────┐
│  🍎 NutriScore                              [📅] [📊]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         ◀  Enero 2025  ▶                                    │
│                                                             │
│  Lu  Ma  Mi  Ju  Vi  Sa  Do                                │
│  ─── ─── ─── ─── ─── ─── ───                               │
│                  1   2   3                                  │
│              🟡  4   5   6                                  │
│          🟢  7   8   9  10  11                              │
│      🔴 12  13  14  15  16  17                              │
│  🟢 18  19  20  21  22  23  24                              │
│  🟡 25  26  27 [28] 29  30  31                              │
│                      ▲                                      │
│                    today                                    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Today: March 28, 2025                                      │
│  Current streak: 5 days 🟢                                  │
└─────────────────────────────────────────────────────────────┘
```

### Day Selection Modal

```
┌─────────────────────────────────────┐
│         March 28, 2025              │
│                                     │
│     🔴    🟡    🟢                 │
│     Bad   Ok   Great                │
│                                     │
│     ┌─────────────────────┐         │
│     │ Add a note...       │         │
│     └─────────────────────┘         │
│                                     │
│         [Save]  [Cancel]            │
└─────────────────────────────────────┘
```

### Reports Page

```
┌─────────────────────────────────────────────────────────────┐
│  🍎 NutriScore                              [📅] [📊]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 Reports                                                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📅 Last 7 days  ▼                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  7       │ │  5 🟢    │ │  5 days  │ │  +20%    │      │
│  │ Days     │ │ Green    │ │ Streak   │ │ vs last  │      │
│  │ Tracked  │ │ (71%)    │ │          │ │ week     │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📈 Trend                                            │   │
│  │  ─────────────────────────────────────────────      │   │
│  │  ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁                                  │   │
│  │  Mon Tue Wed Thu Fri Sat Sun                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  💡 Insights                                         │   │
│  │                                                     │   │
│  │  • You tend to eat better on weekends               │   │
│  │  • Your best streak this month: 8 days              │   │
│  │  • Consider: Wednesdays are your toughest days      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Component Design

### Calendar Grid

**Visual Design:**
- 7-column CSS Grid layout
- Cells are square on desktop, rectangular on mobile
- Consistent gap between cells (gap-1 or gap-2)
- Month/year header centered with nav arrows
- Day-of-week headers (Lu, Ma, Mi...) in muted text

**Color Mapping:**
```css
.day-empty {
  @apply bg-white border-2 border-dashed border-gray-200;
}

.day-green {
  @apply bg-green-500 text-white font-medium;
}

.day-yellow {
  @apply bg-yellow-400 text-gray-900 font-medium;
}

.day-red {
  @apply bg-red-500 text-white font-medium;
}

.day-today {
  @apply ring-2 ring-primary ring-offset-2;
}

.day-editable {
  @apply hover:scale-105 hover:shadow-md cursor-pointer transition-all;
}

.day-readonly {
  @apply opacity-60 cursor-default;
}
```

### Color Picker Buttons

**Design:**
- Three circles, 48px diameter on mobile, 56px on desktop
- Horizontal layout with 16px gap
- Each button has:
  - Colored background (red/yellow/green)
  - White/dark icon in center (emoji or SVG)
  - Label below (optional, for accessibility)
- Selected state: ring-4 with matching color, slight scale-up
- Hover: scale-110, shadow

**Animation:**
- Selection: scale from 1 to 1.1, ring appears
- Save confirmation: brief pulse animation
- Color transition: 200ms ease

### Report Cards

**Design:**
- 4-column grid on desktop, 2 on mobile
- Each card: white background, rounded-xl, shadow-sm
- Icon on top (emoji or Lucide icon)
- Large number in center
- Label below in muted text
- Optional trend indicator (↑↓→ with color)

**Color Coding:**
- Positive trends: text-green-600
- Negative trends: text-red-600
- Neutral: text-gray-500

### Trend Chart

**Library:** Recharts (lightweight, React-native)

**Design:**
- Area chart with gradient fill
- Green area for positive values
- Y-axis: 1-3 scale (Red=1, Yellow=2, Green=3)
- X-axis: dates or day names
- 7-day moving average as dashed line
- Tooltip on hover showing exact values
- Responsive container

**Colors:**
```typescript
const chartColors = {
  area: 'url(#greenGradient)',
  line: '#22c55e',
  average: '#94a3b8',  // slate-400
  grid: '#e2e8f0',     // slate-200
};
```

### Insights Section

**Design:**
- Card with lightbulb icon header
- List of 3-5 insights
- Each insight: bullet point with icon
- Text in natural language
- Subtle fade-in animation on load

**Insight Types:**
1. **Trend:** "You've improved X% compared to last week"
2. **Streak:** "Your current streak is X days"
3. **Pattern:** "You tend to eat worse on [day]"
4. **Achievement:** "Best week this month!"
5. **Suggestion:** "Consider: [actionable tip]"

## Responsive Breakpoints

```css
/* Mobile: < 640px */
.calendar-cell {
  @apply w-10 h-10 text-sm;
}

/* Tablet: 640px - 1024px */
@media (min-width: 640px) {
  .calendar-cell {
    @apply w-14 h-14 text-base;
  }
}

/* Desktop: > 1024px */
@media (min-width: 1024px) {
  .calendar-cell {
    @apply w-16 h-16 text-lg;
  }
}
```

## Animation Guidelines

**Duration:** 150-300ms for micro-interactions
**Easing:** ease-out for entrances, ease-in for exits

**Key Animations:**
1. **Day selection:** Scale 1 → 1.05, shadow appears
2. **Color save:** Brief pulse (scale 1 → 1.1 → 1)
3. **Page transition:** Fade in/out (opacity 0 → 1)
4. **Chart load:** Draw from left to right
5. **Insight appear:** Fade in + slide up (y: 10 → 0)

## Dark Mode

**Calendar:**
- Empty days: `bg-gray-800 border-gray-700`
- Today ring: `ring-primary` (adjusts for dark)

**Reports:**
- Cards: `bg-gray-800`
- Text: `text-gray-100`
- Muted: `text-gray-400`

**Color Adjustments:**
- Green: `bg-green-600` (slightly darker for contrast)
- Yellow: `bg-yellow-500` (slightly darker)
- Red: `bg-red-600` (slightly darker)

## Typography

**Font:** System font stack (Inter if available)

**Sizes:**
- Calendar day number: text-sm to text-lg (responsive)
- Card numbers: text-2xl to text-3xl
- Headers: text-xl to text-2xl
- Body: text-base
- Labels: text-sm, text-muted-foreground

## Iconography

- Navigation arrows: Lucide ChevronLeft/ChevronRight
- Calendar: Lucide Calendar
- Reports: Lucide BarChart3
- Lightbulb: Lucide Lightbulb
- Streak: Lucide Flame
- Trend up: Lucide TrendingUp
- Trend down: Lucide TrendingDown

## Micro-interactions

1. **Hover day:** Slight scale + shadow (if editable)
2. **Click day:** Modal slides up from bottom (mobile) or fades in (desktop)
3. **Select color:** Button pulses, checkmark appears
4. **Save:** Toast notification "Saved!" with fade out
5. **Month change:** Calendar slides left/right

## Empty States

**No data for day:**
- Dashed border
- "+" icon on hover (editable) or nothing (readonly)

**No data for range (Reports):**
- "No data for this period"
- "Start tracking to see insights"
- CTA: "Go to Calendar"

**First time use:**
- Welcome message
- "Tap any day to start tracking"
- Highlight today's cell
