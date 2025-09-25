import { useParams, Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { getTrialWithServices, updateTrial, TrialFormData, TrialWithServices } from "@/services/trialService"
import FeeScheduleSection from "@/components/FeeScheduleSection"

export default function TrialEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
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
          name: data.name,
          sponsor: data.sponsor,
          description: data.description,
          start_date: data.start_date,
          end_date: data.end_date,
          medical_specialty: data.medical_specialty || "",
          active: data.active
        })
      }
    } catch (error) {
      console.error('Error loading trial:', error)
      toast.error('Error loading trial data')
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
      toast.error('Trial name is required')
      return
    }

    try {
      setSaving(true)
      await updateTrial(id, formData)
      toast.success('Trial updated successfully')
      navigate('/trials')
    } catch (error) {
      console.error('Error updating trial:', error)
      toast.error('Error updating trial')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/trials">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Trials
            </Link>
          </Button>
        </div>
        
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading trial data...</p>
        </div>
      </div>
    )
  }

  if (!trial) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/trials">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Trials
            </Link>
          </Button>
        </div>
        
        <div className="text-center py-12">
          <p className="text-gray-500">Trial not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/trials">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Trials
            </Link>
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Trial</h1>
            <p className="text-gray-600">Modify trial information</p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving || !formData.name.trim()}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Trial Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Trial Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter trial name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sponsor">Sponsor *</Label>
            <Input
              id="sponsor"
              value={formData.sponsor}
              onChange={(e) => handleInputChange('sponsor', e.target.value)}
              placeholder="Enter sponsor name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter trial description"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medical_specialty">Medical Specialty</Label>
            <Input
              id="medical_specialty"
              value={formData.medical_specialty}
              onChange={(e) => handleInputChange('medical_specialty', e.target.value)}
              placeholder="Enter medical specialty (e.g., Cardiology, Oncology)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
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
            <Label htmlFor="active">Active Trial</Label>
          </div>
        </CardContent>
      </Card>
      
      {/* Fee Schedule Section */}
      {trial && (
        <FeeScheduleSection
          trialId={trial.id}
          services={trial.services || []}
          onServicesUpdate={loadTrialData}
        />
      )}
    </div>
  )
}