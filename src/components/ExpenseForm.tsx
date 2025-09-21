import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import MandatoryFields from "./MandatoryFields"
import ExpenseSection from "./ExpenseSection"
import ProgressIndicator from "./ProgressIndicator"
import { Save, Send, Clock } from "lucide-react"
import { saveExpenseToDatabase, ExpenseFormData as ServiceExpenseFormData } from "@/services/expenseService"
import { usePatients } from "@/hooks/usePatients"
import { useTrials } from "@/hooks/useTrials"

interface ExpenseFormData {
  // Mandatory fields
  patient: string
  trial: string
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


export default function ExpenseForm() {
  const { patients } = usePatients()
  const { trials } = useTrials()
  
  const [formData, setFormData] = useState<ExpenseFormData>({
    patient: "",
    trial: "",
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
  })
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Get names for file upload paths
  const selectedPatient = patients.find(p => p.id === formData.patient)
  const selectedTrial = trials.find(t => t.id === formData.trial)
  const trialName = selectedTrial?.name || ""
  const visitName = formData.visit || ""
  
  // Auto-save functionality (demo)
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((formData.patient || formData.trial || formData.visit)) {
        setLastSaved(new Date())
        console.log('Auto-saved form data')
      }
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [formData])
  
  const mandatoryComplete = !!(formData.patient && formData.trial && formData.visit && formData.visitDate)
  
  const optionalSections = [
    { 
      name: "Transporte", 
      complete: !!(formData.transportReceipt || (formData.transportAmount && formData.transportAmount.trim() !== ""))
    },
    { 
      name: "Pasaje 1", 
      complete: !!(formData.trip1Receipt || (formData.trip1Amount && formData.trip1Amount.trim() !== ""))
    },
    { 
      name: "Pasaje 2", 
      complete: !!(formData.trip2Receipt || (formData.trip2Amount && formData.trip2Amount.trim() !== ""))
    },
    { 
      name: "Pasaje 3", 
      complete: !!(formData.trip3Receipt || (formData.trip3Amount && formData.trip3Amount.trim() !== ""))
    },
    { 
      name: "Pasaje 4", 
      complete: !!(formData.trip4Receipt || (formData.trip4Amount && formData.trip4Amount.trim() !== ""))
    },
    { 
      name: "Alimentación", 
      complete: !!(formData.foodReceipt || (formData.foodAmount && formData.foodAmount.trim() !== ""))
    },
    { 
      name: "Alojamiento", 
      complete: !!(formData.accommodationReceipt || (formData.accommodationAmount && formData.accommodationAmount.trim() !== ""))
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
      toast.error("Campos obligatorios incompletos", {
        description: "Por favor completa todos los campos obligatorios antes de enviar."
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Save to database
      const result = await saveExpenseToDatabase(formData as ServiceExpenseFormData)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      toast.success("Formulario enviado", {
        description: "El reembolso de gastos ha sido guardado correctamente."
      })
    } catch (error) {
      toast.error("Error al enviar", {
        description: error instanceof Error ? error.message : "Hubo un problema al enviar el formulario. Inténtalo de nuevo."
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleSave = () => {
      setLastSaved(new Date())
      toast("Borrador guardado", {
        description: "Los cambios han sido guardados."
      })
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
              trial={formData.trial}
              visit={formData.visit}
              visitDate={formData.visitDate}
              onPatientChange={(value) => setFormData(prev => ({ ...prev, patient: value }))}
              onTrialChange={(value) => setFormData(prev => ({ ...prev, trial: value }))}
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
                patientId={formData.patient}
                expenseType="transport"
                trialName={trialName}
                visitName={visitName}
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
                patientId={formData.patient}
                expenseType="trip1"
                trialName={trialName}
                visitName={visitName}
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
                patientId={formData.patient}
                expenseType="trip2"
                trialName={trialName}
                visitName={visitName}
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
                patientId={formData.patient}
                expenseType="trip3"
                trialName={trialName}
                visitName={visitName}
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
                patientId={formData.patient}
                expenseType="trip4"
                trialName={trialName}
                visitName={visitName}
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
                patientId={formData.patient}
                expenseType="food"
                trialName={trialName}
                visitName={visitName}
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
                patientId={formData.patient}
                expenseType="accommodation"
                trialName={trialName}
                visitName={visitName}
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