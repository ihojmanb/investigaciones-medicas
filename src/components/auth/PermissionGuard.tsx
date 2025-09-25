import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ShieldX } from 'lucide-react'

interface PermissionGuardProps {
  permission?: string
  permissions?: string[]
  requireAll?: boolean // If true, user must have ALL permissions. If false, user needs ANY permission
  role?: 'admin' | 'operator'
  fallback?: ReactNode
  children: ReactNode
}

export function PermissionGuard({
  permission,
  permissions = [],
  requireAll = false,
  role,
  fallback,
  children
}: PermissionGuardProps) {
  const { profile, hasPermission, hasAnyPermission } = useAuth()

  // Check if user is authenticated
  if (!profile) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <ShieldX className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          You must be logged in to access this content.
        </AlertDescription>
      </Alert>
    )
  }

  // Check if user is active
  if (!profile.is_active) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <ShieldX className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Your account is inactive. Please contact an administrator.
        </AlertDescription>
      </Alert>
    )
  }

  // Check role requirement
  if (role && profile.role_name !== role) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <Alert className="border-red-200 bg-red-50">
        <ShieldX className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          You need {role} role to access this content.
        </AlertDescription>
      </Alert>
    )
  }

  // Build permissions array
  const allPermissions = [
    ...(permission ? [permission] : []),
    ...permissions
  ]

  if (allPermissions.length === 0) {
    // No specific permissions required, just need to be authenticated
    return <>{children}</>
  }

  // Check permissions
  const hasRequiredPermissions = requireAll
    ? allPermissions.every(perm => hasPermission(perm))
    : hasAnyPermission(allPermissions)

  if (!hasRequiredPermissions) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <Alert className="border-red-200 bg-red-50">
        <ShieldX className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          You don't have permission to access this content.
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}

// Specialized guards for common use cases
export function AdminGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard role="admin" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function PatientGuard({ 
  children, 
  fallback,
  action = 'read' 
}: { 
  children: ReactNode
  fallback?: ReactNode
  action?: 'create' | 'read' | 'update' | 'delete'
}) {
  return (
    <PermissionGuard permission={`patients:${action}`} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function ExpenseGuard({ 
  children, 
  fallback,
  action = 'read' 
}: { 
  children: ReactNode
  fallback?: ReactNode
  action?: 'create' | 'read' | 'update' | 'delete'
}) {
  return (
    <PermissionGuard permission={`expenses:${action}`} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function TrialGuard({ 
  children, 
  fallback,
  action = 'read' 
}: { 
  children: ReactNode
  fallback?: ReactNode
  action?: 'create' | 'read' | 'update' | 'delete'
}) {
  return (
    <PermissionGuard permission={`trials:${action}`} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function FinancialGuard({ 
  children, 
  fallback 
}: { 
  children: ReactNode
  fallback?: ReactNode
}) {
  return (
    <PermissionGuard 
      permissions={['trial_services:read', 'service_allocations:read']} 
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

export function ReportsGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard permission="reports:read" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}