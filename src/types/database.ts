export interface Patient {
  id: string
  code: string
  first_name: string
  second_name?: string
  first_surname: string
  second_surname?: string
  status: 'active' | 'inactive'
  created_at: string
  modified_at: string
}

export interface Trial {
  id: string
  name: string
  sponsor: string
  description: string
  start_date: string
  end_date: string
  medical_specialty: string
  active: boolean
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

export interface TrialService {
  id: string
  trial_id: string
  name: string
  amount: number
  currency: 'USD' | 'CLP'
  created_at: string
  updated_at: string
}

export interface ServiceAllocation {
  id: string
  trial_service_id: string
  name: string
  amount: number
  currency: 'USD' | 'CLP'
  created_at: string
  updated_at: string
}