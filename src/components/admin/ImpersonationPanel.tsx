import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, AlertTriangle, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import { usePermissions } from "@/hooks/usePermissions"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"

interface Role {
  id: string
  name: string
  description: string
}

export function ImpersonationPanel() {
  const { session } = useAuth()
  const { profile, refetch } = useProfile()
  const { canImpersonate } = usePermissions()
  const [roles, setRoles] = useState<Role[]>([])
  const [currentImpersonation, setCurrentImpersonation] = useState<string | null>(null)
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (canImpersonate) {
      fetchRoles()
    }
  }, [canImpersonate])

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('id, name, description')
        .order('name')

      if (error) throw error
      setRoles(data || [])
    } catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  const startImpersonation = async (roleName: string) => {
    if (!canImpersonate) {
      toast.error('You do not have permission to impersonate')
      return
    }

    setLoading(true)
    try {
      // Log the impersonation start
      await supabase.rpc('log_impersonation', {
        target_role_name: roleName,
        action: 'start'
      })

      // Store impersonation state in session storage
      sessionStorage.setItem('impersonating_role', roleName)
      sessionStorage.setItem('original_role', profile?.role_name || '')
      
      setCurrentImpersonation(roleName)
      setIsImpersonating(true)
      
      // Force a page refresh to apply the new permissions context
      // In a real app, you might want to implement this more elegantly
      toast.success(`Now viewing as ${roleName}. Page will refresh.`)
      
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
    } catch (error) {
      console.error('Error starting impersonation:', error)
      toast.error('Failed to start impersonation')
    } finally {
      setLoading(false)
    }
  }

  const stopImpersonation = async () => {
    setLoading(true)
    try {
      const originalRole = sessionStorage.getItem('original_role')
      
      // Log the impersonation end
      await supabase.rpc('log_impersonation', {
        target_role_name: currentImpersonation || 'unknown',
        action: 'end'
      })

      // Clear impersonation state
      sessionStorage.removeItem('impersonating_role')
      sessionStorage.removeItem('original_role')
      
      setCurrentImpersonation(null)
      setIsImpersonating(false)
      
      toast.success(`Stopped impersonating. Returning to ${originalRole} role.`)
      
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
    } catch (error) {
      console.error('Error stopping impersonation:', error)
      toast.error('Failed to stop impersonation')
    } finally {
      setLoading(false)
    }
  }

  // Check if currently impersonating on mount
  useEffect(() => {
    const impersonatingRole = sessionStorage.getItem('impersonating_role')
    if (impersonatingRole) {
      setCurrentImpersonation(impersonatingRole)
      setIsImpersonating(true)
    }
  }, [])

  if (!canImpersonate) {
    return null
  }

  return (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Role Impersonation</CardTitle>
          {isImpersonating && (
            <Badge variant="destructive" className="text-xs">
              <Eye className="w-3 h-3 mr-1" />
              Impersonating
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          View the application as different roles would see it
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {isImpersonating ? (
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Viewing as: {currentImpersonation}
                </span>
              </div>
              <p className="text-xs text-yellow-600 mt-1">
                You are seeing the app as a {currentImpersonation} would
              </p>
            </div>
            
            <Button 
              onClick={stopImpersonation}
              disabled={loading}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <EyeOff className="w-4 h-4 mr-2" />
              )}
              Stop Impersonating
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700">
                View as role:
              </label>
              <Select onValueChange={startImpersonation} disabled={loading}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select role to impersonate" />
                </SelectTrigger>
                <SelectContent>
                  {roles
                    .filter(role => role.name !== profile?.role_name)
                    .map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      <div>
                        <div className="font-medium capitalize">{role.name}</div>
                        <div className="text-xs text-gray-500">{role.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <p className="text-xs text-gray-500">
              Currently viewing as: <strong className="capitalize">{profile?.role_name}</strong>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}