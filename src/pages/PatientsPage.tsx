import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, Eye, Edit, Plus } from "lucide-react"
import { usePatients } from "@/hooks/usePatients"
import { useTrials } from "@/hooks/useTrials"
import { Link } from "react-router-dom"

export default function PatientsPage() {
  const { patients, loading: patientsLoading } = usePatients()
  const { trials } = useTrials()
  const [searchTerm, setSearchTerm] = useState("")

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Helper function to get trial names (in real app, you'd have patient-trial relationships)
  const getPatientTrials = (patientId: string) => {
    // Mock: assume patients are in first trial for now
    // In real implementation, you'd query patient_trials table
    return trials.slice(0, Math.floor(Math.random() * 2) + 1)
  }

  if (patientsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600">Manage patient information and expense history</p>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading patients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600">Manage patient information and expense history</p>
        </div>
        
        <Button asChild>
          <Link to="/patients/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Active Trials</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <p className="text-gray-500">
                    {searchTerm ? "No patients found matching your search." : "No patients found."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => {
                const patientTrials = getPatientTrials(patient.id)
                
                return (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.code}</TableCell>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {patientTrials.map((trial) => (
                          <Badge key={trial.id} variant="secondary">
                            {trial.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {/* Mock data - in real app, calculate from expense submissions */}
                      {Math.floor(Math.random() * 30) + 1} days ago
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/patients/${patient.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/patients/${patient.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Patient
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}