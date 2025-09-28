import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, Eye, Edit, Plus } from "lucide-react"
import { usePatients } from "@/hooks/usePatients"
import { useTrials } from "@/hooks/useTrials"
import { formatPatientName, updatePatientStatus } from "@/services/patientService"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import PageHeader from "@/components/PageHeader"

export default function PatientsPage() {
  const { patients, loading: patientsLoading, refetch } = usePatients()
  const { trials } = useTrials()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => {
    const fullName = formatPatientName(patient).toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    return fullName.includes(searchLower) || 
           patient.code.toLowerCase().includes(searchLower) ||
           patient.first_name.toLowerCase().includes(searchLower) ||
           patient.first_surname.toLowerCase().includes(searchLower)
  })

  // Helper function to get trial names (in real app, you'd have patient-trial relationships)
  const getPatientTrials = (patientId: string) => {
    // Mock: assume patients are in first trial for now
    // In real implementation, you'd query patient_trials table
    return trials.slice(0, Math.floor(Math.random() * 2) + 1)
  }

  // Handle status toggle
  const handleStatusToggle = async (patientId: string, newStatus: 'active' | 'inactive') => {
    try {
      await updatePatientStatus(patientId, newStatus)
      toast.success(`Paciente ${newStatus === 'active' ? 'activado' : 'desactivado'} exitosamente`)
      await refetch() // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Error al actualizar el estado del paciente')
    }
  }

  if (patientsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-600">Gestionar información de pacientes e historial de gastos</p>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando pacientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
        <PageHeader
          title="Pacientes"
          subtitle="Gestionar información de pacientes e historial de gastos"
          action={{
            label: "Agregar Paciente",
            icon: <Plus className="w-4 h-4" />,
            onClick: () => navigate("/patients/new")
          }}
        />

      {/* Search - Keep the search bar below the header */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código Paciente</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Estudios Activos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <p className="text-gray-500">
                    {searchTerm ? "No se encontraron pacientes que coincidan con tu búsqueda." : "No se encontraron pacientes."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => {
                const patientTrials = getPatientTrials(patient.id)
                
                return (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.code}</TableCell>
                    <TableCell>{formatPatientName(patient)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={patient.status === 'active'}
                          onCheckedChange={(checked) => 
                            handleStatusToggle(patient.id, checked ? 'active' : 'inactive')
                          }
                        />
                        <span className="text-sm text-gray-600 capitalize">
                          {patient.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {patientTrials.map((trial) => (
                          <Badge key={trial.id} variant="secondary">
                            {trial.name}
                          </Badge>
                        ))}
                      </div>
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
                              Ver Detalles
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/patients/${patient.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar Paciente
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredPatients.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">
              {searchTerm ? "No se encontraron pacientes que coincidan con tu búsqueda." : "No se encontraron pacientes."}
            </p>
          </Card>
        ) : (
          filteredPatients.map((patient) => {
            const patientTrials = getPatientTrials(patient.id)
            
            return (
              <Card key={patient.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-gray-500">{patient.code}</span>
                      <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                        {patient.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-lg">{formatPatientName(patient)}</h3>
                  </div>
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
                          Ver Detalles
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/patients/${patient.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar Paciente
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Control de Estado:</span>
                    <Switch
                      checked={patient.status === 'active'}
                      onCheckedChange={(checked) => handleStatusToggle(patient.id, checked ? 'active' : 'inactive')}
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Estudios Activos:</span>
                    <span className="font-medium">{patientTrials.length}</span>
                  </div>
                  
                  {patientTrials.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-gray-500 text-xs mb-1">Estudios:</p>
                      <div className="flex flex-wrap gap-1">
                        {patientTrials.map((trial) => (
                          <Badge key={trial.id} variant="outline" className="text-xs">
                            {trial.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}