// MedChain Medical Records Types

export type RecordType =
  | 'lab_result'
  | 'prescription'
  | 'imaging'
  | 'clinical_note'
  | 'discharge_summary'
  | 'immunization'
  | 'allergy'
  | 'vital_signs'
  | 'procedure'
  | 'referral'
  | 'other';

export type RecordStatus = 'active' | 'amended' | 'archived' | 'deleted';

export interface RecordMetadata {
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  checksum: string;
  encryptionAlgorithm: string;
  ipfsCid?: string;
  localPath?: string;
  fhirResourceType?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  title: string;
  description?: string;
  type: RecordType;
  status: RecordStatus;
  metadata: RecordMetadata;
  blockchainTxHash?: string;
  encryptedDataRef: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface RecordUploadData {
  title: string;
  description?: string;
  type: RecordType;
  file: File;
  tags?: string[];
}

export interface RecordSearchParams {
  query?: string;
  type?: RecordType;
  status?: RecordStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}
