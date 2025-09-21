import { supabase } from '@/lib/supabaseClient'
import { VisitType } from '@/types/database'

export interface EligibleVisit {
  id: string
  name: string
  order_number: number
  is_completed: boolean
}

/**
 * Get all visit types for a trial, ordered by sequence
 */
export const getVisitTypesForTrial = async (trialId: string): Promise<VisitType[]> => {
  const { data, error } = await supabase
    .from('visit_types')
    .select('*')
    .eq('trial_id', trialId)
    .order('order_number', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Get eligible visits for a patient in a trial
 * A visit is eligible if:
 * 1. It's the next visit in sequence (no gaps allowed)
 * 2. The patient hasn't already completed it
 */
export const getEligibleVisitsForPatient = async (
  patientId: string, 
  trialId: string
): Promise<EligibleVisit[]> => {
  try {
    // Get all visit types for the trial
    const visitTypes = await getVisitTypesForTrial(trialId)
    
    // Get completed visits for this patient in this trial
    const { data: completedExpenses, error } = await supabase
      .from('patient_expenses')
      .select('visit_type')
      .eq('patient_id', patientId)
      .eq('trial_id', trialId)

    if (error) throw error

    const completedVisitNames = new Set(
      completedExpenses?.map(expense => expense.visit_type) || []
    )

    // Map visit types to eligible visits with completion status
    const eligibleVisits: EligibleVisit[] = visitTypes.map(visitType => ({
      id: visitType.id,
      name: visitType.name,
      order_number: visitType.order_number,
      is_completed: completedVisitNames.has(visitType.name)
    }))

    // Return all visits (both completed and uncompleted) for flexibility
    return eligibleVisits

  } catch (error) {
    console.error('Error getting eligible visits:', error)
    throw error
  }
}

/**
 * Check if a patient can register a specific visit
 */
export const canPatientRegisterVisit = async (
  patientId: string,
  trialId: string,
  visitName: string
): Promise<boolean> => {
  try {
    const eligibleVisits = await getEligibleVisitsForPatient(patientId, trialId)
    const targetVisit = eligibleVisits.find(v => v.name === visitName)
    
    return targetVisit ? !targetVisit.is_completed : false
  } catch (error) {
    console.error('Error checking visit eligibility:', error)
    return false
  }
}