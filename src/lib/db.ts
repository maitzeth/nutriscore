import initSqlJs, { Database } from 'sql.js'
import type { DayTracking, TrackingColor } from './utils'

const DB_KEY = 'nutriscore_db'

let db: Database | null = null

export async function initDatabase(): Promise<Database> {
  if (db) return db

  const SQL = await initSqlJs({
    locateFile: () => '/sql-wasm.wasm'
  })

  // Try to load from localStorage
  const savedDb = localStorage.getItem(DB_KEY)
  if (savedDb) {
    const buf = Uint8Array.from(atob(savedDb), c => c.charCodeAt(0))
    db = new SQL.Database(buf)
  } else {
    db = new SQL.Database()
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS daily_tracking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL CHECK(color IN ('red', 'yellow', 'green')),
      note TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_tracking_date ON daily_tracking(date)
  `)

  saveDatabase()
  return db
}

function saveDatabase() {
  if (!db) return
  const data = db.export()
  const buffer = new Uint8Array(data)
  const binary = Array.from(buffer).map(b => String.fromCharCode(b)).join('')
  localStorage.setItem(DB_KEY, btoa(binary))
}

export function getMonthTracking(year: number, month: number): DayTracking[] {
  if (!db) return []

  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month + 2).padStart(2, '0')}-01`

  const results = db.exec(`
    SELECT * FROM daily_tracking 
    WHERE date >= ? AND date < ?
    ORDER BY date
  `, [startDate, endDate])

  if (results.length === 0) return []

  return results[0].values.map(row => ({
    id: row[0] as number,
    date: row[1] as string,
    color: row[2] as TrackingColor,
    note: row[3] as string | undefined,
    created_at: row[4] as string,
    updated_at: row[5] as string,
  }))
}

export function getRangeTracking(startDate: string, endDate: string): DayTracking[] {
  if (!db) return []

  const results = db.exec(`
    SELECT * FROM daily_tracking 
    WHERE date >= ? AND date <= ?
    ORDER BY date
  `, [startDate, endDate])

  if (results.length === 0) return []

  return results[0].values.map(row => ({
    id: row[0] as number,
    date: row[1] as string,
    color: row[2] as TrackingColor,
    note: row[3] as string | undefined,
    created_at: row[4] as string,
    updated_at: row[5] as string,
  }))
}

export function getDayTracking(date: string): DayTracking | null {
  if (!db) return null

  const results = db.exec(`
    SELECT * FROM daily_tracking WHERE date = ?
  `, [date])

  if (results.length === 0 || results[0].values.length === 0) return null

  const row = results[0].values[0]
  return {
    id: row[0] as number,
    date: row[1] as string,
    color: row[2] as TrackingColor,
    note: row[3] as string | undefined,
    created_at: row[4] as string,
    updated_at: row[5] as string,
  }
}

export function saveTracking(date: string, color: TrackingColor, note?: string): void {
  if (!db) return

  const existing = getDayTracking(date)
  
  if (existing) {
    db.run(`
      UPDATE daily_tracking 
      SET color = ?, note = ?, updated_at = datetime('now')
      WHERE date = ?
    `, [color, note || null, date])
  } else {
    db.run(`
      INSERT INTO daily_tracking (date, color, note)
      VALUES (?, ?, ?)
    `, [date, color, note || null])
  }

  saveDatabase()
}

export function deleteTracking(date: string): void {
  if (!db) return
  db.run('DELETE FROM daily_tracking WHERE date = ?', [date])
  saveDatabase()
}

export function getAllTracking(): DayTracking[] {
  if (!db) return []

  const results = db.exec('SELECT * FROM daily_tracking ORDER BY date')

  if (results.length === 0) return []

  return results[0].values.map(row => ({
    id: row[0] as number,
    date: row[1] as string,
    color: row[2] as TrackingColor,
    note: row[3] as string | undefined,
    created_at: row[4] as string,
    updated_at: row[5] as string,
  }))
}
