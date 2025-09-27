import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { MoreHorizontal, MoreVertical, Plus, Edit, Shield, Ban, CheckCircle, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { UserProfile } from "@/types/auth"
import { toast } from "sonner"

interface UserManagementTabProps {
  searchTerm: string
}

interface Role {
  id: string
  name: string
  description: string
}

export function UserManagementTab({ searchTerm }: UserManagementTabProps) {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const fetchUsers = async () => {
    try {
      // Use admin function to fetch all users (bypasses RLS)
      const { data, error } = await supabase.rpc('get_all_users_for_admin')
      console.log('Admin users fetch:', data)
      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

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

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    try {
      const { error } = await supabase.rpc('change_user_role', {
        target_user_id: userId,
        new_role_name: roles.find(r => r.id === newRoleId)?.name
      })

      if (error) throw error
      
      toast.success('User role updated successfully')
      await fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Error changing role:', error)
      toast.error('Failed to update user role')
    }
  }

  const handleStatusToggle = async (userId: string, newStatus: boolean) => {
    try {
      const { error } = await supabase.rpc('change_user_status', {
        target_user_id: userId,
        new_status: newStatus
      })

      if (error) throw error
      
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`)
      await fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update user status')
    }
  }

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading users...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Users</h3>
          <p className="text-sm text-gray-600">
            Manage user accounts and roles ({filteredUsers.length} users)
          </p>
        </div>
      </div>

      {/* Desktop Users Table */}
      <div className="hidden md:block bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <p className="text-gray-500">
                    {searchTerm ? "No users found matching your search." : "No users found."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.full_name || user.email}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={roles.find(r => r.name === user.role_name)?.id || ''}
                      onValueChange={(newRoleId) => handleRoleChange(user.user_id, newRoleId)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            <div className="capitalize">{role.name}</div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={user.is_active}
                        onCheckedChange={(checked) => handleStatusToggle(user.user_id, checked)}
                      />
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedUser(user)
                          setIsEditDialogOpen(true)
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Permissions
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleStatusToggle(user.user_id, !user.is_active)}
                          className={user.is_active ? "text-red-600" : "text-green-600"}
                        >
                          {user.is_active ? (
                            <>
                              <Ban className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredUsers.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">
              {searchTerm ? "No users found matching your search." : "No users found."}
            </p>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-lg">
                    {user.full_name || user.email}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setSelectedUser(user)
                      setIsEditDialogOpen(true)
                    }}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Permissions
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleStatusToggle(user.user_id, !user.is_active)}
                      className={!user.is_active ? "text-green-600" : "text-red-600"}
                    >
                      {!user.is_active ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Activate
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Deactivate
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Role:</span>
                  <Select
                    value={roles.find(r => r.name === user.role_name)?.id || ''}
                    onValueChange={(value) => handleRoleChange(user.user_id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="capitalize">{role.name}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Status:</span>
                  <Switch
                    checked={user.is_active}
                    onCheckedChange={(checked) => handleStatusToggle(user.user_id, checked)}
                  />
                </div>
                
                <div className="text-xs text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User Permissions</DialogTitle>
            <DialogDescription>
              Manage permissions for {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-600">Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Role</Label>
                  <p className="font-medium capitalize">{selectedUser.role_name}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-gray-600">Role Information</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {selectedUser.role_name || 'operator'}
                  </Badge>
                  {selectedUser.role?.description && (
                    <span className="text-sm text-gray-600">
                      {selectedUser.role.description}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => setIsEditDialogOpen(false)}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}