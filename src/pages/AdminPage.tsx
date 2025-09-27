 import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Users } from "lucide-react"
import { AdminGuard } from "@/components/auth/PermissionGuard"
import { UserManagementTab } from "@/components/admin/UserManagementTab"
// import { PermissionManagementTab } from "@/components/admin/PermissionManagementTab"
// import { AuditLogTab } from "@/components/admin/AuditLogTab"
// import { ImpersonationPanel } from "@/components/admin/ImpersonationPanel"

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <AdminGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
            <p className="text-gray-600">Manage users, permissions, and system settings</p>
          </div>
          
          {/* <ImpersonationPanel /> */}
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users, permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            {/* <TabsTrigger value="permissions" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Permissions</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Audit Log</span>
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UserManagementTab searchTerm={searchTerm} />
          </TabsContent>

          {/* <TabsContent value="permissions" className="space-y-4">
            <PermissionManagementTab searchTerm={searchTerm} />
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <AuditLogTab searchTerm={searchTerm} />
          </TabsContent> */}
        </Tabs>
      </div>
    </AdminGuard>
  )
}