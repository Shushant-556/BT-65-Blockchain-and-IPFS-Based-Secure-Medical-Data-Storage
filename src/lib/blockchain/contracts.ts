// MedChain Smart Contract Interfaces
// Contract ABIs and factory functions

import { ethers, type Signer } from 'ethers';
import { getProvider } from './client';

// Contract addresses — populated after deployment
export const CONTRACT_ADDRESSES = {
  medicalRecords: process.env.NEXT_PUBLIC_MEDICAL_RECORDS_CONTRACT || '',
  consentManager: process.env.NEXT_PUBLIC_CONSENT_MANAGER_CONTRACT || '',
  accessControl: process.env.NEXT_PUBLIC_ACCESS_CONTROL_CONTRACT || '',
} as const;

// Minimal ABIs — will be replaced with full ABIs after contract compilation
const MEDICAL_RECORDS_ABI = [
  'function storeRecord(string recordId, string ipfsHash, bytes32 checksum) external',
  'function getRecord(string recordId) external view returns (string, bytes32, uint256)',
  'function recordExists(string recordId) external view returns (bool)',
  'event RecordStored(string indexed recordId, address indexed owner, string ipfsHash, uint256 timestamp)',
] as const;

const CONSENT_MANAGER_ABI = [
  'function grantConsent(address grantee, string scope, uint256 expiry) external',
  'function revokeConsent(address grantee) external',
  'function hasConsent(address patient, address grantee) external view returns (bool)',
  'event ConsentGranted(address indexed patient, address indexed grantee, string scope, uint256 expiry)',
  'event ConsentRevoked(address indexed patient, address indexed grantee, uint256 timestamp)',
] as const;

/** Get the MedicalRecords contract instance */
export function getMedicalRecordsContract(signer?: Signer) {
  const address = CONTRACT_ADDRESSES.medicalRecords;
  if (!address) throw new Error('MedicalRecords contract not deployed');
  const providerOrSigner = signer || getProvider();
  return new ethers.Contract(address, MEDICAL_RECORDS_ABI, providerOrSigner);
}

/** Get the ConsentManager contract instance */
export function getConsentManagerContract(signer?: Signer) {
  const address = CONTRACT_ADDRESSES.consentManager;
  if (!address) throw new Error('ConsentManager contract not deployed');
  const providerOrSigner = signer || getProvider();
  return new ethers.Contract(address, CONSENT_MANAGER_ABI, providerOrSigner);
}
