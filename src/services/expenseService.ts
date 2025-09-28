import { supabase } from '@/lib/supabaseClient'
import { canPatientRegisterVisit } from './visitService'

export interface ExpenseFormData {
  patient: string
  trial: string
  visit: string
  visitDate: Date | undefined
  transportReceipt: string | null // Will be string URLs after upload
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

export const saveExpenseToDatabase = async (formData: ExpenseFormData) => {
  try {
    // Validate that patient can register this visit (uniqueness check)
    const canRegister = await canPatientRegisterVisit(
      formData.patient, 
      formData.trial, 
      formData.visit
    )
    
    if (!canRegister) {
      return {
        success: false,
        error: `El paciente ya tiene registrada la visita "${formData.visit}" para este ensayo, o no es elegible para esta visita.`
      }
    }

    // First, create the patient_expense record
    const { data: patientExpense, error: patientExpenseError } = await supabase
      .from('patient_expenses')
      .insert({
        patient_id: formData.patient,
        trial_id: formData.trial,
        visit_type: formData.visit,
        visit_date: formData.visitDate?.toISOString().split('T')[0] // Convert to YYYY-MM-DD format
      })
      .select()
      .single()

    if (patientExpenseError) throw patientExpenseError

    // Now create expense_items for each expense that has data
    const expenseItems = []

    // Transport
    if (formData.transportReceipt || (formData.transportAmount && parseFloat(formData.transportAmount) > 0)) {
      expenseItems.push({
        patient_expense_id: patientExpense.id,
        type: 'transport',
        receipt_url: formData.transportReceipt,
        cost: parseFloat(formData.transportAmount) || 0
      })
    }

    // Trip expenses
    const trips = [
      { receipt: formData.trip1Receipt, amount: formData.trip1Amount, type: 'trip1' },
      { receipt: formData.trip2Receipt, amount: formData.trip2Amount, type: 'trip2' },
      { receipt: formData.trip3Receipt, amount: formData.trip3Amount, type: 'trip3' },
      { receipt: formData.trip4Receipt, amount: formData.trip4Amount, type: 'trip4' }
    ]

    trips.forEach(trip => {
      if (trip.receipt || (trip.amount && parseFloat(trip.amount) > 0)) {
        expenseItems.push({
          patient_expense_id: patientExpense.id,
          type: trip.type,
          receipt_url: trip.receipt,
          cost: parseFloat(trip.amount) || 0
        })
      }
    })

    // Food
    if (formData.foodReceipt || (formData.foodAmount && parseFloat(formData.foodAmount) > 0)) {
      expenseItems.push({
        patient_expense_id: patientExpense.id,
        type: 'food',
        receipt_url: formData.foodReceipt,
        cost: parseFloat(formData.foodAmount) || 0
      })
    }

    // Accommodation
    if (formData.accommodationReceipt || (formData.accommodationAmount && parseFloat(formData.accommodationAmount) > 0)) {
      expenseItems.push({
        patient_expense_id: patientExpense.id,
        type: 'accommodation',
        receipt_url: formData.accommodationReceipt,
        cost: parseFloat(formData.accommodationAmount) || 0
      })
    }

    // Insert all expense items
    if (expenseItems.length > 0) {
      const { error: expenseItemsError } = await supabase
        .from('expense_items')
        .insert(expenseItems)

      if (expenseItemsError) throw expenseItemsError
    }

    return { success: true, patientExpenseId: patientExpense.id }
  } catch (error) {
    console.error('Error saving expense:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error saving expense' 
    }
  }
}