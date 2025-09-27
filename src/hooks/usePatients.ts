import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Patient } from '@/types/database'

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .order('first_surname')
          .order('first_name')

        if (error) throw error

        setPatients(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching patients')
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  return { patients, loading, error }
}