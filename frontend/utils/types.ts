// Tipos do sistema
export enum AdoptionStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Cancelled = 'cancelled'
}

export interface Animal {
  id: string
  name: string
  species: string
  breed?: string
  age?: number
  age_unit?: 'years' | 'months'
  gender: 'male' | 'female'
  size: 'small' | 'medium' | 'large'
  weight?: number
  color: string
  description?: string
  shelter_id: string
  status: 'available' | 'adopted' | 'fostered' | 'pending' | 'unavailable'
  photos?: string[]
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  city?: string
  state?: string
  created_at: string
  updated_at: string
}

export interface Shelter {
  id: string
  name: string
  owner_id: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  description?: string
  photos?: string[]
  created_at: string
  updated_at: string
}

export interface Adoption {
  id: string
  animal_id: string
  adopter_id: string
  shelter_id: string
  message?: string
  status: AdoptionStatus
  created_at: string
  updated_at: string
  animal?: Animal
  adopter?: Profile
  shelter?: Shelter
}