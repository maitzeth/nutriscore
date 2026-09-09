# 🍎 NutriScore

A simple, visual food habit tracker built with React. Track your daily eating habits with a color-coded calendar and gain insights through reports and trends.

## 🎯 Purpose

This is a personal tool for tracking daily diet quality. No calorie counting, no food databases — just a quick daily check-in to build awareness of your eating patterns.

## 🚀 Features

### Calendar View
- **Full-screen calendar** showing the current month
- **Color-coded days**:
  - 🟢 **Green**: Ate well that day (healthy meals, good choices)
  - 🟡 **Yellow**: Minor slip (small unhealthy snack, but mostly okay)
  - 🔴 **Red**: Bad eating day (junk food, alcohol, binge, etc.)
- **Quick entry**: Click today or yesterday to log (catch-up support)
- **Notes**: Add optional notes about what you ate
- **Streaks**: Track current and best streaks

### Reports Page
- **Date range selector**: View last 7, 30, or 90 days
- **Summary cards**: Days tracked, green days, streak, average score
- **Color distribution**: Visual breakdown of your habits
- **Trend chart**: See your progress over time
- **Weekly comparison**: Compare performance week-to-week
- **Smart insights**: AI-style analysis of your patterns
- **Notes viewer**: Review your food journal entries

### Data & Privacy
- **100% local**: All data stored in your browser (SQLite via sql.js)
- **No backend**: No accounts, no sync, no servers
- **Offline-first**: Works without internet after initial load
- **Export**: Download your data as JSON anytime



## 🏗️ Architecture

### How SQLite Works in the Browser

This app uses **[sql.js](https://sql.js.org/)** — a JavaScript implementation of SQLite compiled to WebAssembly. This means SQLite runs entirely in the browser with **no backend required**.

```
┌─────────────────────────────────────────────────────────────┐
│  Browser                                                     │
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │  React App   │───▶│  sql.js     │───▶│  SQLite in      │  │
│  │  (queries)   │    │  (WASM)     │    │  Memory         │  │
│  └─────────────┘    └─────────────┘    └────────┬────────┘  │
│                                                  │           │
│                                          ┌───────▼────────┐  │
│                                          │  localStorage   │  │
│                                          │  (persistence)  │  │
│                                          └────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**How it works:**

1. **Initialization**: sql.js loads the SQLite WASM module (~600KB)
2. **Load from storage**: On app start, check `localStorage` for saved DB
3. **Restore**: Deserialize the base64 string back into a SQLite database in memory
4. **Query**: All reads/writes happen against the in-memory database (fast!)
5. **Persist**: After each write, export the entire DB to base64 and save to `localStorage`

**Why this approach?**
- ✅ Full SQL power (JOINs, indexes, transactions) in the browser
- ✅ No server/API needed — works offline
- ✅ Data stays on user's device (privacy)
- ✅ Same SQL syntax as a real SQLite backend

**Limitations:**
- ⚠️ `localStorage` has ~5-10MB limit (enough for years of daily tracking)
- ⚠️ Clearing browser data deletes everything (use Export to backup!)
- ⚠️ No sync between devices
- ⚠️ DB is serialized/deserialized on every write (acceptable for small DBs)

### Tech Stack

- **Framework**: React 19 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui style
- **Database**: SQLite via sql.js (WebAssembly) with localStorage persistence
- **Charts**: Recharts
- **Icons**: Lucide React

```bash
# Clone the repository
git clone git@github.com:maitzeth/nutriscore.git
cd nutriscore

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/           # Base UI components (Button, Card, Dialog)
│   ├── Calendar.tsx  # Main calendar grid
│   ├── DayCell.tsx   # Individual day cell
│   ├── ColorPicker.tsx # Color selection with notes
│   └── Header.tsx    # Navigation header
├── hooks/
│   └── useTracking.ts # Custom hook for tracking logic
├── lib/
│   ├── db.ts         # SQLite database operations
│   └── utils.ts      # Utility functions and types
├── pages/
│   ├── Home.tsx      # Calendar view
│   └── Reports.tsx   # Reports and insights
├── App.tsx
├── main.tsx
└── index.css
```

## 💾 Data Storage

All data is stored locally in your browser using SQLite (via sql.js) with localStorage as the persistence layer.

**Storage key**: `nutriscore_db`

**Schema**:
```sql
CREATE TABLE daily_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL CHECK(color IN ('red', 'yellow', 'green')),
  note TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

> ⚠️ **Note**: Clearing browser data will delete all tracking data. Use the Export feature to backup your data.

## 🎨 Color System

| Color | Meaning | Score |
|-------|---------|-------|
| 🟢 Green | Great day - ate healthy | 3 |
| 🟡 Yellow | Okay day - minor slip | 2 |
| 🔴 Red | Bad day - junk food, etc. | 1 |

## 📊 Reports & Insights

The reports page provides:

- **Trend Analysis**: Visual chart showing your progress
- **Streak Tracking**: Current and best streaks
- **Pattern Detection**: Identifies which days are hardest
- **Weekly Comparison**: Week-over-week performance
- **Smart Recommendations**: Based on your data

## 🔧 Development

```bash
# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 License

Personal project — not licensed for distribution.

---

Built with ❤️ for personal health tracking
