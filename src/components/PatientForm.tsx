import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save } from "lucide-react"
import { toast } from "sonner"
import { createPatient, updatePatient, PatientFormData } from "@/services/patientService"
import { Patient } from "@/types/database"

interface PatientFormProps {
  mode?: 'create' | 'edit'
  patient?: Patient
  onSuccess?: () => void
}

export default function PatientForm({ mode = 'create', patient, onSuccess }: PatientFormProps) {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<PatientFormData>({
    code: patient?.code || "",
    first_name: patient?.first_name || "",
    second_name: patient?.second_name || "",
    first_surname: patient?.first_surname || "",
    second_surname: patient?.second_surname || "",
    status: patient?.status || 'active'
  })

  useEffect(() => {
    if (patient && mode === 'edit') {
      setFormData({
        code: patient.code,
        first_name: patient.first_name || "",
        second_name: patient.second_name || "",
        first_surname: patient.first_surname || "",
        second_surname: patient.second_surname || "",
        status: patient.status || 'active'
      })
    }
  }, [patient, mode])

  const handleInputChange = (field: keyof PatientFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.code.trim()) {
      toast.error('El código del paciente es obligatorio')
      return
    }
    if (!formData.first_name.trim()) {
      toast.error('El primer nombre es obligatorio')
      return
    }
    if (!formData.first_surname.trim()) {
      toast.error('El primer apellido es obligatorio')
      return
    }

    try {
      setSaving(true)
      
      const submitData: PatientFormData = {
        ...formData,
        second_name: formData.second_name?.trim() || undefined,
        second_surname: formData.second_surname?.trim() || undefined,
      }
      
      if (mode === 'create') {
        await createPatient(submitData)
        toast.success('Paciente creado exitosamente')
        if (onSuccess) {
          onSuccess()
        } else {
          navigate('/patients')
        }
      } else if (mode === 'edit' && patient) {
        await updatePatient(patient.id, submitData)
        toast.success('Paciente actualizado exitosamente')
        if (onSuccess) {
          onSuccess()
        } else {
          navigate('/patients')
        }
      }
    } catch (error: any) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} patient:`, error)
      const errorMessage = error?.message || `Error ${mode === 'create' ? 'creating' : 'updating'} patient`
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const isFormValid = formData.code.trim() && formData.first_name.trim() && formData.first_surname.trim()

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Crear Nuevo Paciente' : 'Editar Paciente'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="code">Código del Paciente *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            placeholder="Ingresa el código del paciente"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">Primer Nombre *</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              placeholder="Ingresa el primer nombre"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="second_name">Segundo Nombre</Label>
            <Input
              id="second_name"
              value={formData.second_name}
              onChange={(e) => handleInputChange('second_name', e.target.value)}
              placeholder="Ingresa el segundo nombre (opcional)"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_surname">Primer Apellido *</Label>
            <Input
              id="first_surname"
              value={formData.first_surname}
              onChange={(e) => handleInputChange('first_surname', e.target.value)}
              placeholder="Ingresa el primer apellido"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="second_surname">Segundo Apellido</Label>
            <Input
              id="second_surname"
              value={formData.second_surname}
              onChange={(e) => handleInputChange('second_surname', e.target.value)}
              placeholder="Ingresa el segundo apellido (opcional)"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="status"
            checked={formData.status === 'active'}
            onCheckedChange={(checked) => handleInputChange('status', checked ? 'active' : 'inactive')}
          />
          <Label htmlFor="status">Estado Activo</Label>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSubmit} disabled={saving || !isFormValid}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : (mode === 'create' ? 'Crear Paciente' : 'Actualizar Paciente')}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/patients')}
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}