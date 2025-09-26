import { ReactNode, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface RouteGuardProps {
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  role?: 'admin' | 'operator'
  requireAuth?: boolean
  redirectTo?: string
  children: ReactNode
}

export function RouteGuard({
  permission,
  permissions = [],
  requireAll = false,
  role,
  requireAuth = true,
  redirectTo = '/login',
  children
}: RouteGuardProps) {
  const { session } = useAuth()
  const location = useLocation()

  useEffect(() => {
    // Store the attempted URL for redirect after login
    if (requireAuth && !session && location.pathname !== '/login') {
      sessionStorage.setItem('redirectAfterLogin', location.pathname)
    }
  }, [requireAuth, session, location.pathname])

  // Check authentication requirement
  if (requireAuth && !session) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // If authentication is required but user exists, check for profile
  // if (requireAuth && user && !profile) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="flex flex-col items-center space-y-4">
  //         <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
  //         <p className="text-gray-600">Setting up your profile...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // MINIMAL SETUP: Just check authentication, no profile or role checks

  return <>{children}</>
}

// Specialized route guards for common patterns
export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <RouteGuard role="admin">
      {children}
    </RouteGuard>
  )
}

export function PatientRoute({ 
  children, 
  action = 'read' 
}: { 
  children: ReactNode
  action?: 'create' | 'read' | 'update' | 'delete'
}) {
  return (
    <RouteGuard permission={`patients:${action}`}>
      {children}
    </RouteGuard>
  )
}

export function ExpenseRoute({ 
  children, 
  action = 'read' 
}: { 
  children: ReactNode
  action?: 'create' | 'read' | 'update' | 'delete'
}) {
  return (
    <RouteGuard permission={`expenses:${action}`}>
      {children}
    </RouteGuard>
  )
}

export function TrialRoute({ 
  children, 
  action = 'read' 
}: { 
  children: ReactNode
  action?: 'create' | 'read' | 'update' | 'delete'
}) {
  return (
    <RouteGuard permission={`trials:${action}`}>
      {children}
    </RouteGuard>
  )
}

export function ReportsRoute({ children }: { children: ReactNode }) {
  return (
    <RouteGuard permission="reports:read">
      {children}
    </RouteGuard>
  )
}

// Public route (no authentication required)
export function PublicRoute({ children }: { children: ReactNode }) {
  return (
    <RouteGuard requireAuth={false}>
      {children}
    </RouteGuard>
  )
}

// Authentication pages route (redirect if already logged in)
export function AuthRoute({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  
  if (session) {
    const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/'
    sessionStorage.removeItem('redirectAfterLogin')
    return <Navigate to={redirectTo} replace />
  }
  
  return <>{children}</>
}