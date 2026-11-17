// MedChain Blockchain Event Listener
// Subscribe to and process contract events

import { type Log, type EventLog } from 'ethers';
import { getMedicalRecordsContract, getConsentManagerContract } from './contracts';
import type { ContractEvent } from '@/types/blockchain';

type EventCallback = (event: ContractEvent) => void;

const listeners = new Map<string, EventCallback[]>();

/** Subscribe to MedicalRecords events */
export function onRecordStored(callback: EventCallback): () => void {
  return addEventListener('RecordStored', callback);
}

/** Subscribe to ConsentGranted events */
export function onConsentGranted(callback: EventCallback): () => void {
  return addEventListener('ConsentGranted', callback);
}

/** Subscribe to ConsentRevoked events */
export function onConsentRevoked(callback: EventCallback): () => void {
  return addEventListener('ConsentRevoked', callback);
}

/** Add an event listener */
function addEventListener(eventName: string, callback: EventCallback): () => void {
  const existing = listeners.get(eventName) || [];
  existing.push(callback);
  listeners.set(eventName, existing);

  // Return unsubscribe function
  return () => {
    const current = listeners.get(eventName) || [];
    const idx = current.indexOf(callback);
    if (idx > -1) current.splice(idx, 1);
    listeners.set(eventName, current);
  };
}

/** Parse a raw log into a ContractEvent */
export function parseEvent(log: Log | EventLog): ContractEvent | null {
  try {
    const eventLog = log as EventLog;
    return {
      name: eventLog.eventName || 'Unknown',
      txHash: eventLog.transactionHash,
      blockNumber: eventLog.blockNumber,
      args: eventLog.args ? Object.fromEntries(
        Object.entries(eventLog.args).filter(([key]) => isNaN(Number(key)))
      ) : {},
      timestamp: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/** Start listening for events (call on app init) */
export async function startEventListeners(): Promise<void> {
  try {
    const recordsContract = getMedicalRecordsContract();
    const consentContract = getConsentManagerContract();

    await recordsContract.on('RecordStored', (...args) => {
      const cbs = listeners.get('RecordStored') || [];
      const event: ContractEvent = {
        name: 'RecordStored',
        txHash: args[args.length - 1]?.log?.transactionHash || '',
        blockNumber: args[args.length - 1]?.log?.blockNumber || 0,
        args: { recordId: args[0], owner: args[1], ipfsHash: args[2] },
        timestamp: new Date().toISOString(),
      };
      cbs.forEach((cb) => cb(event));
    });

    await consentContract.on('ConsentGranted', (...args) => {
      const cbs = listeners.get('ConsentGranted') || [];
      const event: ContractEvent = {
        name: 'ConsentGranted',
        txHash: args[args.length - 1]?.log?.transactionHash || '',
        blockNumber: args[args.length - 1]?.log?.blockNumber || 0,
        args: { patient: args[0], grantee: args[1], scope: args[2] },
        timestamp: new Date().toISOString(),
      };
      cbs.forEach((cb) => cb(event));
    });
  } catch {
    console.warn('Blockchain event listeners could not start — contracts may not be deployed yet.');
  }
}

/** Stop all event listeners */
export function stopEventListeners(): void {
  listeners.clear();
}
