import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Trial } from '@/types/database'

export function useTrials() {
  const [trials, setTrials] = useState<Trial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrials = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('trials')
          .select('*')
          .order('name')

        if (error) throw error

        setTrials(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching trials')
      } finally {
        setLoading(false)
      }
    }

    fetchTrials()
  }, [])

  return { trials, loading, error }
}