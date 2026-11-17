// MedChain Application Constants

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'MEDCHAIN';
export const APP_DESCRIPTION = 'Your Health. Your Data. Your Control.';
export const APP_VERSION = '0.1.0';

// Authentication
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// File Upload
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/dicom',
  'application/dicom',
  'text/plain',
  'application/json',
  'application/xml',
  'text/xml',
] as const;

// Encryption
export const ENCRYPTION_ALGORITHM = 'AES-256-GCM';
export const KEY_DERIVATION_ITERATIONS = 100000;
export const SALT_LENGTH = 32;
export const IV_LENGTH = 12;
export const TAG_LENGTH = 16;

// Blockchain
export const BLOCKCHAIN_RPC_URL = process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC || 'http://127.0.0.1:8545';
export const CHAIN_ID = 31337; // Hardhat default

// Storage
export const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 'local';
export const IPFS_API_URL = process.env.IPFS_API_URL || 'http://127.0.0.1:5001';
export const IPFS_GATEWAY_URL = process.env.IPFS_GATEWAY_URL || 'http://127.0.0.1:8080';
export const ENCRYPTED_STORAGE_PATH = process.env.ENCRYPTED_STORAGE_PATH || './storage/encrypted';

// Demo Mode
export const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Record Types Labels
export const RECORD_TYPE_LABELS: Record<string, string> = {
  lab_result: 'Lab Result',
  prescription: 'Prescription',
  imaging: 'Imaging',
  clinical_note: 'Clinical Note',
  discharge_summary: 'Discharge Summary',
  immunization: 'Immunization',
  allergy: 'Allergy',
  vital_signs: 'Vital Signs',
  procedure: 'Procedure',
  referral: 'Referral',
  other: 'Other',
} as const;

// User Role Labels
export const ROLE_LABELS: Record<string, string> = {
  patient: 'Patient',
  doctor: 'Doctor',
  hospital_admin: 'Hospital Administrator',
  system_admin: 'System Administrator',
} as const;

// Consent Scope Labels
export const CONSENT_SCOPE_LABELS: Record<string, string> = {
  read: 'Read Only',
  write: 'Read & Write',
  full: 'Full Access',
  emergency: 'Emergency Access',
} as const;

// Navigation Routes
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  patient: {
    dashboard: '/patient',
    vault: '/patient/vault',
    upload: '/patient/upload',
    timeline: '/patient/timeline',
    consent: '/patient/consent',
    privacy: '/patient/privacy',
    notifications: '/patient/notifications',
    settings: '/patient/settings',
    blockchain: '/patient/blockchain',
  },
  doctor: {
    dashboard: '/doctor',
    patients: '/doctor/patients',
    requests: '/doctor/requests',
    notifications: '/doctor/notifications',
    settings: '/doctor/settings',
  },
  hospital: {
    dashboard: '/hospital',
    doctors: '/hospital/doctors',
    records: '/hospital/records',
    settings: '/hospital/settings',
  },
  admin: {
    dashboard: '/admin',
    users: '/admin/users',
    system: '/admin/system',
    audit: '/admin/audit',
  },
} as const;
