// MedChain Blockchain Types

export type TransactionType =
  | 'record_upload'
  | 'record_access'
  | 'consent_grant'
  | 'consent_revoke'
  | 'user_register'
  | 'key_rotation'
  | 'audit_log';

export interface BlockchainTransaction {
  id: string;
  txHash: string;
  blockNumber: number;
  type: TransactionType;
  from: string;
  to?: string;
  data: Record<string, unknown>;
  gasUsed?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
}

export interface ContractEvent {
  name: string;
  txHash: string;
  blockNumber: number;
  args: Record<string, unknown>;
  timestamp: string;
}

export interface ChainConfig {
  rpcUrl: string;
  chainId: number;
  contractAddresses: {
    medicalRecords: string;
    consentManager: string;
    accessControl: string;
  };
}

export interface BlockchainStatus {
  isConnected: boolean;
  currentBlock: number;
  networkName: string;
  chainId: number;
  contractsDeployed: boolean;
}
