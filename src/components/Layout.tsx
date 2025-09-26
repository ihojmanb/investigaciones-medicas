import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Receipt, Users, FlaskConical, BarChart3, Menu, X, Settings, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import { useFeatureAccess } from "@/hooks/usePermissions"
import { toast } from "sonner"

interface LayoutProps {
  children: React.ReactNode
}

// Navigation items with permission requirements
const navigationConfig = [
  {
    name: "Submit Expense",
    href: "/expenses/new",
    icon: Receipt,
    showWhen: 'showExpensesSection' as const,
  },
  {
    name: "Patients",
    href: "/patients",
    icon: Users,
    showWhen: 'showPatientsSection' as const,
  },
  {
    name: "Trials",
    href: "/trials",
    icon: FlaskConical,
    showWhen: 'showTrialsSection' as const,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
    showWhen: 'showReportsSection' as const,
  },
  {
    name: "Admin",
    href: "/admin",
    icon: Settings,
    showWhen: 'showAdminSection' as const,
  },
]

// Get role badge styling based on role name
const getRoleBadgeStyle = (roleName: string) => {
  switch (roleName.toLowerCase()) {
    case 'admin':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'operator':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { session, signOut } = useAuth()
  const { profile, loading: profileLoading } = useProfile()
  const featureAccess = useFeatureAccess()
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Initialize from localStorage, default to false
    const saved = localStorage.getItem('sidebar-collapsed')
    return saved ? JSON.parse(saved) : false
  })

  const handleSignOut = async () => {
    console.log('🚪 Signing out...')
    try {
      await signOut()
      console.log('✅ Signed out successfully')
      toast.success("Signed out successfully")
    } catch (error) {
      console.error('❌ Sign out error:', error)
      toast.error("Error signing out")
    }
  }

  // Persist sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  // Filter navigation items based on permissions
  const navigation = navigationConfig.filter(item => 
    featureAccess[item.showWhen]
  )

  // Get user initials for avatar
  // const getUserInitials = () => {
  //   if (profile?.full_name) {
  //     return profile.full_name
  //       .split(' ')
  //       .map(name => name[0])
  //       .join('')
  //       .toUpperCase()
  //       .slice(0, 2)
  //   }
  //   return profile?.email?.[0]?.toUpperCase() || 'U'
  // }

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

        {/* Footer - User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session?.user?.email || "User"}
                    </p>
                    {session?.user && (
                      <div className="mt-1">
                        {profileLoading ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border bg-gray-100 text-gray-500 border-gray-200">
                            Loading...
                          </span>
                        ) : (
                          <span className={cn(
                            "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border",
                            getRoleBadgeStyle(profile?.role_name || 'operator')
                          )}>
                            {profile?.role_name || 'operator'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="p-2"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="p-2"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Version */}
          <div className="mt-2">
            {!sidebarCollapsed ? (
              <p className="text-xs text-gray-500 text-center">
                v1.0.0
              </p>
            ) : (
              <div className="flex justify-center mt-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            )}
          </div>
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