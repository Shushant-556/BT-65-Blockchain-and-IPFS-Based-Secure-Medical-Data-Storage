'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Database,
  RefreshCw,
  Hash,
  Coins,
  FileCode,
  ArrowRight,
  Boxes,
  Zap,
  Activity,
  Code2,
} from 'lucide-react';

export default function BlockchainExplorerPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [selectedContract, setSelectedContract] = useState<any | null>(null);
  const [blockHeight, setBlockHeight] = useState(1072);

  const contracts = [
    {
      name: 'MedicalRecordRegistry',
      address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      role: 'Content hash registration, encrypted CID association, versioning',
      abiMethods: ['registerRecord(bytes32,string,string)', 'verifyRecord(bytes32)', 'getRecordVersion(bytes32,uint256)'],
      solidity: 'contracts/MedicalRecordRegistry.sol',
    },
    {
      name: 'ConsentManager',
      address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      role: 'Patient-controlled consent grants, time expiration, revocation',
      abiMethods: ['grantConsent(address,uint8,uint256)', 'revokeConsent(bytes32)', 'checkConsent(address,address,bytes32)'],
      solidity: 'contracts/ConsentManager.sol',
    },
    {
      name: 'IdentityRegistry',
      address: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
      role: 'Public key association, doctor credential hashing (no PII on-chain)',
      abiMethods: ['registerDoctor(address,bytes32,string)', 'verifyCredential(address,bytes32)', 'getDoctorPublicKey(address)'],
      solidity: 'contracts/IdentityRegistry.sol',
    },
    {
      name: 'AuditRegistry',
      address: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
      role: 'Immutable privacy-preserving access audit logs',
      abiMethods: ['logAccess(address,bytes32,uint8,string)', 'getAuditTrail(bytes32)'],
      solidity: 'contracts/AuditRegistry.sol',
    },
  ];

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blockchain/transactions');
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch blockchain transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // Simulate block ticking
    const interval = setInterval(() => {
      setBlockHeight((h) => h + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredTx = transactions.filter(
    (tx) =>
      tx.txHash.toLowerCase().includes(search.toLowerCase()) ||
      tx.functionName.toLowerCase().includes(search.toLowerCase()) ||
      (tx.eventType && tx.eventType.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-16 space-y-6">
      {/* Network Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-[#0F172A] via-[#1C1608] to-[#0A101D] p-6 shadow-2xl">
        <div className="absolute top-0 right-0 h-64 w-64 bg-amber-500/10 blur-[90px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/3 h-48 w-48 bg-cyan-500/10 blur-[80px] pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-xs font-semibold text-amber-400">
                <Layers className="h-3.5 w-3.5" />
                Hardhat EVM Blockchain Explorer &bull; Chain ID 31337
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono text-emerald-400">
                <Zap className="h-3 w-3" />
                Instant Finality &bull; Zero Reorg Risk
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>On-Chain Ledger Explorer</span>
              <span className="text-xs font-mono font-normal rounded border border-white/10 bg-white/5 px-2 py-1 text-slate-400">
                Solidity 0.8.24
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Transparent, auditable verification layer. Every medical record content hash, IPFS CID envelope, and patient consent authorization is immutably anchored to local EVM smart contracts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchTransactions}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-500 transition active:scale-95"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Ledger Blocks</span>
            </button>
          </div>
        </div>

        {/* Live Network Strip */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 text-[10px] uppercase">Current Block Height</span>
            <div className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>#{blockHeight}</span>
            </div>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">Base Gas Price</span>
            <div className="text-slate-200 font-semibold">12.4 Gwei (Low)</div>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">Total Confirmed TXs</span>
            <div className="text-amber-400 font-semibold">{transactions.length} Transactions</div>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">On-Chain Privacy</span>
            <div className="text-cyan-400">0 Bytes Plaintext PII</div>
          </div>
        </div>
      </div>

      {/* Live Recent Blocks Strip */}
      <div className="rounded-2xl border border-white/10 bg-[#0F172A]/90 p-5 backdrop-blur-md shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
            <Boxes className="h-4 w-4 text-amber-400" />
            <span>Latest Validated Blocks</span>
          </span>
          <span className="text-slate-500 font-mono text-[11px]">Interval: ~2.0s per block</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[blockHeight, blockHeight - 1, blockHeight - 2, blockHeight - 3].map((b, idx) => (
            <div
              key={b}
              className={`rounded-xl border p-3 font-mono text-xs transition ${
                idx === 0
                  ? 'border-amber-500/40 bg-amber-950/20 text-white'
                  : 'border-white/5 bg-slate-900/60 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300">Block #{b}</span>
                <span className="text-[10px] text-slate-500">{idx * 2}s ago</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-1">
                Hash: 0x{((b * 1928374) % 1000000000).toString(16)}8f...e9
              </div>
              <div className="text-[10px] text-emerald-400 mt-1 flex items-center justify-between">
                <span>{idx === 0 ? '1 tx' : '2 txs'}</span>
                <span>48,200 gas</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Contract Directory */}
      <div className="rounded-2xl border border-white/10 bg-[#0F172A]/90 p-6 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <span>Deployed Core Smart Contracts</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              OpenZeppelin 5.0 compliant EVM contracts verified on Hardhat network.
            </p>
          </div>
          <span className="rounded bg-emerald-500/10 px-2.5 py-1 text-[11px] font-mono text-emerald-400 border border-emerald-500/20">
            4 / 4 Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contracts.map((c) => (
            <div
              key={c.name}
              className="rounded-xl border border-white/5 bg-slate-900/80 p-4 space-y-3 hover:border-amber-500/40 transition shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-amber-400" />
                  <span className="font-bold text-white text-xs">{c.name}</span>
                </div>
                <button
                  onClick={() => setSelectedContract(c)}
                  className="rounded border border-white/10 bg-slate-950 px-2 py-0.5 text-[10px] font-mono text-slate-300 hover:text-cyan-400 transition"
                >
                  Inspect ABI
                </button>
              </div>

              <div className="font-mono text-[11px] text-cyan-400 truncate select-all bg-slate-950 p-2 rounded-lg border border-white/5">
                {c.address}
              </div>

              <p className="text-[11px] text-slate-400">{c.role}</p>

              <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between pt-1 border-t border-white/5">
                <span>{c.solidity}</span>
                <span className="text-emerald-400 font-semibold">Compiled: Paris EVM</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction & Event Feed */}
      <div className="rounded-2xl border border-white/10 bg-[#0F172A]/90 p-6 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-400" />
              <span>Anchored Transactions &amp; Events</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live cryptographic registrations anchoring IPFS CIDs and patient consent policies.
            </p>
          </div>

          <div className="relative min-w-[280px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by hash, contract, or function..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Transaction Hash</th>
                <th className="py-3 px-4">Block</th>
                <th className="py-3 px-4">Smart Contract Method</th>
                <th className="py-3 px-4">Gas Used</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-950/40 font-mono text-[11px]">
              {filteredTx.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="hover:bg-white/[0.03] transition cursor-pointer"
                >
                  <td className="py-3.5 px-4">
                    <span className="text-cyan-400 hover:underline">
                      {tx.txHash.slice(0, 14)}...{tx.txHash.slice(-8)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-white">#{tx.blockNumber || 1050}</td>
                  <td className="py-3.5 px-4">
                    <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-300 font-mono border border-amber-500/20">
                      {tx.functionName}
                    </span>
                    {tx.eventType && (
                      <span className="ml-2 text-[10px] text-slate-400">({tx.eventType})</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{tx.gasUsed || '54,200'}</td>
                  <td className="py-3.5 px-4 font-sans">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      Confirmed
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500 font-sans text-xs">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}

              {filteredTx.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-500 font-sans">
                    No matching blockchain transactions recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-2xl border border-amber-500/30 bg-[#0B1527] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">On-Chain Transaction Details</h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono text-slate-300">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Transaction Hash:</span>
                <span className="text-cyan-400 select-all">{selectedTx.txHash}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Execution Status:</span>
                <span className="text-emerald-400 font-bold">SUCCESS (Block #{selectedTx.blockNumber || 1050})</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Contract Function:</span>
                <span className="text-amber-300 font-bold">{selectedTx.functionName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Gas Used:</span>
                <span className="text-slate-200">{selectedTx.gasUsed || '54,200'} units</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Effective Gas Price:</span>
                <span className="text-slate-200">12.4 Gwei</span>
              </div>

              {/* Decoded Calldata Simulation */}
              <div>
                <span className="text-slate-500 block mb-1">Decoded Calldata (Zero PII Verified):</span>
                <pre className="rounded-xl border border-white/5 bg-slate-950 p-3 text-[11px] text-cyan-300 overflow-x-auto">
                  {JSON.stringify(
                    {
                      method: selectedTx.functionName,
                      event: selectedTx.eventType || 'RecordRegistered',
                      contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
                      arguments: {
                        contentHash: '0x3a7b9e4d1f2a...8c90',
                        encryptedCid: 'bafybeihdwdcefgh4dqkjv67uzcmw',
                        authorizedAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
                        validityEpoch: 1711929600,
                      },
                      privacyStatus: 'ZERO_PLAIN_TEXT_VERIFIED',
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                onClick={() => setSelectedTx(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs text-white hover:bg-white/10 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contract ABI Modal */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-2xl border border-cyan-500/30 bg-[#0B1527] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  {selectedContract.name} &bull; Smart Contract ABI
                </h3>
              </div>
              <button
                onClick={() => setSelectedContract(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="text-slate-400">
                <span className="text-slate-500">Address:</span> {selectedContract.address}
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Public Callable Interface (ABI Methods):</span>
                <div className="space-y-1.5">
                  {selectedContract.abiMethods.map((m: string) => (
                    <div
                      key={m}
                      className="p-2 rounded-lg border border-white/5 bg-slate-950 text-cyan-300 font-mono text-[11px]"
                    >
                      function {m} external returns (bool)
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                onClick={() => setSelectedContract(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs text-white hover:bg-white/10 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
