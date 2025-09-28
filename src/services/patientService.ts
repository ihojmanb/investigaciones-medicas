import { supabase } from '@/lib/supabaseClient'
import { Patient } from '@/types/database'

export interface PatientFormData {
  code: string
  first_name: string
  second_name?: string
  first_surname: string
  second_surname?: string
  status: 'active' | 'inactive'
}

export function formatPatientName(patient: Patient): string {
  // Handle cases where new fields might be null (for existing patients)
  const firstName = patient.first_name || 'Unknown'
  const firstSurname = patient.first_surname || 'Unknown'
  
  const surname = patient.second_surname 
    ? `${firstSurname} ${patient.second_surname}`
    : firstSurname

  const name = patient.second_name 
    ? `${firstName} ${patient.second_name}`
    : firstName

  return `${surname}, ${name}`
}

export async function getPatientById(id: string): Promise<Patient | null> {
  try {
    console.log('Fetching patient with ID:', id)
    
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single()

    console.log('Fetch patient response:', { data, error })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching patient:', error)
    throw error
  }
}

export async function createPatient(patientData: PatientFormData): Promise<Patient> {
  try {
    const { data, error } = await supabase
      .from('patients')
      .insert({
        code: patientData.code,
        first_name: patientData.first_name,
        second_name: patientData.second_name || null,
        first_surname: patientData.first_surname,
        second_surname: patientData.second_surname || null,
        status: patientData.status
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    console.error('Error creating patient:', error)
    
    // Handle duplicate patient code error
    if (error?.code === '23505' && error?.message?.includes('patients_code_key')) {
      throw new Error(`El código de paciente '${patientData.code}' ya existe. Por favor, use un código diferente.`)
    }
    
    throw error
  }
}

export async function updatePatient(id: string, patientData: PatientFormData): Promise<void> {
  try {
    // Check authentication status
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Current user:', user)
    console.log('Auth error:', authError)
    
    // Note: modified_at is automatically updated by database trigger
    console.log('Updating patient ID:', id)
    console.log('Update data:', patientData)
    
    const { data, error } = await supabase
      .from('patients')
      .update({
        code: patientData.code,
        first_name: patientData.first_name,
        second_name: patientData.second_name || null,
        first_surname: patientData.first_surname,
        second_surname: patientData.second_surname || null,
        status: patientData.status
      })
      .eq('id', id)
      .select()

    console.log('Supabase update response:', { data, error })

    if (error) {
      console.error('Supabase error details:', error)
      throw error
    }
    
    if (!data || data.length === 0) {
      throw new Error(`Patient with ID ${id} not found. Please check if the patient exists.`)
    }
    
    console.log('Update successful:', data)
  } catch (error) {
    console.error('Error updating patient:', error)
    throw error
  }
}

export async function updatePatientStatus(id: string, status: 'active' | 'inactive'): Promise<void> {
  try {
    // Note: modified_at is automatically updated by database trigger
    const { error } = await supabase
      .from('patients')
      .update({ status })
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error updating patient status:', error)
    throw error
  }
}