import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X } from "lucide-react"
import { TrialService } from "@/types/database"
import { TrialServiceFormData } from "@/services/trialService"

interface ServiceFormProps {
  service?: TrialService & { allocations?: any[] }
  onSubmit: (data: TrialServiceFormData) => Promise<void>
  onCancel: () => void
}

export default function ServiceForm({ service, onSubmit, onCancel }: ServiceFormProps) {
  const [formData, setFormData] = useState<TrialServiceFormData>({
    name: service?.name || "",
    amount: service?.amount?.toString() || "",
    currency: service?.currency || 'USD',
    is_visit: service?.is_visit || false,
    visit_order: service?.visit_order || null
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(formData.amount)
    if (!formData.name.trim() || formData.amount.trim() === '' || amount <= 0) return

    try {
      setSaving(true)
      await onSubmit(formData)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof TrialServiceFormData, value: string | number | boolean | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {service ? 'Edit Service' : 'Add Service'}
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter service name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="1"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value: 'USD' | 'CLP') => handleInputChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="CLP">CLP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_visit"
                checked={formData.is_visit}
                onCheckedChange={(checked) => {
                  handleInputChange('is_visit', checked as boolean)
                  if (!checked) {
                    handleInputChange('visit_order', null)
                  }
                }}
              />
              <Label htmlFor="is_visit">This service is a visit</Label>
            </div>

            {formData.is_visit && (
              <div className="space-y-2">
                <Label htmlFor="visit_order">Visit Order (optional - auto-assigned if empty)</Label>
                <Input
                  id="visit_order"
                  type="number"
                  min="1"
                  value={formData.visit_order || ''}
                  onChange={(e) => handleInputChange('visit_order', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Leave empty for auto-assignment"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 pb-2">
            <Button type="submit" disabled={saving || !formData.name.trim() || formData.amount.trim() === '' || parseFloat(formData.amount) <= 0}>
              <Plus className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : (service ? 'Update Service' : 'Add Service')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}