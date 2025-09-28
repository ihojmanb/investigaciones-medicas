import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save } from "lucide-react"
import { toast } from "sonner"
import { createTrial, updateTrial, TrialFormData } from "@/services/trialService"
import { Trial } from "@/types/database"

interface TrialFormProps {
  mode?: 'create' | 'edit'
  trial?: Trial
  onSuccess?: () => void
}

export default function TrialForm({ mode = 'create', trial, onSuccess }: TrialFormProps) {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<TrialFormData>({
    name: trial?.name || "",
    sponsor: trial?.sponsor || "",
    description: trial?.description || "",
    start_date: trial?.start_date || "",
    end_date: trial?.end_date || "",
    medical_specialty: trial?.medical_specialty || "",
    active: trial?.active ?? true
  })

  useEffect(() => {
    if (trial && mode === 'edit') {
      setFormData({
        name: trial.name,
        sponsor: trial.sponsor,
        description: trial.description,
        start_date: trial.start_date,
        end_date: trial.end_date,
        medical_specialty: trial.medical_specialty || "",
        active: trial.active
      })
    }
  }, [trial, mode])

  const handleInputChange = (field: keyof TrialFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name.trim()) {
      toast.error('El nombre del estudio es obligatorio')
      return
    }

    try {
      setSaving(true)
      
      if (mode === 'create') {
        await createTrial(formData)
        toast.success('Estudio clínico creado exitosamente')
        if (onSuccess) {
          onSuccess()
        } else {
          navigate('/trials')
        }
      } else if (mode === 'edit' && trial) {
        await updateTrial(trial.id, formData)
        toast.success('Estudio clínico actualizado exitosamente')
        if (onSuccess) {
          onSuccess()
        } else {
          navigate('/trials')
        }
      }
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} trial:`, error)
      toast.error(`Error al ${mode === 'create' ? 'crear' : 'actualizar'} el estudio clínico`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Crear Nuevo Estudio Clínico' : 'Editar Estudio Clínico'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del Estudio *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Ingresa el nombre del estudio"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sponsor">Laboratorio</Label>
          <Input
            id="sponsor"
            value={formData.sponsor}
            onChange={(e) => handleInputChange('sponsor', e.target.value)}
            placeholder="Ingresa el nombre del laboratorio"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Ingresa la descripción del estudio"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="medical_specialty">Especialidad Médica</Label>
          <Input
            id="medical_specialty"
            value={formData.medical_specialty}
            onChange={(e) => handleInputChange('medical_specialty', e.target.value)}
            placeholder="Ingresa la especialidad médica (ej: Cardiología, Oncología)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">Fecha de Inicio</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => handleInputChange('start_date', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">Fecha de Fin</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => handleInputChange('end_date', e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.active}
            onCheckedChange={(checked) => handleInputChange('active', checked)}
          />
          <Label htmlFor="active">Estudio Activo</Label>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSubmit} disabled={saving || !formData.name.trim()}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : (mode === 'create' ? 'Crear Estudio' : 'Actualizar Estudio')}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/trials')}
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}