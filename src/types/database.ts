export interface Patient {
  id: string
  code: string
  name: string
  created_at: string
}

export interface Trial {
  id: string
  name: string
  sponsor: string
  description: string
  created_at: string
}

export interface VisitType {
  id: string
  trial_id: string
  name: string
  order_number: number
  created_at: string
}

export interface PatientExpense {
  id: string
  patient_id: string
  trial_id: string
  visit_type: string
  visit_date: string
  created_at: string
  modified_at: string
}

export interface ExpenseItem {
  id: string
  patient_expense_id: string
  type: string
  receipt_url?: string
  cost: number
  created_at: string
  modified_at: string
}