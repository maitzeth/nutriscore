# NutriScore v1 — Implementation Tasks

## Task 1: Project Setup
- [ ] Initialize Vite + React 19 + TypeScript project
- [ ] Install and configure Tailwind CSS
- [ ] Install and configure shadcn/ui
- [ ] Set up React Router
- [ ] Create folder structure
- [ ] Configure path aliases

## Task 2: SQLite Setup
- [ ] Install sql.js and dependencies
- [ ] Create database initialization module
- [ ] Implement localStorage persistence
- [ ] Create TypeScript types for data model
- [ ] Write database query functions

## Task 3: Calendar Core
- [ ] Create Calendar component with month grid
- [ ] Implement month navigation (prev/next)
- [ ] Create DayCell component with color states
- [ ] Add today highlighting
- [ ] Implement editable vs readonly states
- [ ] Add responsive styling

## Task 4: Color Picker
- [ ] Create ColorPicker component
- [ ] Implement three color buttons (R/Y/G)
- [ ] Add selection state and visual feedback
- [ ] Connect to database save function
- [ ] Add save confirmation animation

## Task 5: Tracking Hook
- [ ] Create useTracking custom hook
- [ ] Implement getMonthTracking
- [ ] Implement saveTracking
- [ ] Implement deleteTracking
- [ ] Add state refresh mechanism

## Task 6: Home Page
- [ ] Create Home page layout
- [ ] Integrate Calendar component
- [ ] Add header with navigation
- [ ] Show current streak info
- [ ] Handle day click → open ColorPicker

## Task 7: Reports Page - Structure
- [ ] Create Reports page layout
- [ ] Add DateRangePicker component
- [ ] Implement default 7-day range
- [ ] Create summary cards section

## Task 8: Reports Page - Charts
- [ ] Install Recharts
- [ ] Create TrendChart component
- [ ] Implement color-to-number conversion
- [ ] Add 7-day moving average
- [ ] Style chart with custom colors

## Task 9: Reports Page - Insights
- [ ] Create Insights component
- [ ] Implement trend calculation
- [ ] Implement streak calculation
- [ ] Implement pattern detection
- [ ] Generate natural language insights

## Task 10: Reports Page - Data
- [ ] Connect Reports to useTracking hook
- [ ] Implement getRangeTracking
- [ ] Calculate color distribution
- [ ] Calculate weekly comparisons
- [ ] Wire up all data to components

## Task 11: Polish & UX
- [ ] Add page transitions
- [ ] Add loading states
- [ ] Add empty states
- [ ] Add toast notifications
- [ ] Implement dark mode
- [ ] Add keyboard navigation
- [ ] Add ARIA labels

## Task 12: Testing & Bug Fixes
- [ ] Test calendar navigation
- [ ] Test color selection flow
- [ ] Test data persistence
- [ ] Test reports calculations
- [ ] Fix any responsive issues
- [ ] Performance optimization

## Execution Order

```
1. Project Setup
   ↓
2. SQLite Setup
   ↓
3. Calendar Core + Color Picker + Tracking Hook (parallel)
   ↓
4. Home Page (integrates 3)
   ↓
5. Reports Structure
   ↓
6. Reports Charts + Insights + Data (parallel)
   ↓
7. Polish & UX
   ↓
8. Testing & Bug Fixes
```

## Dependencies

- Task 1 → All tasks
- Task 2 → Task 5, Task 10
- Task 3 → Task 6
- Task 4 → Task 6
- Task 5 → Task 6, Task 10
- Task 6 → Task 7
- Task 7 → Task 8, Task 9, Task 10
- Task 11 → Task 12

## Estimated Complexity

| Task | Files | Lines | Complexity |
|------|-------|-------|------------|
| 1. Project Setup | 6 | 100 | Low |
| 2. SQLite Setup | 3 | 150 | Medium |
| 3. Calendar Core | 2 | 200 | Medium |
| 4. Color Picker | 1 | 100 | Low |
| 5. Tracking Hook | 1 | 120 | Medium |
| 6. Home Page | 1 | 80 | Low |
| 7. Reports Structure | 2 | 150 | Low |
| 8. Reports Charts | 1 | 180 | Medium |
| 9. Reports Insights | 1 | 120 | Medium |
| 10. Reports Data | 1 | 100 | Medium |
| 11. Polish & UX | 4 | 200 | Medium |
| 12. Testing | 0 | 0 | Low |
| **Total** | **23** | **~1500** | |

## Notes

- All code in English (variables, comments, UI)
- Use shadcn components where possible
- Follow React 19 patterns
- Keep components small and focused
- Prefer composition over configuration
