import { useProfile } from '@/hooks/useProfile'

export interface PermissionChecks {
  // Patient permissions
  canCreatePatients: boolean
  canReadPatients: boolean
  canUpdatePatients: boolean
  canDeletePatients: boolean
  
  // Expense permissions
  canCreateExpenses: boolean
  canReadExpenses: boolean
  canUpdateExpenses: boolean
  canDeleteExpenses: boolean
  
  // Trial permissions
  canCreateTrials: boolean
  canReadTrials: boolean
  canUpdateTrials: boolean
  canDeleteTrials: boolean
  
  // Financial data permissions (sensitive)
  canReadTrialServices: boolean
  canManageTrialServices: boolean
  canReadServiceAllocations: boolean
  canManageServiceAllocations: boolean
  
  // Reports permissions
  canReadReports: boolean
  canExportReports: boolean
  
  // Admin permissions
  canManageUsers: boolean
  canManagePermissions: boolean
  canViewAuditLogs: boolean
  canImpersonate: boolean
  
  // General checks
  isAdmin: boolean
  isOperator: boolean
  isActive: boolean
}

export function usePermissions(): PermissionChecks {
  const { profile, loading } = useProfile()
  
  // Get user role - default to 'operator' if no profile or loading
  const userRole = profile?.role_name || 'operator'
  const isAdmin = userRole === 'admin'
  const isOperator = userRole === 'operator'
  const isActive = profile?.is_active ?? true
  
  return {
    // Patient permissions - both roles can manage patients
    canCreatePatients: true,
    canReadPatients: true,
    canUpdatePatients: true,
    canDeletePatients: isAdmin, // Only admins can delete patients
    
    // Expense permissions - both roles can manage expenses
    canCreateExpenses: true,
    canReadExpenses: true,
    canUpdateExpenses: true,
    canDeleteExpenses: isAdmin, // Only admins can delete expenses
    
    // Trial permissions - both roles can manage trials
    canCreateTrials: true,
    canReadTrials: true,
    canUpdateTrials: true,
    canDeleteTrials: isAdmin, // Only admins can delete trials
    
    // Financial data permissions (sensitive) - both roles for now
    canReadTrialServices: true,
    canManageTrialServices: true,
    canReadServiceAllocations: true,
    canManageServiceAllocations: true,
    
    // Reports permissions
    canReadReports: true,
    canExportReports: isAdmin, // Only admins can export reports
    
    // Admin permissions - admin only
    canManageUsers: isAdmin,
    canManagePermissions: isAdmin,
    canViewAuditLogs: isAdmin,
    canImpersonate: isAdmin,
    
    // General checks
    isAdmin,
    isOperator,
    isActive
  }
}

// Hook for checking multiple permissions at once
export function useMultiplePermissions(permissions: string[]) {
  const { profile } = useProfile()
  
  // Simple implementation based on role
  const isAdmin = profile?.role_name === 'admin'
  
  const hasPermission = (permission: string): boolean => {
    // Admin has all permissions
    if (isAdmin) return true
    
    // Operators have limited permissions
    if (permission.includes(':delete') || permission.includes('users:') || permission.includes('permissions:')) {
      return false
    }
    return true // Default allow for operators
  }
  
  return {
    hasAll: permissions.every(permission => hasPermission(permission)),
    hasAny: permissions.some(permission => hasPermission(permission)),
    checks: permissions.reduce((acc, permission) => {
      acc[permission] = hasPermission(permission)
      return acc
    }, {} as Record<string, boolean>)
  }
}

// Hook for feature-based permission checking
export function useFeatureAccess() {
  const permissions = usePermissions()
  
  return {
    // Navigation features
    showPatientsSection: permissions.canReadPatients,
    showExpensesSection: permissions.canReadExpenses || permissions.canCreateExpenses,
    showTrialsSection: permissions.canReadTrials,
    showReportsSection: permissions.canReadReports,
    showAdminSection: permissions.isAdmin,
    
    // Page access
    canAccessPatientsPage: permissions.canReadPatients,
    canAccessPatientForm: permissions.canCreatePatients,
    canAccessPatientEdit: permissions.canUpdatePatients,
    
    canAccessExpensesPage: permissions.canReadExpenses,
    canAccessExpenseForm: permissions.canCreateExpenses,
    canAccessExpenseEdit: permissions.canUpdateExpenses,
    
    canAccessTrialsPage: permissions.canReadTrials,
    canAccessTrialForm: permissions.canCreateTrials,
    canAccessTrialEdit: permissions.canUpdateTrials,
    
    canAccessReportsPage: permissions.canReadReports,
    canAccessAdminPage: permissions.canManageUsers,
    
    // Component features
    showCreatePatientButton: permissions.canCreatePatients,
    showEditPatientButton: permissions.canUpdatePatients,
    showDeletePatientButton: permissions.canDeletePatients,
    
    showCreateExpenseButton: permissions.canCreateExpenses,
    showEditExpenseButton: permissions.canUpdateExpenses,
    showDeleteExpenseButton: permissions.canDeleteExpenses,
    
    showCreateTrialButton: permissions.canCreateTrials,
    showEditTrialButton: permissions.canUpdateTrials,
    showDeleteTrialButton: permissions.canDeleteTrials,
    
    // Financial data visibility
    showTrialServices: permissions.canReadTrialServices,
    showServiceAllocations: permissions.canReadServiceAllocations,
    showFinancialReports: permissions.canReadReports,
    
    // Admin features
    showUserManagement: permissions.canManageUsers,
    showPermissionManagement: permissions.canManagePermissions,
    showAuditLogs: permissions.canViewAuditLogs,
    showImpersonation: permissions.canImpersonate
  }
}

// Permission constants for easy reference
export const PERMISSIONS = {
  // Patients
  PATIENTS_CREATE: 'patients:create',
  PATIENTS_READ: 'patients:read',
  PATIENTS_UPDATE: 'patients:update',
  PATIENTS_DELETE: 'patients:delete',
  
  // Expenses
  EXPENSES_CREATE: 'expenses:create',
  EXPENSES_READ: 'expenses:read',
  EXPENSES_UPDATE: 'expenses:update',
  EXPENSES_DELETE: 'expenses:delete',
  
  // Trials
  TRIALS_CREATE: 'trials:create',
  TRIALS_READ: 'trials:read',
  TRIALS_UPDATE: 'trials:update',
  TRIALS_DELETE: 'trials:delete',
  
  // Financial (sensitive)
  TRIAL_SERVICES_READ: 'trial_services:read',
  TRIAL_SERVICES_CREATE: 'trial_services:create',
  TRIAL_SERVICES_UPDATE: 'trial_services:update',
  TRIAL_SERVICES_DELETE: 'trial_services:delete',
  
  SERVICE_ALLOCATIONS_READ: 'service_allocations:read',
  SERVICE_ALLOCATIONS_CREATE: 'service_allocations:create',
  SERVICE_ALLOCATIONS_UPDATE: 'service_allocations:update',
  SERVICE_ALLOCATIONS_DELETE: 'service_allocations:delete',
  
  // Reports
  REPORTS_READ: 'reports:read',
  REPORTS_EXPORT: 'reports:export',
  
  // Admin
  USERS_CREATE: 'users:create',
  USERS_READ: 'users:read',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  
  PERMISSIONS_READ: 'permissions:read',
  PERMISSIONS_GRANT: 'permissions:grant',
  PERMISSIONS_REVOKE: 'permissions:revoke',
  
  AUDIT_READ: 'audit:read',
  IMPERSONATION_USE: 'impersonation:use'
} as const

// Type for permission values
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]