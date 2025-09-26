export interface UserProfile {
  id: string
  user_id: string
  email: string
  full_name?: string
  role_id: string
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined from roles table
  role?: {
    id: string
    name: string
    description?: string
  }
  // Computed properties for convenience
  role_name?: string
}

export interface Role {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}