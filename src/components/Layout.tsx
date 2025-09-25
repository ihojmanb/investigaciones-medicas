import { Link, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Receipt, Users, FlaskConical, BarChart3, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: "Submit Expense",
    href: "/expenses/new",
    icon: Receipt,
  },
  {
    name: "Patients",
    href: "/patients",
    icon: Users,
  },
  {
    name: "Trials",
    href: "/trials",
    icon: FlaskConical,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Initialize from localStorage, default to false
    const saved = localStorage.getItem('sidebar-collapsed')
    return saved ? JSON.parse(saved) : false
  })

  // Persist sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={cn(
        "flex flex-col bg-white shadow-sm transition-[width] duration-300 ease-in-out",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        {/* Logo/Header */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          <div className="flex items-center justify-between w-full">
            {!sidebarCollapsed && (
              <h1 className="text-lg font-semibold text-gray-900">
                Investigaciones Médicas
              </h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={cn("p-2", sidebarCollapsed && "mx-auto")}
            >
              {sidebarCollapsed ? (
                <Menu className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== "/" && location.pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center text-sm font-medium rounded-md relative group",
                  sidebarCollapsed ? "px-2 justify-center" : "px-3 py-2",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon className={cn(
                  "flex-shrink-0",
                  sidebarCollapsed ? "w-5 h-5 m-2" : "w-5 h-5"
                )} />
                {!sidebarCollapsed && item.name}
                
                {/* Tooltip for collapsed state */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {!sidebarCollapsed ? (
            <p className="text-xs text-gray-500 text-center">
              v1.0.0
            </p>
          ) : (
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}