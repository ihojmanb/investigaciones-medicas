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
      toast.error('Trial name is required')
      return
    }

    try {
      setSaving(true)
      
      if (mode === 'create') {
        await createTrial(formData)
        toast.success('Trial created successfully')
        if (onSuccess) {
          onSuccess()
        } else {
          navigate('/trials')
        }
      } else if (mode === 'edit' && trial) {
        await updateTrial(trial.id, formData)
        toast.success('Trial updated successfully')
        if (onSuccess) {
          onSuccess()
        } else {
          navigate('/trials')
        }
      }
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} trial:`, error)
      toast.error(`Error ${mode === 'create' ? 'creating' : 'updating'} trial`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Create New Trial' : 'Edit Trial'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Trial Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter trial name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sponsor">Sponsor</Label>
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

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSubmit} disabled={saving || !formData.name.trim()}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : (mode === 'create' ? 'Create Trial' : 'Update Trial')}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/trials')}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}