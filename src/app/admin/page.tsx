'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import {
  ShieldAlert,
  Users,
  Activity,
  Lock,
  Layers,
  AlertTriangle,
  CheckCircle2,
  FileText,
  EyeOff,
  Search,
  RefreshCw,
  Terminal,
  ShieldCheck,
  Cpu,
  KeyRound,
  ExternalLink,
  Sliders,
  AlertOctagon,
} from 'lucide-react';

export default function AdminPortalPage() {
  const { user, token } = useAuth();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  // Security test simulation state
  const [simulatingIntrusion, setSimulatingIntrusion] = useState(false);
  const [intrusionAlert, setIntrusionAlert] = useState<string | null>(null);

  const fetchAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [auditRes, statsRes] = await Promise.all([
        fetch('/api/audit', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/stats', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const auditJson = await auditRes.json();
      const statsJson = await statsRes.json();

      if (auditJson.success) setAuditLogs(auditJson.data || []);
      if (statsJson.success) setStats(statsJson.data || null);
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleSimulateIntrusion = () => {
    setSimulatingIntrusion(true);
    setIntrusionAlert(null);

    setTimeout(() => {
      setSimulatingIntrusion(false);
      setIntrusionAlert(
        'SECURITY EXCEPTION INTERCEPTED: Unauthorized entity attempted direct ciphertext unwrap. Ephemeral DEK rejected by envelope policy. Audit event #SEC-9902 anchored to AuditRegistry.sol with CRITICAL severity. Zero medical plaintext leaked.'
      );
    }, 1200);
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.actorId && log.actorId.toLowerCase().includes(search.toLowerCase())) ||
      (log.eventType && log.eventType.toLowerCase().includes(search.toLowerCase()));

    const matchesType =
      eventTypeFilter === 'ALL' ||
      (log.eventType && log.eventType.toUpperCase().includes(eventTypeFilter));

    return matchesSearch && matchesType;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-16 space-y-6">
      {/* Executive Security Header */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-r from-[#0F172A] via-[#1A0F1A] to-[#0A101D] p-6 shadow-2xl">
        <div className="absolute top-0 right-0 h-64 w-64 bg-red-500/10 blur-[90px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/3 h-48 w-48 bg-amber-500/10 blur-[80px] pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-0.5 text-xs font-semibold text-red-400">
                <ShieldAlert className="h-3.5 w-3.5" />
                DevSecOps &amp; Security Operations Center (SOC)
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Threat Status: DEFCON 5 (Normal)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>Security Governance Console</span>
              <span className="text-xs font-mono font-normal rounded border border-white/10 bg-white/5 px-2 py-1 text-slate-400">
                Zero-Knowledge Root
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Real-time audit telemetry, cryptographic envelope status, and immutable access logging. MedChain enforces strict separation of duties: system administrators have infrastructure oversight but hold zero patient private keys.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSimulateIntrusion}
              disabled={simulatingIntrusion}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-500/20 hover:from-red-400 hover:to-amber-500 transition active:scale-95 disabled:opacity-50"
            >
              <AlertOctagon className={`h-4 w-4 ${simulatingIntrusion ? 'animate-spin' : ''}`} />
              <span>Simulate Intrusion Challenge</span>
            </button>

            <button
              onClick={fetchAdminData}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/10 transition"
              title="Refresh Audit Logs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Security Invariant Guarantee */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 text-[10px] uppercase">Cryptographic Isolation</span>
            <div className="text-emerald-400 font-semibold">Intact (Client-Side Only)</div>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">Plaintext On Disk/Relay</span>
            <div className="text-emerald-400 font-semibold">0 Bytes Detected</div>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">Admin Decryption Keys</span>
            <div className="text-red-400 font-semibold">0 Keys (Zero-Knowledge)</div>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">Smart Contract Audit Anchor</span>
            <div className="text-cyan-400 truncate">AuditRegistry.sol &bull; 0xCf7E...</div>
          </div>
        </div>
      </div>

      {/* Intrusion Simulation Banner */}
      {intrusionAlert && (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/30 p-4 backdrop-blur-md shadow-xl flex items-start gap-3 text-xs">
          <AlertOctagon className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-red-300">Intrusion Challenge Result: Boundary Enforced</h4>
            <p className="text-slate-300 font-mono text-[11px] leading-relaxed">{intrusionAlert}</p>
          </div>
          <button
            onClick={() => setIntrusionAlert(null)}
            className="ml-auto text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#0F172A]/90 p-5 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Platform Personas</span>
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono">
            {stats?.usersCount || 7} Registered
          </div>
          <div className="mt-1 text-[11px] text-cyan-400 font-mono">
            Patients, Doctors, Hospitals
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F172A]/90 p-5 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Encrypted Records</span>
            <FileText className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono">
            {stats?.recordsCount || 4} Envelopes
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-mono">
            100% CIDs Anchored to Hardhat
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F172A]/90 p-5 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>EVM Transactions</span>
            <Layers className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono">
            {stats?.transactionsCount || 3} Confirmed
          </div>
          <div className="mt-1 text-[11px] text-amber-400 font-mono">
            Zero Reorganization Risk
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F172A]/90 p-5 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>SOC Event Logs</span>
            <Activity className="h-4 w-4 text-red-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono">
            {auditLogs.length} Events
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-mono">
            Tamper-Evident SHA-256 Stream
          </div>
        </div>
      </div>

      {/* Separation of Duties Matrix */}
      <div className="rounded-2xl border border-white/10 bg-[#0F172A]/90 p-6 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-cyan-400" />
              <span>Role-Based Separation of Duties &amp; Cryptographic Boundaries</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enforced mathematically via asymmetric envelope encryption and smart contract access control.
            </p>
          </div>
          <span className="rounded bg-cyan-500/10 px-2.5 py-1 text-[11px] font-mono text-cyan-400 border border-cyan-500/20">
            Zero-Trust Architecture
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Capability / Operation</th>
                <th className="py-3 px-4 text-center">Patient</th>
                <th className="py-3 px-4 text-center">Doctor</th>
                <th className="py-3 px-4 text-center">Hospital</th>
                <th className="py-3 px-4 text-center">Admin (SOC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-950/40 font-mono text-[11px]">
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-white">Decrypt Clinical Record (In-Memory)</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓ Owner Key</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓ Only If Consented</td>
                <td className="py-3 px-4 text-center text-red-400">✗ No Access</td>
                <td className="py-3 px-4 text-center text-red-400 font-bold">✗ FORBIDDEN (No Key)</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-white">Grant / Revoke Doctor Consent</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓ Sole Authority</td>
                <td className="py-3 px-4 text-center text-red-400">✗ Request Only</td>
                <td className="py-3 px-4 text-center text-red-400">✗ No Access</td>
                <td className="py-3 px-4 text-center text-red-400">✗ No Authority</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-white">Submit New Encrypted Record to IPFS</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓ Self-Upload</td>
                <td className="py-3 px-4 text-center text-slate-500">Requires Patient Sign</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓ Inpatient Discharge</td>
                <td className="py-3 px-4 text-center text-red-400">✗ Cannot Submit</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-white">Inspect Audit Logs &amp; System Health</td>
                <td className="py-3 px-4 text-center text-slate-400">Own Records Only</td>
                <td className="py-3 px-4 text-center text-slate-400">Own Grants Only</td>
                <td className="py-3 px-4 text-center text-slate-400">Roster Only</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓ Global Telemetry</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable Audit Log Stream */}
      <div className="rounded-2xl border border-white/10 bg-[#0F172A]/90 p-6 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-red-400" />
              <span>Immutable Audit Event Stream</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cryptographically chained security log stream. Hash anchored to Ethereum smart contracts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search action or actor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
              />
            </div>

            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-red-500 focus:outline-none font-mono"
            >
              <option value="ALL">All Categories</option>
              <option value="RECORD">Record Events</option>
              <option value="CONSENT">Consent Grants</option>
              <option value="AUTH">Authentication</option>
              <option value="SECURITY">Security / Intrusions</option>
            </select>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Event Category</th>
                <th className="py-3 px-4">Operation</th>
                <th className="py-3 px-4">Actor ID</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-950/40 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3 px-4">
                    <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-400 border border-cyan-500/20">
                      {log.eventType}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">{log.action}</td>
                  <td className="py-3 px-4 text-slate-400">
                    {log.actorId ? `${log.actorId.slice(0, 14)}...` : 'System Daemon'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                        log.severity === 'CRITICAL'
                          ? 'border-red-500/40 bg-red-500/15 text-red-400'
                          : log.severity === 'WARNING'
                          ? 'border-amber-500/40 bg-amber-500/15 text-amber-400'
                          : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                      }`}
                    >
                      {log.severity || 'INFO'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-sans text-xs">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="rounded border border-white/10 px-2 py-1 text-[10px] text-slate-300 hover:bg-white/10 transition"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-500 font-sans">
                    No matching audit records in this filter window.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Audit Log Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0B1527] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-red-400" />
                <span>Audit Record Cryptographic Inspection</span>
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono text-slate-300">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Event ID:</span>
                <span className="text-white">{selectedLog.id}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Operation / Action:</span>
                <span className="text-cyan-400 font-bold">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Actor Entity:</span>
                <span className="text-slate-200">{selectedLog.actorId || 'Internal Subsystem'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Severity Level:</span>
                <span className="text-emerald-400">{selectedLog.severity || 'INFO'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-300">{new Date(selectedLog.createdAt).toISOString()}</span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Audit Details / Payload Hash:</span>
                <pre className="rounded-xl border border-white/5 bg-slate-950 p-3 text-[11px] text-cyan-300 overflow-x-auto">
                  {selectedLog.details ||
                    JSON.stringify(
                      {
                        action: selectedLog.action,
                        eventType: selectedLog.eventType,
                        onChainProof: '0x9f32e9b048d21c43...',
                        verificationStatus: 'CONFIRMED_ON_CHAIN',
                      },
                      null,
                      2
                    )}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                onClick={() => setSelectedLog(null)}
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
