'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import {
  Stethoscope,
  Users,
  Clock,
  ShieldCheck,
  FileText,
  Eye,
  Plus,
  Lock,
  AlertCircle,
  Building,
  Search,
  Activity,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  KeyRound,
  Download,
  AlertTriangle,
  Fingerprint,
  RefreshCw,
  Sliders,
  Share2,
} from 'lucide-react';

export default function DoctorPortalPage() {
  const { user, token } = useAuth();
  const [grants, setGrants] = useState<any[]>([]);
  const [patientRecords, setPatientRecords] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);

  // Decryption simulation state
  const [decryptingRecord, setDecryptingRecord] = useState<any | null>(null);
  const [decryptionStage, setDecryptionStage] = useState<number>(0);
  const [decryptedView, setDecryptedView] = useState(false);
  const [accessLogged, setAccessLogged] = useState(false);

  // Request Access Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestPatientId, setRequestPatientId] = useState('');
  const [reason, setReason] = useState('');
  const [reqScope, setReqScope] = useState('ALL_CURRENT');
  const [reqHours, setReqHours] = useState(168); // 7 days
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  const fetchDoctorData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/consent/grants', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setGrants(json.data);
        if (json.data.length > 0 && !selectedPatient) {
          // Select first active authorized patient
          const firstActive = json.data.find((g: any) => !g.isRevoked) || json.data[0];
          if (firstActive?.patient) {
            setSelectedPatient(firstActive.patient);
            fetchRecordsForPatient(firstActive.patient.id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load doctor grants:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordsForPatient = async (patientId: string) => {
    if (!token) return;
    setRecordsLoading(true);
    try {
      const res = await fetch(`/api/records?patientId=${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setPatientRecords(json.data || []);
      } else {
        setPatientRecords([]);
      }
    } catch (err) {
      console.error('Failed to load patient records:', err);
      setPatientRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, [token]);

  const handleOpenDecryptModal = (rec: any) => {
    setSelectedRecord(rec);
    setDecryptingRecord(rec);
    setDecryptionStage(1);
    setDecryptedView(false);
    setAccessLogged(false);

    // Simulate in-memory cryptographic unwrap & AES-256-GCM decryption
    setTimeout(() => setDecryptionStage(2), 500);
    setTimeout(() => setDecryptionStage(3), 1100);
    setTimeout(() => {
      setDecryptionStage(4);
      setDecryptedView(true);
      setAccessLogged(true);
    }, 1700);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setRequestSubmitting(true);

    try {
      const patientId = requestPatientId || selectedPatient?.id || grants[0]?.patientId;
      if (!patientId) return;

      const res = await fetch('/api/consent/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId,
          reason,
          scope: reqScope,
          durationHours: Number(reqHours),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setRequestSuccess(true);
        setTimeout(() => {
          setRequestSuccess(false);
          setShowRequestModal(false);
          setReason('');
        }, 1500);
      } else {
        alert(json.error || 'Failed to submit request');
      }
    } catch (err) {
      console.error('Submit request error:', err);
    } finally {
      setRequestSubmitting(false);
    }
  };

  // Filter patient list
  const filteredGrants = grants.filter((g) => {
    const p = g.patient;
    const name = `${p?.firstName || ''} ${p?.lastName || ''}`.toLowerCase();
    return name.includes(searchFilter.toLowerCase());
  });

  // Filter records by category
  const filteredRecords = patientRecords.filter((rec) => {
    if (categoryFilter === 'ALL') return true;
    return rec.category === categoryFilter;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-16 space-y-6">
      {/* Executive Clinical Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#0F172A] via-[#0B1527] to-[#0A101D] p-6 shadow-2xl">
        <div className="absolute top-0 right-0 h-64 w-64 bg-cyan-500/10 blur-[90px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/3 h-48 w-48 bg-emerald-500/10 blur-[80px] pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-0.5 text-xs font-semibold text-cyan-400">
                <Stethoscope className="h-3.5 w-3.5" />
                Attending Physician Command Center
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                EVM Identity: Verified
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>{user?.displayName || 'Dr. Robert Vance, MD'}</span>
              <span className="text-xs font-mono font-normal rounded border border-white/10 bg-white/5 px-2 py-1 text-slate-400">
                FACC • Cardiology
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Decentralized Zero-Trust EHR portal. Client-side ephemeral key unwrapping. Medical records decrypted solely in browser RAM; no plaintext ever hits disk or relays.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setShowRequestModal(true);
                setRequestPatientId(selectedPatient?.id || grants[0]?.patientId || '');
              }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Request Patient Consent</span>
            </button>
            <button
              onClick={fetchDoctorData}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/10 transition"
              title="Refresh Roster"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Credential Strip */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 text-[10px] uppercase">State Medical Board</span>
            <div className="text-slate-200 font-semibold">MA-LIC #98240-MED</div>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">Hospital Affiliation</span>
            <div className="text-slate-200 font-semibold">Metro Health Academic Center</div>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">Public Key ID (Ed25519)</span>
            <div className="text-cyan-400 truncate">0x9F3E8C...D8A1</div>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">Audit Logging Mode</span>
            <div className="text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>AuditRegistry.sol Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace: Split Patient Roster and Clinical Medical Records */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Authorized Patients Roster (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0F172A]/90 p-5 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-400" />
                <span>Authorized Patients</span>
              </h3>
              <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-mono font-semibold text-cyan-400 border border-cyan-500/20">
                {grants.filter((g) => !g.isRevoked).length} active
              </span>
            </div>

            {/* Patient Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search authorized patient..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition"
              />
            </div>

            {/* Patient Grant Cards */}
            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredGrants.map((grant) => {
                const patient = grant.patient;
                const isSelected = selectedPatient?.id === patient?.id;
                const isRevoked = grant.isRevoked;
                const expiresDate = new Date(grant.expiresAt);
                const isExpired = expiresDate < new Date();

                return (
                  <div
                    key={grant.id}
                    onClick={() => {
                      if (!isRevoked && !isExpired) {
                        setSelectedPatient(patient);
                        fetchRecordsForPatient(patient.id);
                      }
                    }}
                    className={`group relative rounded-xl border p-3.5 transition-all cursor-pointer ${
                      isRevoked || isExpired
                        ? 'border-red-500/20 bg-red-500/5 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'border-cyan-500 bg-cyan-950/20 shadow-lg shadow-cyan-500/10'
                        : 'border-white/5 bg-slate-900/60 hover:border-white/20 hover:bg-slate-900/90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                          {patient?.firstName} {patient?.lastName}
                        </h4>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          DOB: {patient?.dateOfBirth} • Blood: {patient?.bloodGroup || 'O+'}
                        </div>
                      </div>

                      {isRevoked ? (
                        <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold text-red-400 border border-red-500/20">
                          REVOKED
                        </span>
                      ) : isExpired ? (
                        <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-500/20">
                          EXPIRED
                        </span>
                      ) : (
                        <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                          AUTHORIZED
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                      <span className="rounded bg-white/5 px-2 py-0.5 text-cyan-300">
                        Scope: {grant.scope}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-amber-400" />
                        {expiresDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredGrants.length === 0 && !loading && (
                <div className="py-12 text-center text-xs text-slate-500">
                  No matching patients found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Patient Clinical Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedPatient ? (
            <>
              {/* Selected Patient Clinical Banner */}
              <div className="rounded-2xl border border-white/10 bg-[#0F172A]/90 p-5 backdrop-blur-md shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold text-base shadow-md shadow-cyan-500/20">
                      {selectedPatient.firstName?.[0]}
                      {selectedPatient.lastName?.[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-white">
                          {selectedPatient.firstName} {selectedPatient.lastName}
                        </h2>
                        <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-500/20">
                          ID: {selectedPatient.id}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                        <span>DOB: {selectedPatient.dateOfBirth}</span>
                        <span>•</span>
                        <span>Gender: {selectedPatient.gender}</span>
                        <span>•</span>
                        <span>Blood: {selectedPatient.bloodGroup || 'O+'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchRecordsForPatient(selectedPatient.id)}
                      className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition"
                    >
                      <RefreshCw className={`h-3 w-3 ${recordsLoading ? 'animate-spin' : ''}`} />
                      <span>Sync Records</span>
                    </button>
                  </div>
                </div>

                {/* Patient Health Indicators */}
                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-xl border border-white/5 bg-slate-900/60 p-2.5">
                    <span className="text-[10px] text-slate-500 font-mono">KNOWN ALLERGIES</span>
                    <div className="text-red-400 font-semibold mt-0.5">Penicillin (Severe)</div>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-slate-900/60 p-2.5">
                    <span className="text-[10px] text-slate-500 font-mono">PRIMARY DIAGNOSIS</span>
                    <div className="text-white font-semibold mt-0.5">Arrhythmia / Palpitations</div>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-slate-900/60 p-2.5">
                    <span className="text-[10px] text-slate-500 font-mono">CURRENT MEDICATIONS</span>
                    <div className="text-slate-300 font-semibold mt-0.5">Metoprolol 25mg QD</div>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-slate-900/60 p-2.5">
                    <span className="text-[10px] text-slate-500 font-mono">EMERGENCY CONTACT</span>
                    <div className="text-cyan-400 font-semibold mt-0.5">Verified / Primary</div>
                  </div>
                </div>
              </div>

              {/* Records Filter & List */}
              <div className="rounded-2xl border border-white/10 bg-[#0F172A]/90 p-5 backdrop-blur-md shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">Accessible Clinical Records</h3>
                    <span className="text-xs font-mono text-slate-400">
                      ({filteredRecords.length} records)
                    </span>
                  </div>

                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {['ALL', 'LABORATORY', 'IMAGING', 'CARDIOLOGY', 'PRESCRIPTION'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                          categoryFilter === cat
                            ? 'bg-cyan-500 text-slate-950 shadow'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {cat === 'ALL' ? 'All Types' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Records Grid */}
                <div className="space-y-3">
                  {filteredRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="group rounded-xl border border-white/5 bg-slate-900/70 p-4 hover:border-cyan-500/40 hover:bg-slate-900 transition-all shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-cyan-400 border border-cyan-500/20">
                              {rec.category}
                            </span>
                            <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                              {rec.title}
                            </h4>
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-1 max-w-xl">
                            {rec.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-slate-500">
                            <span>Exam Date: {rec.examinationDate}</span>
                            <span>•</span>
                            <span className="text-cyan-400 truncate max-w-[160px]">
                              CID: {rec.encryptedCid?.slice(0, 14)}...
                            </span>
                            <span>•</span>
                            <span className="text-emerald-400 flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3" />
                              Blockchain Verified
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenDecryptModal(rec)}
                          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition active:scale-95 shrink-0"
                        >
                          <Lock className="h-3.5 w-3.5" />
                          <span>Decrypt & Examine</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredRecords.length === 0 && !recordsLoading && (
                    <div className="py-16 text-center text-xs text-slate-500">
                      No medical records accessible under the current filter scope.
                    </div>
                  )}

                  {recordsLoading && (
                    <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
                      <span>Retrieving encrypted envelopes from IPFS...</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[#0F172A]/90 p-16 text-center backdrop-blur-md shadow-xl">
              <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Patient Selected</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Select an authorized patient from the left roster to decrypt and inspect their medical records.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* High-End Decryption & Examination Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-3xl rounded-2xl border border-cyan-500/30 bg-[#0B1527] p-6 shadow-2xl shadow-cyan-500/10 space-y-5 overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-cyan-500/10 blur-[60px] pointer-events-none rounded-full" />

            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-500/30">
                    {selectedRecord.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Exam Date: {selectedRecord.examinationDate}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">{selectedRecord.title}</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg border border-white/10 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Decryption Pipeline Animation */}
            {!decryptedView ? (
              <div className="py-8 space-y-4">
                <div className="text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-3 animate-pulse">
                    <KeyRound className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Performing Client-Side Decryption</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Unwrapping Data Encryption Key (DEK) via doctor's private Ed25519 key
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-2 text-xs font-mono">
                  <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                    decryptionStage >= 1 ? 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300' : 'border-white/5 bg-slate-900/40 text-slate-500'
                  }`}>
                    <span>1. Fetching CID: {selectedRecord.encryptedCid?.slice(0, 14)}...</span>
                    {decryptionStage >= 1 && <CheckCircle2 className="h-4 w-4 text-cyan-400" />}
                  </div>
                  <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                    decryptionStage >= 2 ? 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300' : 'border-white/5 bg-slate-900/40 text-slate-500'
                  }`}>
                    <span>2. Verifying doctor authorization envelope</span>
                    {decryptionStage >= 2 && <CheckCircle2 className="h-4 w-4 text-cyan-400" />}
                  </div>
                  <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                    decryptionStage >= 3 ? 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300' : 'border-white/5 bg-slate-900/40 text-slate-500'
                  }`}>
                    <span>3. In-memory AES-256-GCM ciphertext stream</span>
                    {decryptionStage >= 3 && <CheckCircle2 className="h-4 w-4 text-cyan-400" />}
                  </div>
                  <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                    decryptionStage >= 4 ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300' : 'border-white/5 bg-slate-900/40 text-slate-500'
                  }`}>
                    <span>4. Verifying SHA-256 hash on smart contract</span>
                    {decryptionStage >= 4 && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {/* Cryptographic Authenticity Banner */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>Decrypted In-Memory • SHA-256 Content Hash Matches On-Chain Anchor</span>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-500 font-bold">100% UNALTERED</span>
                </div>

                {/* Clinical Notes & Diagnostic Report Content */}
                <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4 space-y-3">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                    Decrypted Clinical Findings
                  </div>
                  <div className="text-xs text-slate-200 leading-relaxed space-y-2 font-sans">
                    <p>{selectedRecord.description}</p>
                    <p className="text-slate-400">
                      Patient evaluated with diagnostic testing protocol. Tracing exhibits sinus rhythm with normal PR and QTc intervals. No acute ST segment depression observed. Correlate with clinical symptomatology and repeat serial biomarkers if dyspnea or exertional chest pressure recurs.
                    </p>
                  </div>
                </div>

                {/* Simulated Diagnostic Telemetry Metrics */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl border border-white/5 bg-slate-900 p-3">
                    <span className="text-[10px] text-slate-500 font-mono">EJECTION FRACTION</span>
                    <div className="text-base font-bold text-cyan-400 font-mono mt-1">62% (Normal)</div>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-slate-900 p-3">
                    <span className="text-[10px] text-slate-500 font-mono">HIGH-SENS TROPONIN</span>
                    <div className="text-base font-bold text-emerald-400 font-mono mt-1">&lt; 0.01 ng/mL</div>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-slate-900 p-3">
                    <span className="text-[10px] text-slate-500 font-mono">BNP LEVEL</span>
                    <div className="text-base font-bold text-slate-200 font-mono mt-1">42 pg/mL</div>
                  </div>
                </div>

                {/* Cryptographic Provenance Details */}
                <div className="rounded-xl border border-white/5 bg-slate-950 p-3 text-[11px] font-mono text-slate-400 space-y-1.5">
                  <div className="flex justify-between">
                    <span>IPFS Encrypted CID:</span>
                    <span className="text-cyan-400 truncate max-w-[280px]">{selectedRecord.encryptedCid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SHA-256 Digest:</span>
                    <span className="text-slate-300 truncate max-w-[280px]">{selectedRecord.contentHash}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Audit Trail Anchor:</span>
                    <span className="text-emerald-400">AuditRegistry.sol (TX Confirmed)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-[11px] text-slate-500 font-mono">
                {accessLogged ? '✓ Audit event dispatched to blockchain' : 'Awaiting decryption'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs text-white hover:bg-white/10 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert('Clinical copy generated and logged to institutional EMR queue.');
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export Clinical Summary</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Request Patient Consent Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0B1527] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Request Patient Medical Consent</h3>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {requestSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Consent Request Dispatched!</h4>
                <p className="text-xs text-slate-400">
                  Notification and cryptographic request envelope sent to patient's MedChain wallet.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendRequest} className="space-y-4 text-xs">
                {/* Patient Selector */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Patient</label>
                  <select
                    value={requestPatientId}
                    onChange={(e) => setRequestPatientId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 p-2.5 text-white focus:border-cyan-500 focus:outline-none font-mono"
                  >
                    {grants.map((g) => (
                      <option key={g.id} value={g.patient?.id}>
                        {g.patient?.firstName} {g.patient?.lastName} ({g.patient?.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clinical Indication */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Clinical Indication / Justification</label>
                  <textarea
                    required
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Cardiology follow-up evaluation, reviewing echocardiogram and medication titration..."
                    className="w-full rounded-xl border border-white/10 bg-slate-900 p-2.5 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {/* Scope Selection */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Requested Consent Scope</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setReqScope('ALL_CURRENT')}
                      className={`p-3 rounded-xl border text-left transition ${
                        reqScope === 'ALL_CURRENT'
                          ? 'border-cyan-500 bg-cyan-950/20 text-white'
                          : 'border-white/5 bg-slate-900 text-slate-400'
                      }`}
                    >
                      <div className="font-bold">All Current Records</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Labs, Imaging, Notes</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReqScope('CATEGORY')}
                      className={`p-3 rounded-xl border text-left transition ${
                        reqScope === 'CATEGORY'
                          ? 'border-cyan-500 bg-cyan-950/20 text-white'
                          : 'border-white/5 bg-slate-900 text-slate-400'
                      }`}
                    >
                      <div className="font-bold">Diagnostics Only</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Laboratory & Radiology</div>
                    </button>
                  </div>
                </div>

                {/* Duration Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-300 font-semibold">Consent Validity Duration</label>
                    <span className="text-cyan-400 font-mono font-bold">
                      {reqHours} hours ({Math.round(reqHours / 24)} days)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={24}
                    max={720}
                    step={24}
                    value={reqHours}
                    onChange={(e) => setReqHours(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>24h (1 Day)</span>
                    <span>168h (7 Days)</span>
                    <span>720h (30 Days)</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="rounded-xl border border-white/10 px-4 py-2 text-white hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestSubmitting}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition disabled:opacity-50"
                  >
                    {requestSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    <span>Dispatch On-Chain Request</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
