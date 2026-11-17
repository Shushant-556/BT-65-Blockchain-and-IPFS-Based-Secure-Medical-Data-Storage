// MedChain Type Definitions - Index
// Re-exports all type modules for convenient importing

export type { User, UserRole, Session, AuthState } from './auth';
export type { MedicalRecord, RecordType, RecordStatus, RecordMetadata } from './records';
export type { ConsentGrant, ConsentStatus, ConsentScope, AccessRequest } from './consent';
export type { BlockchainTransaction, TransactionType, ContractEvent, ChainConfig } from './blockchain';

// Common utility types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface FilterConfig {
  key: string;
  value: string | string[];
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains';
}
