import { supabase } from '@/lib/supabaseClient'
import { Trial, TrialService, ServiceAllocation } from '@/types/database'

export interface TrialFormData {
  name: string
  sponsor: string
  description: string
  start_date: string
  end_date: string
  medical_specialty: string
  active: boolean
}

export interface TrialServiceFormData {
  name: string
  amount: number
  currency: 'USD' | 'CLP'
}

export interface ServiceAllocationFormData {
  name: string
  amount: number
  currency: 'USD' | 'CLP'
}

export interface TrialWithServices extends Trial {
  services?: (TrialService & { allocations?: ServiceAllocation[] })[]
}

export async function getTrialById(id: string): Promise<Trial | null> {
  try {
    const { data, error } = await supabase
      .from('trials')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching trial:', error)
    throw error
  }
}

export async function createTrial(trialData: TrialFormData): Promise<Trial> {
  try {
    const { data, error } = await supabase
      .from('trials')
      .insert({
        name: trialData.name,
        sponsor: trialData.sponsor,
        description: trialData.description,
        start_date: trialData.start_date || null,
        end_date: trialData.end_date || null,
        medical_specialty: trialData.medical_specialty || null,
        active: trialData.active
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating trial:', error)
    throw error
  }
}

export async function updateTrial(id: string, trialData: TrialFormData): Promise<void> {
  try {
    const { error } = await supabase
      .from('trials')
      .update({
        name: trialData.name,
        sponsor: trialData.sponsor,
        description: trialData.description,
        start_date: trialData.start_date || null,
        end_date: trialData.end_date || null,
        medical_specialty: trialData.medical_specialty || null,
        active: trialData.active
      })
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error updating trial:', error)
    throw error
  }
}

export async function getTrialWithServices(id: string): Promise<TrialWithServices | null> {
  try {
    // First get the trial
    const { data: trial, error: trialError } = await supabase
      .from('trials')
      .select('*')
      .eq('id', id)
      .single()

    if (trialError) throw trialError

    // Then get services with their allocations
    const { data: services, error: servicesError } = await supabase
      .from('trial_services')
      .select(`
        *,
        allocations:service_allocations(*)
      `)
      .eq('trial_id', id)
      .order('created_at')

    if (servicesError) throw servicesError

    return {
      ...trial,
      services: services || []
    }
  } catch (error) {
    console.error('Error fetching trial with services:', error)
    throw error
  }
}

// Trial Services CRUD
export async function createTrialService(trialId: string, serviceData: TrialServiceFormData): Promise<TrialService> {
  try {
    const { data, error } = await supabase
      .from('trial_services')
      .insert({
        trial_id: trialId,
        name: serviceData.name,
        amount: serviceData.amount,
        currency: serviceData.currency
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating trial service:', error)
    throw error
  }
}

export async function updateTrialService(id: string, serviceData: TrialServiceFormData): Promise<void> {
  try {
    const { error } = await supabase
      .from('trial_services')
      .update({
        name: serviceData.name,
        amount: serviceData.amount,
        currency: serviceData.currency
      })
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error updating trial service:', error)
    throw error
  }
}

export async function deleteTrialService(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('trial_services')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting trial service:', error)
    throw error
  }
}

// Service Allocations CRUD
export async function createServiceAllocation(serviceId: string, allocationData: ServiceAllocationFormData): Promise<ServiceAllocation> {
  try {
    const { data, error } = await supabase
      .from('service_allocations')
      .insert({
        trial_service_id: serviceId,
        name: allocationData.name,
        amount: allocationData.amount,
        currency: allocationData.currency
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating service allocation:', error)
    throw error
  }
}

export async function updateServiceAllocation(id: string, allocationData: ServiceAllocationFormData): Promise<void> {
  try {
    const { error } = await supabase
      .from('service_allocations')
      .update({
        name: allocationData.name,
        amount: allocationData.amount,
        currency: allocationData.currency
      })
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error updating service allocation:', error)
    throw error
  }
}

export async function deleteServiceAllocation(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('service_allocations')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting service allocation:', error)
    throw error
  }
}