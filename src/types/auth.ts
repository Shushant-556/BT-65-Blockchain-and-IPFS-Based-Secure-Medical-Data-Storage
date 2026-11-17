// MedChain Auth Types

export type UserRole =
  | 'PATIENT'
  | 'DOCTOR'
  | 'HOSPITAL'
  | 'ADMIN'
  | 'patient'
  | 'doctor'
  | 'hospital'
  | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  publicKey?: string;
  avatarUrl?: string;
  isActive?: boolean;
  isVerified?: boolean;
  walletAddress?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  publicKey?: string;
}
