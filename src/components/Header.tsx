import { Link, useLocation } from 'react-router-dom'
import { Calendar, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Header() {
  const location = useLocation()
  
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="text-2xl">🍎</span>
          <span className="text-lg">NutriScore</span>
        </Link>
        
        <nav className="ml-auto flex items-center gap-1">
          <Link
            to="/"
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              location.pathname === '/'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </Link>
          
          <Link
            to="/reports"
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              location.pathname === '/reports'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
