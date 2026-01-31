export type UserRole = 'admin' | 'citizen'

export interface Profile {
  id: string
  email: string
  role: UserRole
  aadhar_hash?: string
  blocked?: boolean
  spam_strikes?: number
  house_no?: string
  colony_name?: string
  pincode?: string
  map_lngh?: string
  created_at?: string
}
