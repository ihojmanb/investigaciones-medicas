import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { getTrialWithServices, updateTrial, TrialFormData, TrialWithServices } from "@/services/trialService"
import FeeScheduleSection from "@/components/FeeScheduleSection"
import { usePermissions } from "@/hooks/usePermissions"
import PageHeader from "@/components/PageHeader"

export default function TrialEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const permissions = usePermissions()
  const [trial, setTrial] = useState<TrialWithServices | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<TrialFormData>({
    name: "",
    sponsor: "",
    description: "",
    start_date: "",
    end_date: "",
    medical_specialty: "",
    active: true
  })

  useEffect(() => {
    if (id) {
      loadTrialData()
    }
  }, [id])

  const loadTrialData = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      const data = await getTrialWithServices(id)
      if (data) {
        setTrial(data)
        setFormData({
          name: data.name || "",
          sponsor: data.sponsor || "",
          description: data.description || "",
          start_date: data.start_date || "",
          end_date: data.end_date || "",
          medical_specialty: data.medical_specialty || "",
          active: data.active
        })
      }
    } catch (error) {
      console.error('Error loading trial:', error)
      toast.error('Error al cargar datos del estudio clínico')
      navigate('/trials')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof TrialFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!id) return

    // Validation
    if (!formData.name.trim()) {
      toast.error('El nombre del estudio es obligatorio')
      return
    }

    try {
      setSaving(true)
      await updateTrial(id, formData)
      toast.success('Estudio clínico actualizado exitosamente')
      navigate('/trials')
    } catch (error) {
      console.error('Error updating trial:', error)
      toast.error('Error al actualizar el estudio clínico')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Editar Estudio Clínico"
          subtitle="Modificar información del estudio"
          backButton={{
            label: "Volver a Estudios Clínicos",
            icon: <ArrowLeft className="w-4 h-4" />,
            onClick: () => navigate("/trials")
          }}
        />
        
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando datos del estudio clínico...</p>
        </div>
      </div>
    )
  }

  if (!trial) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Editar Estudio Clínico"
          subtitle="Modificar información del estudio"
          backButton={{
            label: "Volver a Estudios Clínicos",
            icon: <ArrowLeft className="w-4 h-4" />,
            onClick: () => navigate("/trials")
          }}
        />
        
        <div className="text-center py-12">
          <p className="text-gray-500">Estudio clínico no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Edit Trial"
        subtitle="Modify trial information"
        backButton={{
          label: "Back to Trials",
          icon: <ArrowLeft className="w-4 h-4" />,
          onClick: () => navigate("/trials")
        }}
        action={{
          label: saving ? 'Guardando...' : 'Guardar Cambios',
          icon: <Save className="w-4 h-4" />,
          onClick: handleSave
        }}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Información del Estudio Clínico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Estudio *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ingresa el nombre del estudio"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sponsor">Laboratorio *</Label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </CardContent>
      </Card>
      
      {/* Fee Schedule Section - Admin Only */}
      {trial && permissions.canManageTrialServices && (
        <div className="mt-6">
          <FeeScheduleSection
            trialId={trial.id}
            services={trial.services || []}
            onServicesUpdate={loadTrialData}
          />
        </div>
      )}
    </div>
  )
}