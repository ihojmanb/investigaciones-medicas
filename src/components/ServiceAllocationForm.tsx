import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import { ServiceAllocation } from "@/types/database"
import { ServiceAllocationFormData } from "@/services/trialService"

interface ServiceAllocationFormProps {
  allocation?: ServiceAllocation
  maxAmount: number
  currency: 'USD' | 'CLP'
  onSubmit: (data: ServiceAllocationFormData) => Promise<void>
  onCancel: () => void
}

export default function ServiceAllocationForm({ 
  allocation, 
  maxAmount, 
  currency, 
  onSubmit, 
  onCancel 
}: ServiceAllocationFormProps) {
  const [formData, setFormData] = useState<ServiceAllocationFormData>({
    name: allocation?.name || "",
    amount: allocation?.amount?.toString() || "",
    currency: allocation?.currency || currency
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(formData.amount)
    if (!formData.name.trim() || formData.amount.trim() === '' || amount <= 0 || amount > maxAmount) return

    try {
      setSaving(true)
      await onSubmit(formData)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof ServiceAllocationFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const amount = parseFloat(formData.amount)
  const isAmountValid = formData.amount.trim() !== '' && !isNaN(amount) && amount > 0 && amount <= maxAmount

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">
          {allocation ? 'Editar Prestación' : 'Agregar Prestación'}
        </h4>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="allocation-name">Nombre de la Prestación *</Label>
          <Input
            id="allocation-name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Ingresa el nombre de la prestación"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="allocation-amount">
              Monto * (Máx: {maxAmount} {currency})
            </Label>
            <Input
              id="allocation-amount"
              type="number"
              min="0"
              max={maxAmount}
              step="1"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className={!isAmountValid && formData.amount ? "border-red-500" : ""}
              required
            />
            {amount > maxAmount && (
              <p className="text-sm text-red-500">
                El monto no puede exceder el monto del servicio
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="allocation-currency">Moneda</Label>
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

        <div className="flex gap-2">
          <Button 
            type="submit" 
            size="sm"
            disabled={saving || !formData.name.trim() || !isAmountValid}
          >
            <Plus className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : (allocation ? 'Actualizar' : 'Agregar')}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}