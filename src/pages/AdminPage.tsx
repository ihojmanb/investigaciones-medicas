import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Users } from "lucide-react"
import { AdminGuard } from "@/components/auth/PermissionGuard"
import { UserManagementTab } from "@/components/admin/UserManagementTab"
import PageHeader from "@/components/PageHeader"
// import { PermissionManagementTab } from "@/components/admin/PermissionManagementTab"
// import { AuditLogTab } from "@/components/admin/AuditLogTab"
// import { ImpersonationPanel } from "@/components/admin/ImpersonationPanel"

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <AdminGuard>
      <div>
        <PageHeader
          title="Administration"
          subtitle="Manage users, permissions, and system settings"
        />

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