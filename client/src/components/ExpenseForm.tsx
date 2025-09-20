import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import MandatoryFields from "./MandatoryFields"
import ExpenseSection from "./ExpenseSection"
import ProgressIndicator from "./ProgressIndicator"
import { Save, Send, Clock } from "lucide-react"

interface ExpenseFormData {
  // Mandatory fields
  patient: string
  study: string
  visit: string
  visitDate: Date | undefined
  
  // Optional sections
  transportReceipt: string | null
  transportAmount: string
  trip1Receipt: string | null
  trip1Amount: string
  trip2Receipt: string | null
  trip2Amount: string
  trip3Receipt: string | null
  trip3Amount: string
  trip4Receipt: string | null
  trip4Amount: string
  foodReceipt: string | null
  foodAmount: string
  accommodationReceipt: string | null
  accommodationAmount: string
}

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>
  onSubmit?: (data: ExpenseFormData) => void
  onSave?: (data: ExpenseFormData) => void
}

export default function ExpenseForm({ initialData, onSubmit, onSave }: ExpenseFormProps) {
  const { toast } = useToast()
  
  const [formData, setFormData] = useState<ExpenseFormData>({
    patient: "",
    study: "",
    visit: "",
    visitDate: undefined,
    transportReceipt: null,
    transportAmount: "",
    trip1Receipt: null,
    trip1Amount: "",
    trip2Receipt: null,
    trip2Amount: "",
    trip3Receipt: null,
    trip3Amount: "",
    trip4Receipt: null,
    trip4Amount: "",
    foodReceipt: null,
    foodAmount: "",
    accommodationReceipt: null,
    accommodationAmount: "",
    ...initialData
  })
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  // Auto-save functionality (demo)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSave && (formData.patient || formData.study || formData.visit)) {
        onSave(formData)
        setLastSaved(new Date())
        console.log('Auto-saved form data')
      }
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [formData, onSave])
  
  const mandatoryComplete = !!(formData.patient && formData.study && formData.visit && formData.visitDate)
  
  const optionalSections = [
    { 
      name: "Transporte", 
      complete: !!(formData.transportReceipt || formData.transportAmount) 
    },
    { 
      name: "Pasaje 1", 
      complete: !!(formData.trip1Receipt || formData.trip1Amount) 
    },
    { 
      name: "Pasaje 2", 
      complete: !!(formData.trip2Receipt || formData.trip2Amount) 
    },
    { 
      name: "Pasaje 3", 
      complete: !!(formData.trip3Receipt || formData.trip3Amount) 
    },
    { 
      name: "Pasaje 4", 
      complete: !!(formData.trip4Receipt || formData.trip4Amount) 
    },
    { 
      name: "Alimentación", 
      complete: !!(formData.foodReceipt || formData.foodAmount) 
    },
    { 
      name: "Alojamiento", 
      complete: !!(formData.accommodationReceipt || formData.accommodationAmount) 
    },
  ]
  
  const completedOptional = optionalSections.filter(s => s.complete).length
  const totalSections = optionalSections.length + 1 // +1 for mandatory
  const totalProgress = mandatoryComplete 
    ? ((1 + completedOptional) / totalSections) * 100 
    : (completedOptional / totalSections) * 100
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }
  
  const handleSubmit = async () => {
    if (!mandatoryComplete) {
      toast({
        title: "Campos obligatorios incompletos",
        description: "Por favor completa todos los campos obligatorios antes de enviar.",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      console.log('Submitting form:', formData)
      if (onSubmit) {
        await onSubmit(formData)
      }
      toast({
        title: "Formulario enviado",
        description: "El reembolso de gastos ha sido enviado correctamente."
      })
    } catch (error) {
      toast({
        title: "Error al enviar",
        description: "Hubo un problema al enviar el formulario. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleSave = () => {
    if (onSave) {
      onSave(formData)
      setLastSaved(new Date())
      toast({
        title: "Borrador guardado",
        description: "Los cambios han sido guardados."
      })
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Form */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">Reembolso de Transporte</h1>
              <p className="text-muted-foreground">
                Completa los campos obligatorios y agrega las secciones opcionales según sea necesario.
              </p>
            </div>
            
            {/* Mandatory Fields */}
            <MandatoryFields
              patient={formData.patient}
              study={formData.study}
              visit={formData.visit}
              visitDate={formData.visitDate}
              onPatientChange={(value) => setFormData(prev => ({ ...prev, patient: value }))}
              onStudyChange={(value) => setFormData(prev => ({ ...prev, study: value }))}
              onVisitChange={(value) => setFormData(prev => ({ ...prev, visit: value }))}
              onVisitDateChange={(date) => setFormData(prev => ({ ...prev, visitDate: date }))}
              isComplete={mandatoryComplete}
            />
            
            {/* Optional Sections */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-foreground">Gastos Opcionales</h2>
              
              <ExpenseSection
                title="Transporte"
                receiptLabel="Recibo Traslado"
                amountLabel="Monto Traslado"
                receipt={formData.transportReceipt}
                amount={formData.transportAmount}
                onReceiptChange={(receipt) => setFormData(prev => ({ ...prev, transportReceipt: receipt }))}
                onAmountChange={(amount) => setFormData(prev => ({ ...prev, transportAmount: amount }))}
                isExpanded={expandedSections.transport || false}
                onToggle={() => toggleSection('transport')}
                hasData={!!(formData.transportReceipt || formData.transportAmount)}
              />
              
              <ExpenseSection
                title="Pasaje 1"
                receiptLabel="Recibo Pasaje 1"
                amountLabel="Monto Pasaje 1"
                receipt={formData.trip1Receipt}
                amount={formData.trip1Amount}
                onReceiptChange={(receipt) => setFormData(prev => ({ ...prev, trip1Receipt: receipt }))}
                onAmountChange={(amount) => setFormData(prev => ({ ...prev, trip1Amount: amount }))}
                isExpanded={expandedSections.trip1 || false}
                onToggle={() => toggleSection('trip1')}
                hasData={!!(formData.trip1Receipt || formData.trip1Amount)}
              />
              
              <ExpenseSection
                title="Pasaje 2"
                receiptLabel="Recibo Pasaje 2"
                amountLabel="Monto Pasaje 2"
                receipt={formData.trip2Receipt}
                amount={formData.trip2Amount}
                onReceiptChange={(receipt) => setFormData(prev => ({ ...prev, trip2Receipt: receipt }))}
                onAmountChange={(amount) => setFormData(prev => ({ ...prev, trip2Amount: amount }))}
                isExpanded={expandedSections.trip2 || false}
                onToggle={() => toggleSection('trip2')}
                hasData={!!(formData.trip2Receipt || formData.trip2Amount)}
              />
              
              <ExpenseSection
                title="Pasaje 3"
                receiptLabel="Recibo Pasaje 3"
                amountLabel="Monto Pasaje 3"
                receipt={formData.trip3Receipt}
                amount={formData.trip3Amount}
                onReceiptChange={(receipt) => setFormData(prev => ({ ...prev, trip3Receipt: receipt }))}
                onAmountChange={(amount) => setFormData(prev => ({ ...prev, trip3Amount: amount }))}
                isExpanded={expandedSections.trip3 || false}
                onToggle={() => toggleSection('trip3')}
                hasData={!!(formData.trip3Receipt || formData.trip3Amount)}
              />
              
              <ExpenseSection
                title="Pasaje 4"
                receiptLabel="Recibo Pasaje 4"
                amountLabel="Monto Pasaje 4"
                receipt={formData.trip4Receipt}
                amount={formData.trip4Amount}
                onReceiptChange={(receipt) => setFormData(prev => ({ ...prev, trip4Receipt: receipt }))}
                onAmountChange={(amount) => setFormData(prev => ({ ...prev, trip4Amount: amount }))}
                isExpanded={expandedSections.trip4 || false}
                onToggle={() => toggleSection('trip4')}
                hasData={!!(formData.trip4Receipt || formData.trip4Amount)}
              />
              
              <ExpenseSection
                title="Alimentación"
                receiptLabel="Recibo Alimentación"
                amountLabel="Monto Alimentación"
                receipt={formData.foodReceipt}
                amount={formData.foodAmount}
                onReceiptChange={(receipt) => setFormData(prev => ({ ...prev, foodReceipt: receipt }))}
                onAmountChange={(amount) => setFormData(prev => ({ ...prev, foodAmount: amount }))}
                isExpanded={expandedSections.food || false}
                onToggle={() => toggleSection('food')}
                hasData={!!(formData.foodReceipt || formData.foodAmount)}
              />
              
              <ExpenseSection
                title="Alojamiento"
                receiptLabel="Recibo Alojamiento"
                amountLabel="Monto Alojamiento"
                receipt={formData.accommodationReceipt}
                amount={formData.accommodationAmount}
                onReceiptChange={(receipt) => setFormData(prev => ({ ...prev, accommodationReceipt: receipt }))}
                onAmountChange={(amount) => setFormData(prev => ({ ...prev, accommodationAmount: amount }))}
                isExpanded={expandedSections.accommodation || false}
                onToggle={() => toggleSection('accommodation')}
                hasData={!!(formData.accommodationReceipt || formData.accommodationAmount)}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <div className="flex-1">
                {lastSaved && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Guardado automáticamente: {lastSaved.toLocaleTimeString()}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSave}
                  data-testid="button-save-draft"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Borrador
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!mandatoryComplete || isSubmitting}
                  data-testid="button-submit"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Enviando..." : "Enviar"}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Progress Sidebar */}
          <div className="lg:w-80">
            <div className="sticky top-8">
              <ProgressIndicator
                mandatoryComplete={mandatoryComplete}
                optionalSections={optionalSections}
                totalProgress={totalProgress}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}