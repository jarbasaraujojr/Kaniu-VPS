// Tipos básicos
export type UUID = string;
export type TimestampTZ = string;

// Enums
export enum AnimalStatus {
  Available = 'available',
  Adopted = 'adopted',
  Hospitalized = 'hospitalized',
  Lost = 'lost',
  Deceased = 'deceased'
}

export enum AdoptionStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Cancelled = 'cancelled'
}

export enum UserRole {
  Admin = 'admin',
  ShelterAdmin = 'shelter_admin',
  RegularUser = 'regular_user'
}

// Interfaces principais
export interface Profile {
  id: UUID;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: TimestampTZ;
  updated_at: TimestampTZ;
  deleted_at?: TimestampTZ;
}

export interface Shelter {
  id: UUID;
  name: string;
  owner_id: UUID;
  address?: {
    street: string;
    number: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  contact_info?: {
    phone: string;
    email: string;
    website?: string;
  };
  created_at: TimestampTZ;
  updated_at: TimestampTZ;
  deleted_at?: TimestampTZ;
}

export interface Animal {
  id: UUID;
  name: string;
  description?: string;
  species_id: number;
  breed_id: number;
  gender: 'Macho' | 'Fêmea' | 'Indefinido';
  size?: string;
  birth_date?: string;
  shelter_id: UUID;
  status: AnimalStatus;
  profile_picture_url?: string;
  created_at: TimestampTZ;
  updated_at: TimestampTZ;
  deleted_at?: TimestampTZ;
}

export interface AnimalAppearance {
  id: UUID;
  animal_id: UUID;
  fur_type_id: number;
  pattern_id: number;
  created_at: TimestampTZ;
}

export interface AnimalColor {
  animal_id: UUID;
  color_id: number;
}

export interface Immunization {
  id: UUID;
  animal_id: UUID;
  vaccine_id: number;
  application_date: TimestampTZ;
  next_application_date?: TimestampTZ;
  notes?: string;
  applied_by: UUID;
  created_at: TimestampTZ;
}

export interface Treatment {
  id: UUID;
  animal_id: UUID;
  treatment_type_id: number;
  medication_id: number;
  start_date: TimestampTZ;
  end_date?: TimestampTZ;
  dose?: number;
  dose_unit?: string;
  frequency?: string;
  notes?: string;
  prescribed_by: UUID;
  status: 'active' | 'completed' | 'cancelled';
  created_at: TimestampTZ;
}

export interface Evaluation {
  id: UUID;
  animal_id: UUID;
  evaluator_id: UUID;
  evaluation_date: TimestampTZ;
  health_score?: number;
  behavior_score?: number;
  sociability_score?: number;
  notes?: string;
  created_at: TimestampTZ;
}

export interface AnimalEvent {
  id: UUID;
  animal_id: UUID;
  event_type: string;
  event_date: TimestampTZ;
  description?: string;
  created_by: UUID;
  created_at: TimestampTZ;
}

export interface Adoption {
  id: UUID;
  animal_id: UUID;
  adopter_id: UUID;
  shelter_id: UUID;
  status: AdoptionStatus;
  message?: string;
  created_at: TimestampTZ;
  updated_at: TimestampTZ;
}

export interface LostFoundReport {
  id: UUID;
  reporter_id: UUID;
  report_type: 'lost' | 'found';
  animal_id?: UUID;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address?: string;
  description?: string;
  matched_report_id?: UUID;
  status: 'open' | 'resolved' | 'cancelled';
  resolved_at?: TimestampTZ;
  created_at: TimestampTZ;
  updated_at: TimestampTZ;
}

// Tipos para requests
export interface CreateAnimalRequest {
  name: string;
  description?: string;
  species_id: number;
  breed_id: number;
  gender: 'Macho' | 'Fêmea' | 'Indefinido';
  size?: string;
  birth_date?: string;
  shelter_id: UUID;
  appearance?: {
    fur_type_id: number;
    pattern_id: number;
    colors: number[];
  };
}

export interface UpdateAnimalRequest {
  id: UUID;
  name?: string;
  description?: string;
  species_id?: number;
  breed_id?: number;
  gender?: 'Macho' | 'Fêmea' | 'Indefinido';
  size?: string;
  birth_date?: string;
  status?: AnimalStatus;
  appearance?: {
    fur_type_id?: number;
    pattern_id?: number;
    colors?: number[];
  };
}

export interface CreateAdoptionRequest {
  animal_id: UUID;
  message?: string;
}

export interface UpdateAdoptionRequest {
  id: UUID;
  status: AdoptionStatus;
  message?: string;
}

export interface CreateLostFoundRequest {
  report_type: 'lost' | 'found';
  animal_id?: UUID;
  location: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  description?: string;
}

// Tipos para responses
export interface AnimalResponse extends Animal {
  shelter: Shelter;
  appearance?: AnimalAppearance & { colors: AnimalColor[] };
  evaluations?: Evaluation[];
  treatments?: Treatment[];
  immunizations?: Immunization[];
  events?: AnimalEvent[];
}

export interface AdoptionResponse extends Adoption {
  animal: Animal;
  adopter: Profile;
  shelter: Shelter;
}

export interface LostFoundResponse extends LostFoundReport {
  reporter: Profile;
  animal?: Animal;
  matched_report?: LostFoundReport;
}

// Tipos para erros
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}