import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Receipt, Users, FlaskConical, BarChart3 } from "lucide-react"

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex flex-col w-64 bg-white shadow-sm">
        {/* Logo/Header */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">
            Investigaciones Médicas
          </h1>
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
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            v1.0.0
          </p>
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