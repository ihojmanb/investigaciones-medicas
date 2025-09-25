import { useState, useEffect } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

interface AuditLogTabProps {
  searchTerm: string
}

interface AuditLogEntry {
  id: string
  user_email: string
  user_name: string
  performed_by_email: string
  performed_by_name: string
  action: string
  permission: string
  old_value: string
  new_value: string
  performed_at: string
  ip_address: string
}

export function AuditLogTab({ searchTerm }: AuditLogTabProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [timeFilter, setTimeFilter] = useState<string>('7d')

  useEffect(() => {
    fetchAuditLogs()
  }, [timeFilter])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('permission_audit_details')
        .select('*')
        .order('performed_at', { ascending: false })
        .limit(100)

      // Apply time filter
      if (timeFilter !== 'all') {
        const days = parseInt(timeFilter.replace('d', ''))
        const dateFrom = new Date()
        dateFrom.setDate(dateFrom.getDate() - days)
        
        query = query.gte('performed_at', dateFrom.toISOString())
      }

      const { data, error } = await query

      if (error) throw error
      setAuditLogs(data || [])
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'grant': return 'default'
      case 'revoke': return 'destructive'
      case 'role_change': return 'secondary'
      case 'impersonate': return 'outline'
      default: return 'secondary'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'grant': return '✓'
      case 'revoke': return '✗'
      case 'role_change': return '↔'
      case 'impersonate': return '👁'
      default: return '●'
    }
  }

  // Filter logs based on search term and action filter
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.permission?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter
    
    return matchesSearch && matchesAction
  })

  const exportAuditLog = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Permission', 'Old Value', 'New Value', 'Performed By', 'IP Address'],
      ...filteredLogs.map(log => [
        new Date(log.performed_at).toLocaleString(),
        log.user_email || '',
        log.action || '',
        log.permission || '',
        log.old_value || '',
        log.new_value || '',
        log.performed_by_email || '',
        log.ip_address || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Audit Log</h3>
          <p className="text-sm text-gray-600">
            Track all permission and role changes ({filteredLogs.length} entries)
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={exportAuditLog}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={fetchAuditLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Time Range:</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Action:</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="grant">Grant Permission</SelectItem>
                  <SelectItem value="revoke">Revoke Permission</SelectItem>
                  <SelectItem value="role_change">Role Change</SelectItem>
                  <SelectItem value="impersonate">Impersonation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Performed By</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <p className="text-gray-500">Loading audit logs...</p>
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <p className="text-gray-500">
                    {searchTerm ? "No audit logs found matching your search." : "No audit logs available."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">
                    {new Date(log.performed_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{log.user_name || log.user_email}</div>
                      {log.user_name && (
                        <div className="text-gray-500">{log.user_email}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(log.action)} className="text-xs">
                      {getActionIcon(log.action)} {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.permission && (
                      <div>
                        <code className="text-xs bg-gray-100 px-1 rounded">
                          {log.permission}
                        </code>
                      </div>
                    )}
                    {(log.old_value || log.new_value) && (
                      <div className="text-xs text-gray-600 mt-1">
                        {log.old_value && <span>From: {log.old_value}</span>}
                        {log.old_value && log.new_value && <span> → </span>}
                        {log.new_value && <span>To: {log.new_value}</span>}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.performed_by_name || log.performed_by_email || 'System'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {log.ip_address || 'N/A'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}