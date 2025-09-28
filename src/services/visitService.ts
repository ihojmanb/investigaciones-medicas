import { supabase } from '@/lib/supabaseClient'

export interface Visit {
  id: string
  trial_id: string
  name: string
  visit_order: number
  created_at: string
}

export interface EligibleVisit {
  id: string
  name: string
  visit_order: number
  is_completed: boolean
}

/**
 * Get all visits for a trial from the visits view (operators use this)
 */
export async function getVisitsForTrial(trialId: string): Promise<Visit[]> {
  try {
    const { data, error } = await supabase
      .from('trial_services')
      .select('*')
      .eq('trial_id', trialId)
      .eq('is_visit', true)
      .order('visit_order')

    if (error) throw error
    
    // Map trial_services to Visit format
    return (data || []).map(service => ({
      id: service.id,
      trial_id: service.trial_id,
      name: service.name,
      visit_order: service.visit_order || 0,
      created_at: service.created_at
    }))
  } catch (error) {
    console.error('Error fetching visits for trial:', error)
    throw error
  }
}

/**
 * Get the next available visit order number for a trial
 */
export async function getNextVisitOrder(trialId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('trial_services')
      .select('visit_order')
      .eq('trial_id', trialId)
      .eq('is_visit', true)
      .order('visit_order', { ascending: false })
      .limit(1)

    if (error) throw error
    
    // If no visits exist, start with 1, otherwise increment the highest order
    return data && data.length > 0 ? data[0].visit_order + 1 : 1
  } catch (error) {
    console.error('Error getting next visit order:', error)
    throw error
  }
}

/**
 * Get a single visit by ID
 */
export async function getVisitById(visitId: string): Promise<Visit | null> {
  try {
    const { data, error } = await supabase
      .from('trial_services')
      .select('*')
      .eq('id', visitId)
      .eq('is_visit', true)
      .single()

    if (error) throw error
    
    if (!data) return null
    
    // Map trial_service to Visit format
    return {
      id: data.id,
      trial_id: data.trial_id,
      name: data.name,
      visit_order: data.visit_order || 0,
      created_at: data.created_at
    }
  } catch (error) {
    console.error('Error fetching visit by id:', error)
    throw error
  }
}

/**
 * Get eligible visits for a patient in a trial (with completion status)
 */
export async function getEligibleVisitsForPatient(
  patientId: string, 
  trialId: string
): Promise<EligibleVisit[]> {
  try {
    // Get all visits for the trial
    const visits = await getVisitsForTrial(trialId)
    
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

    // Map visits to eligible visits with completion status
    const eligibleVisits: EligibleVisit[] = visits.map(visit => ({
      id: visit.id,
      name: visit.name,
      visit_order: visit.visit_order,
      is_completed: completedVisitNames.has(visit.name)
    }))

    return eligibleVisits

  } catch (error) {
    console.error('Error getting eligible visits:', error)
    throw error
  }
}

/**
 * Check if a patient can register a specific visit
 */
export async function canPatientRegisterVisit(
  patientId: string,
  trialId: string,
  visitName: string
): Promise<boolean> {
  try {
    const eligibleVisits = await getEligibleVisitsForPatient(patientId, trialId)
    const targetVisit = eligibleVisits.find(v => v.name === visitName)
    
    return targetVisit ? !targetVisit.is_completed : false
  } catch (error) {
    console.error('Error checking visit eligibility:', error)
    return false
  }
}