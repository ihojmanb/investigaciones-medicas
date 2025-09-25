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
  const { user, profile, loading, hasPermission, hasAnyPermission } = useAuth()
  const location = useLocation()

  useEffect(() => {
    // Store the attempted URL for redirect after login
    if (requireAuth && !user && location.pathname !== '/login') {
      sessionStorage.setItem('redirectAfterLogin', location.pathname)
    }
  }, [requireAuth, user, location.pathname])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check authentication requirement
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // If authentication is required but user exists, check for profile
  if (requireAuth && user && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Setting up your profile...</p>
        </div>
      </div>
    )
  }

  // Check if account is active
  if (requireAuth && profile && !profile.is_active) {
    return <Navigate to="/account-inactive" replace />
  }

  // Check role requirement
  if (role && profile?.role_name !== role) {
    return <Navigate to="/unauthorized" replace />
  }

  // Build permissions array
  const allPermissions = [
    ...(permission ? [permission] : []),
    ...permissions
  ]

  // Check permissions if any are specified
  if (allPermissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? allPermissions.every(perm => hasPermission(perm))
      : hasAnyPermission(allPermissions)

    if (!hasRequiredPermissions) {
      return <Navigate to="/unauthorized" replace />
    }
  }

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
  const { user } = useAuth()
  
  if (user) {
    const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/'
    sessionStorage.removeItem('redirectAfterLogin')
    return <Navigate to={redirectTo} replace />
  }
  
  return <>{children}</>
}