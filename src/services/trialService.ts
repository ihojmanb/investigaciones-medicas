import { supabase } from '@/lib/supabaseClient'
import { Trial } from '@/types/database'

export interface TrialFormData {
  name: string
  sponsor: string
  description: string
  start_date: string
  end_date: string
  active: boolean
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

export async function updateTrial(id: string, trialData: TrialFormData): Promise<void> {
  try {
    const { error } = await supabase
      .from('trials')
      .update({
        name: trialData.name,
        sponsor: trialData.sponsor,
        description: trialData.description,
        start_date: trialData.start_date,
        end_date: trialData.end_date,
        active: trialData.active
      })
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error updating trial:', error)
    throw error
  }
}