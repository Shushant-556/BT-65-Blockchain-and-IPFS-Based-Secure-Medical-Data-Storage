// MedChain Consent Management Types

export type ConsentStatus = 'pending' | 'granted' | 'denied' | 'revoked' | 'expired';

export type ConsentScope = 'read' | 'write' | 'full' | 'emergency';

export interface ConsentGrant {
  id: string;
  patientId: string;
  grantedTo: string;
  grantedToName: string;
  grantedToRole: string;
  scope: ConsentScope;
  status: ConsentStatus;
  recordIds?: string[];
  allRecords: boolean;
  reason?: string;
  expiresAt?: string;
  blockchainTxHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccessRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterRole: string;
  patientId: string;
  scope: ConsentScope;
  reason: string;
  recordIds?: string[];
  allRecords: boolean;
  status: ConsentStatus;
  isEmergency: boolean;
  createdAt: string;
  respondedAt?: string;
}

export interface ConsentFormData {
  grantedTo: string;
  scope: ConsentScope;
  recordIds?: string[];
  allRecords: boolean;
  reason?: string;
  expiresAt?: string;
}

export interface AccessRequestFormData {
  patientId: string;
  scope: ConsentScope;
  reason: string;
  recordIds?: string[];
  allRecords: boolean;
  isEmergency: boolean;
}
