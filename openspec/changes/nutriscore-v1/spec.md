# NutriScore v1 — Technical Specification

## Architecture Overview

```
nutriscore/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn components
│   │   ├── Calendar.tsx     # Main calendar grid
│   │   ├── DayCell.tsx      # Individual day with color selector
│   │   ├── ColorPicker.tsx  # Red/Yellow/Green selector
│   │   └── Reports.tsx      # Reports page
│   ├── lib/
│   │   ├── db.ts            # SQLite setup and queries
│   │   └── utils.ts         # Helper functions
│   ├── pages/
│   │   ├── Home.tsx         # Calendar view
│   │   └── Reports.tsx      # Reports view
│   ├── hooks/
│   │   └── useTracking.ts   # Custom hook for tracking logic
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── components.json          # shadcn config
```

## Data Model

### SQLite Schema

```sql
CREATE TABLE daily_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,        -- ISO date string: 'YYYY-MM-DD'
  color TEXT NOT NULL CHECK(color IN ('red', 'yellow', 'green')),
  note TEXT,                         -- Optional short note
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_tracking_date ON daily_tracking(date);
```

### TypeScript Types

```typescript
type TrackingColor = 'red' | 'yellow' | 'green';

interface DayTracking {
  id: number;
  date: string;           // 'YYYY-MM-DD'
  color: TrackingColor;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

interface DayStatus {
  date: string;
  tracking: DayTracking | null;
  isEditable: boolean;    // true for today and yesterday
  isPast: boolean;        // true for days before yesterday
  isFuture: boolean;      // true for days after today
}
```

## Component Specifications

### 1. Calendar Component

**Props:**
```typescript
interface CalendarProps {
  onDayClick: (date: string, status: DayStatus) => void;
  refreshKey: number;  // Force re-render after updates
}
```

**Behavior:**
- Displays current month grid (7 columns, 5-6 rows)
- Navigation arrows to move between months
- Each day cell shows:
  - Day number
  - Background color based on tracking (or neutral if no tracking)
  - Hover effect for editable days
  - Cursor indicator (pointer for editable, default for non-editable)
- Today is highlighted with a ring/border
- Days without tracking have subtle dashed border

**Responsive:**
- Desktop: full calendar with large cells
- Mobile: compact calendar, cells adapt to screen

### 2. DayCell Component

**Props:**
```typescript
interface DayCellProps {
  date: string;
  tracking: DayTracking | null;
  isEditable: boolean;
  isToday: boolean;
  isSelected: boolean;
  onClick: () => void;
}
```

**Visual States:**
- No tracking: white/neutral background, dashed border
- Green: `bg-green-500` with white text
- Yellow: `bg-yellow-400` with dark text
- Red: `bg-red-500` with white text
- Today: ring-2 ring-primary
- Editable: hover effect, pointer cursor
- Non-editable: reduced opacity, default cursor

### 3. ColorPicker Component

**Props:**
```typescript
interface ColorPickerProps {
  selectedColor: TrackingColor | null;
  onSelect: (color: TrackingColor) => void;
  date: string;
}
```

**Layout:**
- Three circular buttons in a row
- Red (🔴), Yellow (🟡), Green (🟢)
- Selected color has ring/glow effect
- Click to select, click again to deselect
- Shows date being edited below

**Behavior:**
- Single click selects color and saves immediately
- Visual feedback on save (brief animation)
- Keyboard accessible (arrow keys + enter)

### 4. Reports Page

**Props:**
```typescript
interface ReportsProps {
  dateRange: [Date, Date];
  onRangeChange: (range: [Date, Date]) => void;
}
```

**Sections:**

#### A. Summary Cards
- Total days tracked in range
- Color distribution (count + percentage for each)
- Current streak (consecutive days of any tracking)
- Best streak (longest run of green days)

#### B. Calendar Heatmap
- Mini calendar showing the range with colors
- Quick visual pattern recognition

#### C. Trend Chart
- Line or area chart showing color values over time
- Green=3, Yellow=2, Red=1 for numerical representation
- 7-day moving average line
- Visual trend direction (improving/declining/stable)

#### D. Weekly Comparison
- Bar chart comparing weeks side by side
- Average "score" per week

#### E. Insights (AI-generated text)
- Simple rule-based insights:
  - "You've improved X% compared to last week"
  - "Your best day this week was [date]"
  - "You tend to eat worse on [day of week]"
  - "Your current streak is X days"

## State Management

### Local State (React)
- Selected date for editing
- Current month being viewed
- Date range for reports
- UI state (loading, error)

### Persistent State (SQLite)
- All tracking data
- Accessed via custom hook `useTracking`

### Hook: useTracking

```typescript
interface UseTrackingReturn {
  // Data
  getMonthTracking: (year: number, month: number) => Promise<DayTracking[]>;
  getRangeTracking: (start: string, end: string) => Promise<DayTracking[]>;
  getDayTracking: (date: string) => Promise<DayTracking | null>;
  
  // Mutations
  saveTracking: (date: string, color: TrackingColor, note?: string) => Promise<void>;
  deleteTracking: (date: string) => Promise<void>;
  
  // Computed
  getStreak: () => Promise<{ current: number; best: number }>;
  getColorDistribution: (start: string, end: string) => Promise<ColorStats>;
}
```

## Routing

Using React Router v6:
- `/` → Home (Calendar view)
- `/reports` → Reports page

## Styling

- Tailwind CSS for utility classes
- shadcn/ui for base components (Button, Card, Tabs, etc.)
- Custom color palette for tracking colors
- Dark mode support via Tailwind's dark mode

### Color Palette

```css
--tracking-green: #22c55e;    /* green-500 */
--tracking-yellow: #facc15;   /* yellow-400 */
--tracking-red: #ef4444;      /* red-500 */
```

## Storage Strategy

### SQLite in Browser (sql.js)

1. **Initialization:**
   - Load sql.js WASM module
   - Create in-memory database
   - Create tables if not exist
   - Load from localStorage if exists

2. **Persistence:**
   - After each write, serialize DB to Uint8Array
   - Save to localStorage as base64 string
   - On app load, restore from localStorage

3. **Fallback:**
   - If localStorage full, show warning
   - Data is lost on browser clear (acceptable)

### localStorage Key

```
nutriscore_db: base64-encoded SQLite database
```

## Performance Considerations

- Calendar renders only current month (minimal DOM)
- Reports use aggregated queries, not full table scans
- SQLite queries indexed on date column
- Lazy load reports page (code splitting)
- Debounce color selection saves (though immediate feedback)

## Accessibility

- Keyboard navigation through calendar
- ARIA labels for color buttons
- Screen reader announcements for color changes
- Focus management in modals/popups
- Color is not the only indicator (also patterns/icons)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features
- WebAssembly support required for sql.js
- Graceful degradation for older browsers (show message)

## Testing Strategy

- Unit tests for utility functions
- Component tests for Calendar, DayCell, ColorPicker
- Integration tests for tracking flow
- No E2E tests in v1 (personal tool)
