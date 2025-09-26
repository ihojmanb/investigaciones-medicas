import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'
import { UserProfile } from '@/types/auth'

interface UseProfileReturn {
  profile: UserProfile | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

interface CachedProfile {
  profile: UserProfile
  timestamp: number
}

// Cache expiration time: 5 minutes
const CACHE_EXPIRATION_MS = 5 * 60 * 1000

export function useProfile(): UseProfileReturn {
  const { session, signOut } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Cache key for localStorage
  const getCacheKey = (userId: string) => `user_profile_${userId}`
  
  // Get cached profile with expiration check
  const getCachedProfile = (userId: string): { profile: UserProfile; isStale: boolean } | null => {
    try {
      const cached = localStorage.getItem(getCacheKey(userId))
      if (!cached) return null
      
      const cachedData: CachedProfile = JSON.parse(cached)
      const isStale = Date.now() - cachedData.timestamp > CACHE_EXPIRATION_MS
      
      return {
        profile: cachedData.profile,
        isStale
      }
    } catch {
      return null
    }
  }
  
  // Cache profile with timestamp
  const setCachedProfile = (userId: string, profile: UserProfile) => {
    try {
      const cachedData: CachedProfile = {
        profile,
        timestamp: Date.now()
      }
      localStorage.setItem(getCacheKey(userId), JSON.stringify(cachedData))
    } catch {
      // Ignore cache errors
    }
  }
  

  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    console.log('fetchProfile')
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          user_id,
          email,
          full_name,
          role_id,
          is_active,
          created_at,
          updated_at,
          role:roles (
            id,
            name,
            description
          )
        `)
        .eq('user_id', userId)
        .single()

      if (error) {
        console.log('Profile fetch error:', error.message, error.code)
        
        // Clear cached profile when any fetch fails to prevent stale cache
        const cacheKey = getCacheKey(userId)
        localStorage.removeItem(cacheKey)
        console.log('🗑️ Cleared cached profile due to fetch error')
        
        // Check if it's an auth-related error (session invalid/expired)
        if (error.code === 'PGRST301' || // JWT expired
            error.code === 'PGRST302' || // JWT invalid
            error.message.includes('JWT') ||
            error.message.includes('expired') ||
            error.message.includes('invalid')) {
          
          console.log('🚨 Auth error detected, signing out:', error.message)
          
          // Auto sign-out to clear stale session
          try {
            await signOut()
          } catch (signOutError) {
            console.log('Sign out error (expected for stale sessions):', signOutError)
            // Even if signOut fails, we should clear local state
            localStorage.clear()
            window.location.href = '/login'
          }
          
          throw new Error('Your session has expired. Please sign in again.')
        }
        
        // Check if user doesn't exist in our database (but has valid session)
        if (error.message.includes('No rows returned') || 
            error.code === 'PGRST116') { // No rows returned
          
          console.log('🚨 User not found in database, signing out:', error.message)
          
          try {
            await signOut()
          } catch (signOutError) {
            console.log('Sign out error (expected for missing users):', signOutError)
            localStorage.clear()
            window.location.href = '/login'
          }
          
          throw new Error('User account not found. Please contact support.')
        }
        
        throw new Error(`Failed to fetch profile: ${error.message}`)
      }

      // Transform the data to match our interface
      // Handle case where Supabase returns role as array or object
      const role = Array.isArray(data.role) ? data.role[0] : data.role
      const transformedProfile: UserProfile = {
        ...data,
        role: role as UserProfile['role'],
        role_name: role?.name || 'operator'
      }

      // Cache the profile
      setCachedProfile(userId, transformedProfile)
      
      return transformedProfile
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error fetching profile')
    }
  }

  const refetch = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    setError(null)

    try {
      const profileData = await fetchProfile(session.user.id)
      setProfile(profileData)
    } catch (err) {
      setError(err as Error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      // User is logged in
      // Load cached profile immediately for instant UI
      const cachedData = getCachedProfile(session.user.id)
      
      if (cachedData) {
        // Set profile from cache immediately
        setProfile(cachedData.profile)
        
        // Always validate cached user still exists by doing a quick fetch
        // This will detect if user was deleted from database
        refetch()
      } else {
        // No cache, need to fetch
        refetch()
      }
    } else {
      // User is logged out, clear profile and cache
      setProfile(null)
      setError(null)
      setLoading(false)
      
      // Clear any cached profiles when signing out
      if (typeof localStorage !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('user_profile_')) {
            localStorage.removeItem(key)
          }
        })
      }
    }
  }, [session?.user?.id])

  return {
    profile,
    loading,
    error,
    refetch
  }
}