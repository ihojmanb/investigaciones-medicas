import { supabase } from '@/lib/supabaseClient'
import { PatientExpense, ExpenseItem, Patient, Trial, VisitType } from '@/types/database'

export interface PatientExpenseWithDetails extends PatientExpense {
  patient: Patient
  trial: Trial
  expense_items: ExpenseItem[]
  visit_type_info?: VisitType
}

export interface ExpenseFormDataForEdit {
  id: string
  patient: string
  trial: string
  visit: string
  visitDate: Date
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

/**
 * Get all expenses for a specific patient
 */
export const getPatientExpenses = async (patientId: string): Promise<PatientExpenseWithDetails[]> => {
  const { data, error } = await supabase
    .from('patient_expenses')
    .select(`
      *,
      patient:patients(*),
      trial:trials(*),
      expense_items(*)
    `)
    .eq('patient_id', patientId)

  if (error) throw error
  
  // Get all visit types to match with expenses
  const { data: visitTypes, error: visitTypesError } = await supabase
    .from('visit_types')
    .select('*')
  
  if (visitTypesError) throw visitTypesError
  
  // Add visit type info to each expense
  const expensesWithVisitInfo = (data || []).map(expense => {
    const visitTypeInfo = visitTypes?.find(vt => 
      vt.trial_id === expense.trial_id && vt.name === expense.visit_type
    )
    return {
      ...expense,
      visit_type_info: visitTypeInfo
    }
  })
  
  // Sort by visit type order_number only
  const sortedData = expensesWithVisitInfo.sort((a, b) => {
    const orderA = a.visit_type_info?.order_number || 999
    const orderB = b.visit_type_info?.order_number || 999
    return orderA - orderB
  })
  
  return sortedData
}

/**
 * Get a specific expense by ID for editing
 */
export const getExpenseForEdit = async (expenseId: string): Promise<ExpenseFormDataForEdit> => {
  const { data: expense, error: expenseError } = await supabase
    .from('patient_expenses')
    .select(`
      *,
      expense_items(*)
    `)
    .eq('id', expenseId)
    .single()

  if (expenseError) throw expenseError

  // Transform expense items into form data structure
  const expenseItems = expense.expense_items || []
  
  const formData: ExpenseFormDataForEdit = {
    id: expense.id,
    patient: expense.patient_id,
    trial: expense.trial_id,
    visit: expense.visit_type,
    visitDate: new Date(expense.visit_date),
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

  // Map expense items to form fields
  expenseItems.forEach((item: ExpenseItem) => {
    switch (item.type) {
      case 'transport':
        formData.transportReceipt = item.receipt_url || null
        formData.transportAmount = item.cost?.toString() || ""
        break
      case 'trip1':
        formData.trip1Receipt = item.receipt_url || null
        formData.trip1Amount = item.cost?.toString() || ""
        break
      case 'trip2':
        formData.trip2Receipt = item.receipt_url || null
        formData.trip2Amount = item.cost?.toString() || ""
        break
      case 'trip3':
        formData.trip3Receipt = item.receipt_url || null
        formData.trip3Amount = item.cost?.toString() || ""
        break
      case 'trip4':
        formData.trip4Receipt = item.receipt_url || null
        formData.trip4Amount = item.cost?.toString() || ""
        break
      case 'food':
        formData.foodReceipt = item.receipt_url || null
        formData.foodAmount = item.cost?.toString() || ""
        break
      case 'accommodation':
        formData.accommodationReceipt = item.receipt_url || null
        formData.accommodationAmount = item.cost?.toString() || ""
        break
    }
  })

  return formData
}

/**
 * Update an existing expense
 */
export const updateExpense = async (expenseId: string, formData: ExpenseFormDataForEdit) => {
  try {
    // Update the patient_expense record
    const { error: expenseError } = await supabase
      .from('patient_expenses')
      .update({
        visit_type: formData.visit,
        visit_date: formData.visitDate.toISOString().split('T')[0]
      })
      .eq('id', expenseId)

    if (expenseError) throw expenseError

    // Delete existing expense items
    const { error: deleteError } = await supabase
      .from('expense_items')
      .delete()
      .eq('patient_expense_id', expenseId)

    if (deleteError) throw deleteError

    // Create new expense items
    const expenseItems = []

    // Transport
    if (formData.transportReceipt || (formData.transportAmount && parseFloat(formData.transportAmount) > 0)) {
      expenseItems.push({
        patient_expense_id: expenseId,
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
          patient_expense_id: expenseId,
          type: trip.type,
          receipt_url: trip.receipt,
          cost: parseFloat(trip.amount) || 0
        })
      }
    })

    // Food
    if (formData.foodReceipt || (formData.foodAmount && parseFloat(formData.foodAmount) > 0)) {
      expenseItems.push({
        patient_expense_id: expenseId,
        type: 'food',
        receipt_url: formData.foodReceipt,
        cost: parseFloat(formData.foodAmount) || 0
      })
    }

    // Accommodation
    if (formData.accommodationReceipt || (formData.accommodationAmount && parseFloat(formData.accommodationAmount) > 0)) {
      expenseItems.push({
        patient_expense_id: expenseId,
        type: 'accommodation',
        receipt_url: formData.accommodationReceipt,
        cost: parseFloat(formData.accommodationAmount) || 0
      })
    }

    // Insert new expense items
    if (expenseItems.length > 0) {
      const { error: expenseItemsError } = await supabase
        .from('expense_items')
        .insert(expenseItems)

      if (expenseItemsError) throw expenseItemsError
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating expense:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error updating expense' 
    }
  }
}