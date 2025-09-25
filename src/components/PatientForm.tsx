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
      toast.error('Patient code is required')
      return
    }
    if (!formData.first_name.trim()) {
      toast.error('First name is required')
      return
    }
    if (!formData.first_surname.trim()) {
      toast.error('First surname is required')
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
        toast.success('Patient created successfully')
        if (onSuccess) {
          onSuccess()
        } else {
          navigate('/patients')
        }
      } else if (mode === 'edit' && patient) {
        await updatePatient(patient.id, submitData)
        toast.success('Patient updated successfully')
        if (onSuccess) {
          onSuccess()
        } else {
          navigate('/patients')
        }
      }
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} patient:`, error)
      toast.error(`Error ${mode === 'create' ? 'creating' : 'updating'} patient`)
    } finally {
      setSaving(false)
    }
  }

  const isFormValid = formData.code.trim() && formData.first_name.trim() && formData.first_surname.trim()

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Create New Patient' : 'Edit Patient'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="code">Patient Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            placeholder="Enter patient code"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              placeholder="Enter first name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="second_name">Second Name</Label>
            <Input
              id="second_name"
              value={formData.second_name}
              onChange={(e) => handleInputChange('second_name', e.target.value)}
              placeholder="Enter second name (optional)"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_surname">First Surname *</Label>
            <Input
              id="first_surname"
              value={formData.first_surname}
              onChange={(e) => handleInputChange('first_surname', e.target.value)}
              placeholder="Enter first surname"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="second_surname">Second Surname</Label>
            <Input
              id="second_surname"
              value={formData.second_surname}
              onChange={(e) => handleInputChange('second_surname', e.target.value)}
              placeholder="Enter second surname (optional)"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="status"
            checked={formData.status === 'active'}
            onCheckedChange={(checked) => handleInputChange('status', checked ? 'active' : 'inactive')}
          />
          <Label htmlFor="status">Active Status</Label>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSubmit} disabled={saving || !isFormValid}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : (mode === 'create' ? 'Create Patient' : 'Update Patient')}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/patients')}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}