import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/useProfile'
import { usePermissions } from '@/hooks/usePermissions'
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
  const { session } = useAuth()
  const { profile } = useProfile()
  const permissionChecks = usePermissions()

  // Check if user is authenticated
  if (!session) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <ShieldX className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          You must be logged in to access this content.
        </AlertDescription>
      </Alert>
    )
  }

  // If session exists but profile is loading, wait
  if (!profile) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
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

  // Check permissions using our current permission system
  // For now, we'll use a simple mapping of permission strings to our permission checks
  const hasRequiredPermissions = (() => {
    if (allPermissions.length === 0) return true
    
    // Map permission strings to our actual permission checks
    const checkPermission = (perm: string): boolean => {
      // Admin role has all permissions
      if (permissionChecks.isAdmin) return true
      
      // Map specific permissions
      switch (perm) {
        case 'patients:create': return permissionChecks.canCreatePatients
        case 'patients:read': return permissionChecks.canReadPatients
        case 'patients:update': return permissionChecks.canUpdatePatients
        case 'patients:delete': return permissionChecks.canDeletePatients
        
        case 'expenses:create': return permissionChecks.canCreateExpenses
        case 'expenses:read': return permissionChecks.canReadExpenses
        case 'expenses:update': return permissionChecks.canUpdateExpenses
        case 'expenses:delete': return permissionChecks.canDeleteExpenses
        
        case 'trials:create': return permissionChecks.canCreateTrials
        case 'trials:read': return permissionChecks.canReadTrials
        case 'trials:update': return permissionChecks.canUpdateTrials
        case 'trials:delete': return permissionChecks.canDeleteTrials
        
        case 'trial_services:read': return permissionChecks.canReadTrialServices
        case 'service_allocations:read': return permissionChecks.canReadServiceAllocations
        
        case 'reports:read': return permissionChecks.canReadReports
        case 'reports:export': return permissionChecks.canExportReports
        
        default: return false
      }
    }
    
    return requireAll
      ? allPermissions.every(perm => checkPermission(perm))
      : allPermissions.some(perm => checkPermission(perm))
  })()

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