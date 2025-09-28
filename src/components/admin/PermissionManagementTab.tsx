import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, Settings } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

interface PermissionManagementTabProps {
  searchTerm: string
}

interface AvailablePermission {
  permission: string
  category: string
  description: string
  is_admin_only: boolean
}

export function PermissionManagementTab({ searchTerm }: PermissionManagementTabProps) {
  const [permissions, setPermissions] = useState<AvailablePermission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('available_permissions')
        .select('*')
        .order('category, permission')

      if (error) throw error
      setPermissions(data || [])
    } catch (error) {
      console.error('Error fetching permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter permissions based on search term
  const filteredPermissions = permissions.filter(permission =>
    permission.permission.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group permissions by category
  const permissionsByCategory = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, AvailablePermission[]>)

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading permissions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Permission Management</h3>
        <p className="text-sm text-gray-600">
          Overview of all available permissions in the system ({filteredPermissions.length} permissions)
        </p>
      </div>

      {/* Permission Categories */}
      <div className="grid gap-6">
        {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                {category === 'Administration' && <Settings className="h-5 w-5 text-gray-600" />}
                {category === 'Financial' && <Shield className="h-5 w-5 text-yellow-600" />}
                {!['Administration', 'Financial'].includes(category) && <Users className="h-5 w-5 text-blue-600" />}
                <CardTitle className="text-base">{category}</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {categoryPermissions.length} permissions
                </Badge>
              </div>
              <CardDescription>
                {category === 'Administration' && 'System administration and user management permissions'}
                {category === 'Financial' && 'Sensitive financial data and reporting permissions'}
                {category === 'Patients' && 'Patient information management permissions'}
                {category === 'Expenses' && 'Expense submission and management permissions'}
                {category === 'Trials' && 'Clinical trial management permissions'}
                {category === 'Reports' && 'Analytics and reporting permissions'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Access Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryPermissions.map((permission) => (
                    <TableRow key={permission.permission}>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {permission.permission}
                        </code>
                      </TableCell>
                      <TableCell className="text-sm">
                        {permission.description}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={permission.is_admin_only ? "destructive" : "default"}
                          className="text-xs"
                        >
                          {permission.is_admin_only ? 'Admin Only' : 'Assignable'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(permissionsByCategory).length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchTerm ? "No permissions found matching your search." : "No permissions available."}
          </p>
        </div>
      )}
    </div>
  )
}