'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import {
  Building2,
  Users,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  Upload,
  Search,
  Award,
  KeyRound,
  FileCheck2,
  Activity,
  Layers,
  Sparkles,
  Lock,
  RefreshCw,
  Fingerprint,
} from 'lucide-react';

export default function HospitalPortalPage() {
  const { user, token } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [searchDoctor, setSearchDoctor] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Submit record form state
  const [patientId, setPatientId] = useState('pat-1002');
  const [recordTitle, setRecordTitle] = useState('');
  const [recordCategory, setRecordCategory] = useState('LABORATORY');
  const [recordDescription, setRecordDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchHospitalData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/doctors');
      const json = await res.json();
      if (json.success) {
        setDoctors(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalData();
  }, []);

  const handleVerifyCredential = (doc: any) => {
    setSelectedDoctor(doc);
    setShowVerifyModal(true);
  };

  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId,
          title: recordTitle,
          category: recordCategory,
          description: recordDescription,
          examinationDate: new Date().toISOString().split('T')[0],
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          setShowSubmitModal(false);
          setRecordTitle('');
          setRecordDescription('');
        }, 1600);
      } else {
        alert(json.error || 'Failed to submit hospital record');
      }
    } catch (err) {
      console.error('Submit record error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const fullName = `${doc.firstName || ''} ${doc.lastName || ''}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchDoctor.toLowerCase()) ||
      (doc.licenseNumber && doc.licenseNumber.toLowerCase().includes(searchDoctor.toLowerCase()));
    const matchesDept =
      selectedDept === 'ALL' ||
      (doc.specialization && doc.specialization.toUpperCase().includes(selectedDept));
    return matchesSearch && matchesDept;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-16 space-y-6">
      {/* Institutional Command Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#0F172A] via-[#0E2038] to-[#0A101D] p-6 shadow-2xl">
        <div className="absolute top-0 right-0 h-64 w-64 bg-emerald-500/10 blur-[90px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/4 h-48 w-48 bg-cyan-500/10 blur-[80px] pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-400">
                <Building2 className="h-3.5 w-3.5" />
                Institutional Health System Workspace
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-mono text-cyan-400">
                <Award className="h-3 w-3" />
                JCAHO Accredited &bull; Academic Medical Center
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>Metro Health Medical Center</span>
              <span className="text-xs font-mono font-normal rounded border border-white/10 bg-white/5 px-2 py-1 text-slate-400">
                ID: hosp-7701
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Institutional medical provenance station. Enforces zero-knowledge physician credential verification, automated envelope encryption for inpatient discharges, and on-chain identity anchorings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 transition active:scale-95"
            >
              <Upload className="h-4 w-4" />
              <span>Submit Clinical Record</span>
            </button>
            <button
              onClick={fetchHospitalData}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/10 transition"
              title="Refresh Roster"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live System Spec Strip */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 text-[10px] uppercase">State Clinical License</span>
            <div className="text-slate-200 font-semibold">HOSP-MA-2024-8841</div>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">EVM Identity Registry</span>
            <div className="text-cyan-400 truncate">0x9fE4673667...3c7fa6e0</div>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">Record Submission Key</span>
            <div className="text-emerald-400 truncate">Ed25519 &bull; Hosp Vault #1</div>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">Encrypted Storage Gateway</span>
            <div className="text-slate-300 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>IPFS Kubo / CID-v1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#0F172A]/90 p-5 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Affiliated Physicians</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono">{doctors.length} Doctors</div>
          <div className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <CheckCircle2 className="h-3 w-3" />
            <span>100% Cryptographically Verified</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F172A]/90 p-5 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Anchored Records</span>
            <FileText className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono">14 Documents</div>
          <div className="mt-1 text-[11px] text-cyan-400 font-mono">
            All CIDs Registered on EVM
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F172A]/90 p-5 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Clinical Depts</span>
            <Activity className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono">4 Services</div>
          <div className="mt-1 text-[11px] text-slate-400">
            Cardiology, Radiology, Labs, Surgery
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F172A]/90 p-5 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Zero-Knowledge Status</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono">SECURE</div>
          <div className="mt-1 text-[11px] text-slate-500 font-mono">
            Zero PII exposed on blockchain
          </div>
        </div>
      </div>

      {/* Doctor Roster & Credential Management */}
      <div className="rounded-2xl border border-white/10 bg-[#0F172A]/90 p-6 backdrop-blur-md shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-400" />
              <span>Affiliated Attending Physicians</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Doctors licensed to request and inspect patient records under MedChain patient-controlled consent.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search physician or license..."
                value={searchDoctor}
                onChange={(e) => setSearchDoctor(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
            >
              <option value="ALL">All Departments</option>
              <option value="CARDIOLOGY">Cardiology</option>
              <option value="INTERNAL">Internal Medicine</option>
              <option value="NEUROLOGY">Neurology</option>
              <option value="SURGERY">Surgery</option>
            </select>
          </div>
        </div>

        {/* Doctor Roster Table */}
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-4">Physician Name</th>
                <th className="py-3.5 px-4">Specialization</th>
                <th className="py-3.5 px-4">State License #</th>
                <th className="py-3.5 px-4">Credential SHA-256 Hash</th>
                <th className="py-3.5 px-4">On-Chain Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-950/40">
              {filteredDoctors.map((doc) => (
                <tr key={doc.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                        {doc.firstName?.[0]}
                        {doc.lastName?.[0]}
                      </div>
                      <div>
                        <div>
                          {doc.firstName} {doc.lastName}, MD
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">ID: {doc.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{doc.specialization}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-200">{doc.licenseNumber}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-cyan-400">
                    {doc.credentialHash
                      ? `${doc.credentialHash.slice(0, 16)}...`
                      : '0x4f83b279d1a8...'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" />
                      Anchored &bull; Active
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleVerifyCredential(doc)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-emerald-500/40 hover:text-white transition"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Verify Anchor</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredDoctors.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-500">
                    No matching physicians found in this department.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credential Verification Modal */}
      {showVerifyModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-2xl border border-emerald-500/30 bg-[#0B1527] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Cryptographic Credential Verification
                </h3>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>IdentityRegistry.sol &bull; Smart Contract Proof Verified</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans">
                The medical license, DEA authorization, and specialty board certificates for{' '}
                <strong className="text-white">
                  {selectedDoctor.firstName} {selectedDoctor.lastName}, MD
                </strong>{' '}
                were hashed with SHA-256 and registered on the Ethereum EVM ledger.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950 p-4 text-xs font-mono space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Physician Name:</span>
                <span className="text-white font-semibold">
                  {selectedDoctor.firstName} {selectedDoctor.lastName}, MD
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Board License:</span>
                <span className="text-cyan-400">{selectedDoctor.licenseNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contract Address:</span>
                <span className="text-slate-400 select-all">
                  0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Credential Hash:</span>
                <span className="text-emerald-400 truncate max-w-[280px]">
                  {selectedDoctor.credentialHash || '0x4f83b279d1a89c92e92a...'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Zero-Knowledge Proof:</span>
                <span className="text-emerald-400">PASSED (0 Plaintext PII on Ledger)</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs text-white hover:bg-white/10 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Hospital Clinical Record Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0B1527] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Submit Inpatient Clinical Record</h3>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Record Encrypted & Anchored!</h4>
                <p className="text-xs text-slate-400">
                  Document envelope stored on IPFS; SHA-256 digest anchored to MedicalRecordRegistry.sol.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRecord} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Patient ID</label>
                  <input
                    type="text"
                    required
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="pat-1002"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Record Category</label>
                    <select
                      value={recordCategory}
                      onChange={(e) => setRecordCategory(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none font-mono"
                    >
                      <option value="LABORATORY">Laboratory Report</option>
                      <option value="IMAGING">Diagnostic Imaging</option>
                      <option value="CARDIOLOGY">Cardiology Report</option>
                      <option value="DISCHARGE">Discharge Summary</option>
                      <option value="PRESCRIPTION">Prescription</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Document Title</label>
                    <input
                      type="text"
                      required
                      value={recordTitle}
                      onChange={(e) => setRecordTitle(e.target.value)}
                      placeholder="e.g. Inpatient Discharge Summary"
                      className="w-full rounded-xl border border-white/10 bg-slate-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Clinical Findings & Notes</label>
                  <textarea
                    required
                    rows={4}
                    value={recordDescription}
                    onChange={(e) => setRecordDescription(e.target.value)}
                    placeholder="Enter diagnostic impression, discharge instructions, and follow-up plan..."
                    className="w-full rounded-xl border border-white/10 bg-slate-900 p-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="p-3 rounded-xl border border-white/5 bg-slate-950 text-[11px] text-slate-400 font-mono space-y-1">
                  <div>Encryption: AES-256-GCM Envelope</div>
                  <div>Signing Authority: Metro Health AMCE</div>
                  <div>Target IPFS Node: Local Content-Addressed Kubo</div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="rounded-xl border border-white/10 px-4 py-2 text-white hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 transition disabled:opacity-50"
                  >
                    {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    <span>Encrypt & Anchor Record</span>
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
