# NutriScore v1 — Proposal

## Problem Statement

The user needs a simple, visual way to track daily food habits without the complexity of calorie counting or detailed food logging. Current solutions are either too complex (MyFitnessPal) or too simple (habit trackers without food focus). The goal is a quick daily check-in that builds awareness through visual patterns.

## Target User

- Single user (personal tool)
- Wants low-friction daily tracking (one tap/click per day)
- Values visual feedback and trend awareness over detailed analytics
- Prefers simplicity over feature richness

## Business Rules

1. **Color System:**
   - 🟢 Green: Ate well that day (healthy meals, good choices)
   - 🟡 Yellow: Minor slip (small unhealthy snack, but mostly okay)
   - 🔴 Red: Bad eating day (junk food, alcohol, binge, etc.)

2. **Calendar Rules:**
   - Show current month by default
   - Today and yesterday are always editable (catch-up support)
   - Days before yesterday are view-only (historical)
   - Future days are not selectable

3. **Data Persistence:**
   - All data stored locally in SQLite (browser-based via sql.js)
   - No backend, no sync, no accounts
   - Data persists across sessions via browser storage

## Product Outcome

A single-page React app with:
1. Full-screen calendar view as home page
2. Quick color selection per day (one click)
3. Reports page with insights and trends
4. Offline-first, no server dependency

## Current-State Gap

- No existing tool fits this exact use case
- User wants something simpler than existing habit trackers
- Focus on food habits specifically, not general habits

## Implications & Impact

- Personal tool, so no multi-user concerns
- Local-only data means no privacy concerns
- Browser storage limits apply but are sufficient for daily tracking
- No internet required after initial load

## Edge Cases

- User opens app for first time mid-month: calendar shows current month from today
- User wants to edit a day from 3 days ago: not allowed (by design)
- User clears browser data: data is lost (acceptable for personal tool)
- User opens on mobile: responsive design required

## Non-Goals

- No user authentication
- No backend/API
- No food database or calorie tracking
- No social features
- No data export (v1)
- No notifications/reminders

## Scope Boundaries

**In Scope (v1):**
- Calendar view with color-coded days
- Day editing (today + yesterday)
- Reports page with charts and insights
- Local SQLite storage
- Responsive design

**Out of Scope (v1):**
- Food logging details
- Nutritional analysis
- Multi-device sync
- Data backup/restore
