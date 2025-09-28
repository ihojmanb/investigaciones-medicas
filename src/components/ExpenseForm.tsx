import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import MandatoryFields from "./MandatoryFields"
import ExpenseSection from "./ExpenseSection"
import ProgressIndicator from "./ProgressIndicator"
import { Send } from "lucide-react"
import { saveExpenseToDatabase, ExpenseFormData as ServiceExpenseFormData } from "@/services/expenseService"
import { updateExpense, ExpenseFormDataForEdit } from "@/services/patientExpenseService"
import { usePatients } from "@/hooks/usePatients"
import { useTrials } from "@/hooks/useTrials"
import { uploadReceiptFile } from "@/utils/fileUpload"

interface ExpenseFormData {
  // Mandatory fields
  patient: string
  trial: string
  visit: string
  visitDate: Date | undefined
  
  // Optional sections - can be File objects or URL strings
  transportReceipt: File | string | null
  transportAmount: string
  trip1Receipt: File | string | null
  trip1Amount: string
  trip2Receipt: File | string | null
  trip2Amount: string
  trip3Receipt: File | string | null
  trip3Amount: string
  trip4Receipt: File | string | null
  trip4Amount: string
  foodReceipt: File | string | null
  foodAmount: string
  accommodationReceipt: File | string | null
  accommodationAmount: string
}


interface ExpenseFormProps {
  mode?: 'create' | 'edit'
  expenseId?: string
  initialData?: ExpenseFormDataForEdit
  onUpdateSuccess?: () => void
}

export default function ExpenseForm({ 
  mode = 'create', 
  expenseId, 
  initialData, 
  onUpdateSuccess 
}: ExpenseFormProps) {
  const { patients } = usePatients()
  const { trials } = useTrials()
  
  const getInitialFormData = (): ExpenseFormData => {
    if (mode === 'edit' && initialData) {
      return {
        patient: initialData.patient,
        trial: initialData.trial,
        visit: initialData.visit,
        visitDate: initialData.visitDate,
        transportReceipt: initialData.transportReceipt,
        transportAmount: initialData.transportAmount,
        trip1Receipt: initialData.trip1Receipt,
        trip1Amount: initialData.trip1Amount,
        trip2Receipt: initialData.trip2Receipt,
        trip2Amount: initialData.trip2Amount,
        trip3Receipt: initialData.trip3Receipt,
        trip3Amount: initialData.trip3Amount,
        trip4Receipt: initialData.trip4Receipt,
        trip4Amount: initialData.trip4Amount,
        foodReceipt: initialData.foodReceipt,
        foodAmount: initialData.foodAmount,
        accommodationReceipt: initialData.accommodationReceipt,
        accommodationAmount: initialData.accommodationAmount,
      }
    }
    
    return {
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
    }
  }

  const [formData, setFormData] = useState<ExpenseFormData>(getInitialFormData())
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>("")

  // Get names for file upload paths
  const selectedPatient = patients.find(p => p.id === formData.patient)
  const selectedTrial = trials.find(t => t.id === formData.trial)
  const trialName = selectedTrial?.name || ""
  const visitName = formData.visit || ""
  const patientCode = selectedPatient?.code || ""
  
  
  // Helper function to check if a section is complete with new validation rules
  const isSectionComplete = (receipt: File | string | null, amount: string) => {
    const hasReceipt = !!(receipt)
    const hasAmount = !!(amount && amount.trim() !== "")
    
    // If there's a file/receipt, amount becomes mandatory
    if (hasReceipt) {
      return hasAmount
    }
    
    // If no receipt, having amount is sufficient
    return hasAmount
  }

  const mandatoryComplete = !!(formData.patient && formData.trial && formData.visit && formData.visitDate)
  
  const optionalSections = [
    { 
      name: "Transporte", 
      complete: isSectionComplete(formData.transportReceipt, formData.transportAmount)
    },
    { 
      name: "Pasaje 1", 
      complete: isSectionComplete(formData.trip1Receipt, formData.trip1Amount)
    },
    { 
      name: "Pasaje 2", 
      complete: isSectionComplete(formData.trip2Receipt, formData.trip2Amount)
    },
    { 
      name: "Pasaje 3", 
      complete: isSectionComplete(formData.trip3Receipt, formData.trip3Amount)
    },
    { 
      name: "Pasaje 4", 
      complete: isSectionComplete(formData.trip4Receipt, formData.trip4Amount)
    },
    { 
      name: "Alimentación", 
      complete: isSectionComplete(formData.foodReceipt, formData.foodAmount)
    },
    { 
      name: "Alojamiento", 
      complete: isSectionComplete(formData.accommodationReceipt, formData.accommodationAmount)
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
    
    // Validate that amounts are provided when files are uploaded
    const fieldsWithMissingAmounts = []
    const receiptAmountPairs = [
      { receipt: formData.transportReceipt, amount: formData.transportAmount, name: "Transporte" },
      { receipt: formData.trip1Receipt, amount: formData.trip1Amount, name: "Pasaje 1" },
      { receipt: formData.trip2Receipt, amount: formData.trip2Amount, name: "Pasaje 2" },
      { receipt: formData.trip3Receipt, amount: formData.trip3Amount, name: "Pasaje 3" },
      { receipt: formData.trip4Receipt, amount: formData.trip4Amount, name: "Pasaje 4" },
      { receipt: formData.foodReceipt, amount: formData.foodAmount, name: "Alimentación" },
      { receipt: formData.accommodationReceipt, amount: formData.accommodationAmount, name: "Alojamiento" }
    ]
    
    for (const { receipt, amount, name } of receiptAmountPairs) {
      if (receipt && (!amount || amount.trim() === "")) {
        fieldsWithMissingAmounts.push(name)
      }
    }
    
    if (fieldsWithMissingAmounts.length > 0) {
      toast.error("Montos requeridos", {
        description: `Por favor ingresa el monto para: ${fieldsWithMissingAmounts.join(", ")}`
      })
      return
    }
    
    setIsSubmitting(true)
    setUploadProgress("")
    
    try {
      // Upload files first with progress indication
      const processedFormData = { ...formData }
      const fileUploads = []

      // Collect all File objects that need uploading
      const fileFields = [
        { field: 'transportReceipt', type: 'transport' },
        { field: 'trip1Receipt', type: 'trip1' },
        { field: 'trip2Receipt', type: 'trip2' },
        { field: 'trip3Receipt', type: 'trip3' },
        { field: 'trip4Receipt', type: 'trip4' },
        { field: 'foodReceipt', type: 'food' },
        { field: 'accommodationReceipt', type: 'accommodation' }
      ]

      for (const { field, type } of fileFields) {
        const fieldValue = formData[field as keyof ExpenseFormData]
        if (fieldValue instanceof File) {
          fileUploads.push({ field, type, file: fieldValue })
        }
      }

      // Upload files with progress
      if (fileUploads.length > 0) {
        const patientCode = selectedPatient?.code
        if (!patientCode || !trialName || !visitName) {
          throw new Error('Información incompleta para subir archivos')
        }

        for (let i = 0; i < fileUploads.length; i++) {
          const { field, type, file } = fileUploads[i]
          setUploadProgress(`Subiendo archivos (${i + 1}/${fileUploads.length})...`)
          
          console.log(`📤 Uploading file ${i + 1}/${fileUploads.length}:`, {
            field,
            type,
            fileName: file.name,
            patientCode,
            trialName,
            visitName
          })
          
          const { url, error } = await uploadReceiptFile(file, patientCode, type, trialName, visitName)
          
          if (error) {
            console.error(`❌ Upload failed for ${file.name}:`, error)
            throw new Error(`Error subiendo archivo ${file.name}: ${error}`)
          }
          
          console.log(`✅ Upload successful for ${file.name}:`, url)
          
          // Replace File object with URL in processed form data
          processedFormData[field as keyof ExpenseFormData] = url as any
        }
      }

      setUploadProgress(mode === 'edit' ? "Actualizando..." : "Guardando en base de datos...")
      
      let result
      if (mode === 'edit' && expenseId) {
        // Update existing expense
        result = await updateExpense(expenseId, processedFormData as ExpenseFormDataForEdit)
      } else {
        // Create new expense
        result = await saveExpenseToDatabase(processedFormData as ServiceExpenseFormData)
      }
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      const successMessage = mode === 'edit' ? "Expense updated successfully" : "Formulario enviado"
      const successDescription = mode === 'edit' ? 
        "El reembolso de gastos ha sido actualizado correctamente." :
        "El reembolso de gastos ha sido guardado correctamente."
      
      toast.success(successMessage, {
        description: successDescription
      })
      
      if (mode === 'edit' && onUpdateSuccess) {
        onUpdateSuccess()
      } else {
        // Reset form after successful submission (only in create mode)
        setFormData(getInitialFormData())
        setExpandedSections({})
      }
    } catch (error) {
      toast.error("Error al enviar", {
        description: error instanceof Error ? error.message : "Hubo un problema al enviar el formulario. Inténtalo de nuevo."
      })
    } finally {
      setIsSubmitting(false)
      setUploadProgress("")
    }
  }
  
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Form */}
          <div className="flex-1 space-y-6">

            
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
              mode={mode}
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
                onReceiptChange={(receipt) => setFormData(prev => ({ ...prev, transportReceipt: receipt, transportAmount: receipt ? prev.transportAmount : '' }))}
                onAmountChange={(amount) => setFormData(prev => ({ ...prev, transportAmount: amount }))}
                isExpanded={expandedSections.transport || false}
                onToggle={() => toggleSection('transport')}
                hasData={!!(formData.transportReceipt || formData.transportAmount)}
                patientCode={patientCode}
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
                onReceiptChange={(receipt) => setFormData(prev => ({ ...prev, trip1Receipt: receipt, trip1Amount: receipt ? prev.trip1Amount : '' }))}
                onAmountChange={(amount) => setFormData(prev => ({ ...prev, trip1Amount: amount }))}
                isExpanded={expandedSections.trip1 || false}
                onToggle={() => toggleSection('trip1')}
                hasData={!!(formData.trip1Receipt || formData.trip1Amount)}
                patientCode={patientCode}
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
                onReceiptChange={(receipt) => setFormData(prev => ({ ...prev, trip2Receipt: receipt, trip2Amount: receipt ? prev.trip2Amount : '' }))}
                onAmountChange={(amount) => setFormData(prev => ({ ...prev, trip2Amount: amount }))}
                isExpanded={expandedSections.trip2 || false}
                onToggle={() => toggleSection('trip2')}
                hasData={!!(formData.trip2Receipt || formData.trip2Amount)}
                patientCode={patientCode}
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
                onReceiptChange={(receipt) => setFormData(prev => ({ ...prev, trip3Receipt: receipt, trip3Amount: receipt ? prev.trip3Amount : '' }))}
                onAmountChange={(amount) => setFormData(prev => ({ ...prev, trip3Amount: amount }))}
                isExpanded={expandedSections.trip3 || false}
                onToggle={() => toggleSection('trip3')}
                hasData={!!(formData.trip3Receipt || formData.trip3Amount)}
                patientCode={patientCode}
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
                onReceiptChange={(receipt) => setFormData(prev => ({ ...prev, trip4Receipt: receipt, trip4Amount: receipt ? prev.trip4Amount : '' }))}
                onAmountChange={(amount) => setFormData(prev => ({ ...prev, trip4Amount: amount }))}
                isExpanded={expandedSections.trip4 || false}
                onToggle={() => toggleSection('trip4')}
                hasData={!!(formData.trip4Receipt || formData.trip4Amount)}
                patientCode={patientCode}
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
                onReceiptChange={(receipt) => setFormData(prev => ({ ...prev, foodReceipt: receipt, foodAmount: receipt ? prev.foodAmount : '' }))}
                onAmountChange={(amount) => setFormData(prev => ({ ...prev, foodAmount: amount }))}
                isExpanded={expandedSections.food || false}
                onToggle={() => toggleSection('food')}
                hasData={!!(formData.foodReceipt || formData.foodAmount)}
                patientCode={patientCode}
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
                onReceiptChange={(receipt) => setFormData(prev => ({ ...prev, accommodationReceipt: receipt, accommodationAmount: receipt ? prev.accommodationAmount : '' }))}
                onAmountChange={(amount) => setFormData(prev => ({ ...prev, accommodationAmount: amount }))}
                isExpanded={expandedSections.accommodation || false}
                onToggle={() => toggleSection('accommodation')}
                hasData={!!(formData.accommodationReceipt || formData.accommodationAmount)}
                patientCode={patientCode}
                expenseType="accommodation"
                trialName={trialName}
                visitName={visitName}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end pt-6 border-t">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!mandatoryComplete || isSubmitting}
                data-testid="button-submit"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? (uploadProgress || "Enviando...") : "Enviar"}
              </Button>
            </div>
          </div>
          
          {/* Progress Sidebar */}
          <div className="lg:w-80">
            <div className="sticky top-24">
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