// MedChain Blockchain Client
// Ethers.js wrapper for connecting to the local Hardhat node

import { ethers, type Provider, type Signer } from 'ethers';
import { BLOCKCHAIN_RPC_URL, CHAIN_ID } from '@/lib/constants';

let providerInstance: Provider | null = null;

/** Get or create the blockchain provider */
export function getProvider(): Provider {
  if (!providerInstance) {
    providerInstance = new ethers.JsonRpcProvider(BLOCKCHAIN_RPC_URL, {
      name: 'medchain-local',
      chainId: CHAIN_ID,
    });
  }
  return providerInstance;
}

/** Get a signer from a private key */
export function getSigner(privateKey: string): Signer {
  const provider = getProvider();
  return new ethers.Wallet(privateKey, provider as ethers.JsonRpcProvider);
}

/** Get the current block number */
export async function getCurrentBlock(): Promise<number> {
  const provider = getProvider();
  return provider.getBlockNumber();
}

/** Check if the blockchain node is reachable */
export async function isConnected(): Promise<boolean> {
  try {
    const provider = getProvider();
    await provider.getBlockNumber();
    return true;
  } catch {
    return false;
  }
}

/** Get the balance of an address */
export async function getBalance(address: string): Promise<string> {
  const provider = getProvider();
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

/** Wait for a transaction to be confirmed */
export async function waitForTransaction(txHash: string, confirmations = 1) {
  const provider = getProvider();
  return provider.waitForTransaction(txHash, confirmations);
}

/** Reset the provider (useful for testing) */
export function resetProvider(): void {
  providerInstance = null;
}
