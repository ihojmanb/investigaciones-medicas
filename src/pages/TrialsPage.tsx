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
import PageHeader from "@/components/PageHeader"

export default function TrialsPage() {
  const { trials, loading } = useTrials()
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()

  const filteredTrials = trials.filter(trial =>
    trial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trial.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trial.sponsor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (trial.medical_specialty && trial.medical_specialty.toLowerCase().includes(searchTerm.toLowerCase()))
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
    <div className="">
      <PageHeader
        title="Trials"
        subtitle="Manage clinical trials and study protocols"
        action={{
          label: "New Trial",
          icon: <Plus className="w-4 h-4" />,
          onClick: () => navigate('/trials/new')
        }}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>All Trials</CardTitle>
            <div className="relative w-full sm:w-72">
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
                <Button onClick={() => navigate('/trials/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Trial
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trial Name</TableHead>
                    <TableHead>Sponsor</TableHead>
                    <TableHead className="hidden lg:table-cell">Medical Specialty</TableHead>
                    <TableHead className="hidden xl:table-cell">Description</TableHead>
                    <TableHead className="hidden lg:table-cell">Start Date</TableHead>
                    <TableHead className="hidden lg:table-cell">End Date</TableHead>
                    <TableHead>Status</TableHead>
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
                      <TableCell className="hidden lg:table-cell">
                        {trial.medical_specialty ? (
                          <Badge variant="outline">
                            {trial.medical_specialty}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell max-w-xs truncate">
                        {trial.description}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {isValidStartDate ? format(startDate, 'MMM d, yyyy') : 'TBD'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
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
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredTrials.map((trial) => {
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
                    <Card key={trial.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="font-medium text-lg break-words">{trial.name}</h3>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {trial.sponsor}
                          </Badge>
                        </div>
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
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          <Badge 
                            variant={
                              status === "Active" ? "default" : 
                              status === "Completed" ? "secondary" : "outline"
                            }
                          >
                            {status}
                          </Badge>
                        </div>
                        
                        {trial.medical_specialty && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Specialty:</span>
                            <Badge variant="outline">
                              {trial.medical_specialty}
                            </Badge>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-start">
                          <span className="text-gray-500 flex-shrink-0">Start Date:</span>
                          <span className="text-right break-words">{isValidStartDate ? format(startDate, 'MMM d, yyyy') : 'TBD'}</span>
                        </div>
                        
                        <div className="flex justify-between items-start">
                          <span className="text-gray-500 flex-shrink-0">End Date:</span>
                          <span className="text-right break-words">{isValidEndDate ? format(endDate, 'MMM d, yyyy') : 'TBD'}</span>
                        </div>
                        
                        {trial.description && (
                          <div className="pt-2 border-t">
                            <p className="text-gray-600 text-sm break-words">{trial.description}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}