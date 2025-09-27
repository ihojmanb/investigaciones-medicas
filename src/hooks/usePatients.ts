import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Patient } from '@/types/database'

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPatients = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  return { patients, loading, error, refetch: fetchPatients }
}