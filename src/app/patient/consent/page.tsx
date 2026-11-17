'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import {
  UserCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  AlertTriangle,
  Lock,
  Calendar,
  Layers,
  Info,
  Shield,
  Stethoscope,
  Sparkles,
} from 'lucide-react';

export default function ConsentManagementPage() {
  const { token } = useAuth();
  const [grants, setGrants] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Grant Form Modal
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [scope, setScope] = useState<'ALL_CURRENT' | 'CATEGORY' | 'SELECTED_RECORDS'>('ALL_CURRENT');
  const [durationDays, setDurationDays] = useState(30);

  // Revoke state
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revocationNotice, setRevocationNotice] = useState<string | null>(null);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [grantsRes, requestsRes, doctorsRes] = await Promise.all([
        fetch('/api/consent/grants', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/consent/requests', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/doctors', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const grantsJson = await grantsRes.json();
      const requestsJson = await requestsRes.json();
      const doctorsJson = await doctorsRes.json();

      if (grantsJson.success) setGrants(grantsJson.data || []);
      if (requestsJson.success) setRequests(requestsJson.data || []);
      if (doctorsJson.success) {
        setDoctors(doctorsJson.data || []);
        if (doctorsJson.data?.length > 0) {
          setSelectedDoctorId(doctorsJson.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load consent data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleGrantConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedDoctorId) return;

    try {
      const res = await fetch('/api/consent/grants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          scope,
          durationDays: Number(durationDays),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowGrantModal(false);
        fetchData();
      } else {
        alert(json.error || 'Failed to grant consent');
      }
    } catch (err: any) {
      console.error('Grant consent error:', err);
    }
  };

  const handleRevoke = async (grantId: string) => {
    if (!token) return;
    if (
      !confirm(
        'Confirm Revocation: This deactivates the doctor key wrapping on blockchain. Note that locally cached downloads prior to revocation cannot be deleted remotely.'
      )
    ) {
      return;
    }

    setRevokingId(grantId);
    try {
      const res = await fetch('/api/consent/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ grantId }),
      });

      const json = await res.json();
      if (json.success) {
        setRevocationNotice(json.data.revocationNotice);
        fetchData();
      } else {
        alert(json.error || 'Revocation failed');
      }
    } catch (err) {
      console.error('Revocation error:', err);
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#10B981] uppercase tracking-wider mb-1">
            <UserCheck className="h-4 w-4" />
            <span>Patient-Controlled Governance</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Consent & Access Control Center
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 max-w-2xl leading-relaxed">
            Grant, customize, and permanently revoke clinical authorization. All permissions are enforced
            via Ethereum smart contracts and asymmetric envelope key management.
          </p>
        </div>

        <button
          onClick={() => setShowGrantModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] px-5 py-2.5 text-xs font-bold text-[#070D18] hover:brightness-110 shadow-lg shadow-[#10B981]/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Grant Doctor Consent</span>
        </button>
      </div>

      {/* Critical Revocation Limitation Notice Banner */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-[#0A1628] to-[#0A1628] p-6 text-xs text-amber-300 shadow-xl backdrop-blur-xl flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
          <Info className="h-5 w-5" />
        </div>
        <div className="space-y-1.5">
          <span className="font-extrabold text-white text-sm">
            Security Principle: Physical Boundaries of Cryptographic Revocation
          </span>
          <p className="text-[#94A3B8] leading-relaxed text-xs">
            When you click <strong className="text-red-400">"Revoke Access"</strong>, MEDCHAIN immediately
            deactivates wrapped key envelopes in the database, blocks future API queries with HTTP 403, and anchors
            an immutable revocation event to the Ethereum smart contract.
            However, mathematically, revocation <span className="text-white font-bold underline">cannot erase plaintext copies</span>{' '}
            that an authorized physician already downloaded to their physical workstation prior to this revocation moment.
          </p>
        </div>
      </div>

      {/* Revocation Success Banner */}
      {revocationNotice && (
        <div className="rounded-2xl border border-[#10B981]/40 bg-[#10B981]/15 p-4 text-xs text-[#10B981] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{revocationNotice}</span>
          </div>
          <button onClick={() => setRevocationNotice(null)} className="text-white/60 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Section 1: Active & Historic Grants */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#10B981]" />
            <span>Physician Authorizations</span>
          </h2>
          <span className="text-xs text-[#64748B] font-mono">
            {grants.filter((g) => !g.isRevoked).length} Active Grants
          </span>
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-[#0A1628]/80 overflow-hidden shadow-2xl backdrop-blur-xl">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/[0.08] bg-[#0E1726] text-[#94A3B8] uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="py-4 px-5">Authorized Doctor</th>
                <th className="py-4 px-5">Hospital Affiliation</th>
                <th className="py-4 px-5">Permission Scope</th>
                <th className="py-4 px-5">Expiration Date</th>
                <th className="py-4 px-5">Smart Contract Tx</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {grants.map((grant) => {
                const isExpired = new Date(grant.expiresAt) < new Date();
                const isRevoked = grant.isRevoked;

                return (
                  <tr key={grant.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-white text-sm">
                        {grant.doctor?.firstName} {grant.doctor?.lastName}
                      </div>
                      <div className="text-[11px] text-[#64748B]">{grant.doctor?.specialization}</div>
                    </td>
                    <td className="py-4 px-5 text-[#94A3B8]">
                      {grant.doctor?.hospital?.name || 'Metro Health Medical Center'}
                    </td>
                    <td className="py-4 px-5">
                      <span className="rounded-full bg-white/[0.05] px-2.5 py-0.5 text-[10px] font-mono text-[#06B6D4] border border-white/[0.08]">
                        {grant.scope}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-white font-mono text-[11px]">
                      {new Date(grant.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 font-mono text-[10px] text-amber-400">
                      {grant.blockchainTxHash ? `${grant.blockchainTxHash.slice(0, 10)}...` : 'Anchored'}
                    </td>
                    <td className="py-4 px-5">
                      {isRevoked ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30">
                          <XCircle className="h-3 w-3" />
                          Revoked
                        </span>
                      ) : isExpired ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                          <Clock className="h-3 w-3" />
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#10B981] border border-[#10B981]/30">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      {!isRevoked && !isExpired && (
                        <button
                          disabled={revokingId === grant.id}
                          onClick={() => handleRevoke(grant.id)}
                          className="rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-1.5 text-[11px] font-bold text-red-400 hover:bg-red-500/20 transition-all"
                        >
                          {revokingId === grant.id ? 'Revoking...' : 'Revoke'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {grants.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#64748B]">
                    No consent grants recorded. Click "Grant Doctor Consent" to authorize an attending physician.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Pending Requests */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-400" />
          <span>Pending Access Inquiries from Doctors</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests
            .filter((r) => r.status === 'PENDING')
            .map((req) => (
              <div
                key={req.id}
                className="rounded-3xl border border-white/[0.08] bg-[#0A1628]/80 p-6 backdrop-blur-xl shadow-xl space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {req.doctor?.firstName} {req.doctor?.lastName}
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      {req.doctor?.specialization} • {req.doctor?.hospital?.name}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                    Awaiting Patient
                  </span>
                </div>

                <div className="rounded-2xl bg-[#070D18] p-4 text-xs text-[#94A3B8] border border-white/[0.06] space-y-2">
                  <span className="text-[#64748B] block text-[10px] uppercase font-bold">
                    Stated Clinical Purpose:
                  </span>
                  <p className="text-white italic leading-relaxed">"{req.reason}"</p>
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                    <span>Scope: <strong className="text-[#06B6D4]">{req.scope}</strong></span>
                    <span>Duration: <strong className="text-white">{req.duration} hours</strong></span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-1">
                  <button
                    onClick={() => alert('Access request declined.')}
                    className="rounded-xl border border-white/[0.1] px-4 py-2 text-xs font-semibold text-white hover:bg-white/[0.05]"
                  >
                    Decline
                  </button>
                  <button
                    onClick={async () => {
                      const res = await fetch('/api/consent/grants', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          doctorId: req.doctorId,
                          scope: req.scope,
                          durationDays: Math.ceil(req.duration / 24) || 7,
                        }),
                      });
                      if (res.ok) {
                        alert('Consent granted and anchored on Ethereum smart contract!');
                        fetchData();
                      }
                    }}
                    className="rounded-xl bg-[#10B981] px-5 py-2 text-xs font-bold text-[#070D18] hover:bg-[#10B981]/90 shadow-lg shadow-[#10B981]/20"
                  >
                    Approve Consent
                  </button>
                </div>
              </div>
            ))}

          {requests.filter((r) => r.status === 'PENDING').length === 0 && (
            <div className="md:col-span-2 rounded-3xl border border-white/[0.08] bg-[#0A1628]/40 p-8 text-center text-xs text-[#64748B]">
              No pending access requests.
            </div>
          )}
        </div>
      </div>

      {/* Grant Consent Modal */}
      {showGrantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-white/[0.1] bg-[#0A1628] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-[#10B981]" />
                <span>Grant Physician Access</span>
              </h3>
              <button
                onClick={() => setShowGrantModal(false)}
                className="text-[#64748B] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGrantConsent} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#94A3B8] mb-1 font-bold uppercase text-[10px]">
                  Select Attending Physician
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#070D18] p-2.5 text-white focus:border-[#10B981] focus:outline-none"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.firstName} {d.lastName} ({d.specialization}) - {d.hospital?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1 font-bold uppercase text-[10px]">
                  Permission Scope
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as any)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#070D18] p-2.5 text-white focus:border-[#10B981] focus:outline-none"
                >
                  <option value="ALL_CURRENT">All Current Medical Records</option>
                  <option value="CATEGORY">Selected Categories (Imaging & Lab only)</option>
                  <option value="SELECTED_RECORDS">Specific Records Only</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 font-bold uppercase text-[10px] text-[#94A3B8]">
                  <span>Access Duration:</span>
                  <span className="text-[#10B981] font-mono font-bold text-xs">{durationDays} Days</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={365}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full accent-[#10B981] cursor-pointer"
                />
                <span className="text-[11px] text-[#64748B] mt-1 block font-mono">
                  Expires automatically on{' '}
                  {new Date(Date.now() + durationDays * 86400000).toLocaleDateString()}.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowGrantModal(false)}
                  className="rounded-xl border border-white/[0.1] px-5 py-2.5 text-white hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#10B981] px-6 py-2.5 font-bold text-[#070D18] hover:bg-[#10B981]/90 shadow-xl shadow-[#10B981]/20"
                >
                  Confirm & Anchor on Chain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
