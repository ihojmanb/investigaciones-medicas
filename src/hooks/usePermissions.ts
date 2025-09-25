import { useAuth } from '@/contexts/AuthContext'

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
  const { profile, hasPermission, isAdmin } = useAuth()

  return {
    // Patient permissions
    canCreatePatients: hasPermission('patients:create'),
    canReadPatients: hasPermission('patients:read'),
    canUpdatePatients: hasPermission('patients:update'),
    canDeletePatients: hasPermission('patients:delete'),
    
    // Expense permissions
    canCreateExpenses: hasPermission('expenses:create'),
    canReadExpenses: hasPermission('expenses:read'),
    canUpdateExpenses: hasPermission('expenses:update'),
    canDeleteExpenses: hasPermission('expenses:delete'),
    
    // Trial permissions
    canCreateTrials: hasPermission('trials:create'),
    canReadTrials: hasPermission('trials:read'),
    canUpdateTrials: hasPermission('trials:update'),
    canDeleteTrials: hasPermission('trials:delete'),
    
    // Financial data permissions (sensitive)
    canReadTrialServices: hasPermission('trial_services:read'),
    canManageTrialServices: hasPermission('trial_services:create') || 
                            hasPermission('trial_services:update') || 
                            hasPermission('trial_services:delete'),
    canReadServiceAllocations: hasPermission('service_allocations:read'),
    canManageServiceAllocations: hasPermission('service_allocations:create') || 
                                hasPermission('service_allocations:update') || 
                                hasPermission('service_allocations:delete'),
    
    // Reports permissions
    canReadReports: hasPermission('reports:read'),
    canExportReports: hasPermission('reports:export'),
    
    // Admin permissions
    canManageUsers: hasPermission('users:create') || 
                   hasPermission('users:update') || 
                   hasPermission('users:delete'),
    canManagePermissions: hasPermission('permissions:grant') || 
                         hasPermission('permissions:revoke'),
    canViewAuditLogs: hasPermission('audit:read'),
    canImpersonate: hasPermission('impersonation:use'),
    
    // General checks
    isAdmin: isAdmin(),
    isOperator: profile?.role_name === 'operator',
    isActive: profile?.is_active ?? false
  }
}

// Hook for checking multiple permissions at once
export function useMultiplePermissions(permissions: string[]) {
  const { hasPermission, hasAnyPermission } = useAuth()
  
  return {
    hasAll: permissions.every(permission => hasPermission(permission)),
    hasAny: hasAnyPermission(permissions),
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