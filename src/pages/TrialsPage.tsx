import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit,
  Calendar,
  Users,
  Building
} from "lucide-react"
import { useTrials } from "@/hooks/useTrials"
import { format } from "date-fns"

export default function TrialsPage() {
  const { trials, loading } = useTrials()
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()

  const filteredTrials = trials.filter(trial =>
    trial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trial.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trial.sponsor.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trials</h1>
          <p className="text-gray-600">Manage clinical trials and study protocols</p>
        </div>
        
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading trials...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trials</h1>
          <p className="text-gray-600">Manage clinical trials and study protocols</p>
        </div>
        
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Trial
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trials</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trials.length}</div>
            <p className="text-xs text-muted-foreground">
              Active clinical trials
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trials</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trials.filter(t => {
                const endDate = t.end_date ? new Date(t.end_date) : null
                return endDate && !isNaN(endDate.getTime()) && endDate > new Date()
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sponsors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(trials.map(t => t.sponsor)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique sponsors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trials Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Trials</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search trials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTrials.length === 0 ? (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">
                {searchTerm ? "No trials found matching your search" : "No trials found"}
              </p>
              {!searchTerm && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Trial
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trial Name</TableHead>
                  <TableHead>Sponsor</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrials.map((trial) => {
                  // Safely parse dates with fallback
                  const startDate = trial.start_date ? new Date(trial.start_date) : null
                  const endDate = trial.end_date ? new Date(trial.end_date) : null
                  const now = new Date()
                  
                  const isValidStartDate = startDate && !isNaN(startDate.getTime())
                  const isValidEndDate = endDate && !isNaN(endDate.getTime())
                  
                  const isActive = isValidEndDate ? endDate > now : false
                  const hasStarted = isValidStartDate ? startDate <= now : false
                  
                  let status = "Planned"
                  if (hasStarted && isActive) status = "Active"
                  else if (isValidEndDate && !isActive) status = "Completed"
                  
                  return (
                    <TableRow key={trial.id}>
                      <TableCell className="font-medium">
                        {trial.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {trial.sponsor}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {trial.description}
                      </TableCell>
                      <TableCell>
                        {isValidStartDate ? format(startDate, 'MMM d, yyyy') : 'TBD'}
                      </TableCell>
                      <TableCell>
                        {isValidEndDate ? format(endDate, 'MMM d, yyyy') : 'TBD'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            status === "Active" ? "default" : 
                            status === "Completed" ? "secondary" : "outline"
                          }
                        >
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={trial.active ? "default" : "secondary"}>
                          {trial.active ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/trials/${trial.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Trial
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}