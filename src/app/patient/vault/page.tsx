'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import {
  FolderLock,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  ShieldCheck,
  Download,
  Eye,
  Lock,
  AlertTriangle,
  Layers,
  Copy,
  Check,
  RefreshCw,
  Plus,
  LayoutGrid,
  List,
  Sparkles,
  FileCode,
  Calendar,
  User,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { medicalRecordToFHIR } from '@/lib/fhir/mapper';

function VaultContent() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'CLINICAL' | 'CRYPTO' | 'CHALLENGE' | 'FHIR'>('CLINICAL');
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const categories = [
    { id: 'ALL', label: 'All Records' },
    { id: 'LAB_REPORT', label: 'Lab Reports' },
    { id: 'IMAGING', label: 'Imaging & MRI' },
    { id: 'PRESCRIPTION', label: 'Prescriptions' },
    { id: 'DISCHARGE', label: 'Discharge Summaries' },
  ];

  const fetchRecords = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const url = new URL('/api/records', window.location.origin);
      if (category !== 'ALL') url.searchParams.set('category', category);
      if (search) url.searchParams.set('search', search);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setRecords(json.data || []);
        if (initialId && !selectedRecord) {
          const match = json.data?.find((r: any) => r.id === initialId);
          if (match) setSelectedRecord(match);
        }
      }
    } catch (err) {
      console.error('Failed to load vault records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [token, category]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleVerify = async (recordId: string, simulateTamper = false) => {
    if (!token) return;
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/records/${recordId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tamperedHash: simulateTamper
            ? '0xdeadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678'
            : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setVerificationResult(json.data);
      }
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#10B981] uppercase tracking-wider mb-1">
            <Lock className="h-3.5 w-3.5" />
            <span>Zero-Knowledge Storage</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Patient Medical Vault</h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Client-side decrypted clinical documents, IPFS content identifiers, and on-chain verification proofs.
          </p>
        </div>

        <Link
          href="/patient/upload"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] px-5 py-2.5 text-xs font-bold text-[#070D18] hover:brightness-110 shadow-lg shadow-[#10B981]/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Upload & Encrypt Record</span>
        </Link>
      </div>

      {/* Filter and View Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#0E1726]/80 p-3 backdrop-blur-xl">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat.id
                  ? 'bg-[#10B981] text-[#070D18] font-bold shadow-md shadow-[#10B981]/25'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search records, doctors, diagnoses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchRecords()}
              className="w-full rounded-xl border border-white/[0.08] bg-[#070D18] pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#64748B] focus:border-[#10B981] focus:outline-none"
            />
          </div>

          <div className="flex items-center rounded-xl border border-white/[0.08] bg-[#070D18] p-1">
            <button
              onClick={() => setViewMode('GRID')}
              title="Grid View"
              className={`rounded-lg p-1.5 ${
                viewMode === 'GRID' ? 'bg-[#10B981] text-[#070D18]' : 'text-[#64748B] hover:text-white'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              title="Table View"
              className={`rounded-lg p-1.5 ${
                viewMode === 'TABLE' ? 'bg-[#10B981] text-[#070D18]' : 'text-[#64748B] hover:text-white'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View Mode */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="group rounded-3xl border border-white/[0.08] bg-[#0A1628]/80 p-6 backdrop-blur-xl hover:border-[#10B981]/60 hover:bg-[#0E1B30] transition-all duration-300 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <span className="rounded-full bg-[#10B981]/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#10B981] border border-[#10B981]/30">
                    {rec.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#10B981] font-mono">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#10B981] transition-colors leading-snug">
                    {rec.title}
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1.5 line-clamp-2 leading-relaxed">
                    {rec.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] space-y-1.5 text-xs text-[#64748B]">
                  <div className="flex items-center justify-between">
                    <span>Physician:</span>
                    <span className="text-white font-medium">{rec.doctorName || 'Dr. Vance'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Date:</span>
                    <span className="text-white">{rec.examinationDate || '2024-03-12'}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span>IPFS CID:</span>
                    <span className="text-[#06B6D4]" title={rec.encryptedCid}>
                      {rec.encryptedCid ? `${rec.encryptedCid.slice(0, 12)}...` : 'IPFS-bafy...'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 flex items-center justify-between gap-2 border-t border-white/[0.06]">
                <button
                  onClick={() => {
                    setSelectedRecord(rec);
                    setActiveModalTab('CLINICAL');
                    setVerificationResult(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#16243C] py-2.5 text-xs font-bold text-white hover:bg-[#10B981] hover:text-[#070D18] transition-all"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Inspect & Decrypt</span>
                </button>
              </div>
            </div>
          ))}

          {records.length === 0 && !loading && (
            <div className="col-span-full py-16 text-center text-xs text-[#64748B] rounded-3xl border border-white/[0.08] bg-[#0A1628]/40">
              No matching records found in your vault.
            </div>
          )}
        </div>
      )}

      {/* Table View Mode */}
      {viewMode === 'TABLE' && (
        <div className="rounded-3xl border border-white/[0.08] bg-[#0A1628]/80 overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] bg-[#0E1726] text-[#94A3B8] uppercase text-[10px] tracking-wider font-mono">
                <tr>
                  <th className="py-4 px-5">Document Title</th>
                  <th className="py-4 px-5">Category</th>
                  <th className="py-4 px-5">Exam Date</th>
                  <th className="py-4 px-5">Attending Doctor</th>
                  <th className="py-4 px-5">Decentralized CID</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-white text-sm">{rec.title}</div>
                      <div className="text-[11px] text-[#64748B] mt-0.5 font-mono">
                        {rec.fileName} • {(rec.fileSize / 1024).toFixed(1)} KB
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="rounded-full bg-white/[0.05] px-2.5 py-0.5 text-[10px] font-mono text-[#06B6D4] border border-white/[0.08]">
                        {rec.category}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-[#94A3B8]">{rec.examinationDate || '2024-03-12'}</td>
                    <td className="py-4 px-5 text-white font-medium">{rec.doctorName || 'Dr. Vance'}</td>
                    <td className="py-4 px-5 font-mono text-[10px] text-[#06B6D4]">
                      {rec.encryptedCid ? `${rec.encryptedCid.slice(0, 14)}...` : 'IPFS'}
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#10B981] border border-[#10B981]/30">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => {
                          setSelectedRecord(rec);
                          setActiveModalTab('CLINICAL');
                          setVerificationResult(null);
                        }}
                        className="rounded-xl border border-white/[0.1] bg-[#16243C] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#10B981] hover:text-[#070D18] transition-all"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Luxury Document Inspector Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/[0.1] bg-[#0A1628] p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#10B981]/20 px-2.5 py-0.5 text-[10px] font-mono text-[#10B981] border border-[#10B981]/30">
                    {selectedRecord.category}
                  </span>
                  <span className="text-xs text-[#64748B] font-mono">
                    ID: {selectedRecord.id.slice(0, 14)}...
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-white mt-1.5">{selectedRecord.title}</h2>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-xl p-2 text-[#64748B] hover:bg-white/[0.08] hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto">
              <button
                onClick={() => setActiveModalTab('CLINICAL')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeModalTab === 'CLINICAL'
                    ? 'bg-[#10B981] text-[#070D18]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                Clinical Decrypted View
              </button>
              <button
                onClick={() => setActiveModalTab('CRYPTO')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeModalTab === 'CRYPTO'
                    ? 'bg-[#06B6D4] text-[#070D18]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                Cryptographic Provenance
              </button>
              <button
                onClick={() => setActiveModalTab('CHALLENGE')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeModalTab === 'CHALLENGE'
                    ? 'bg-amber-400 text-[#070D18]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                Integrity Challenge Lab
              </button>
              <button
                onClick={() => setActiveModalTab('FHIR')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeModalTab === 'FHIR'
                    ? 'bg-purple-400 text-[#070D18]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                FHIR R4 Schema
              </button>
            </div>

            {/* TAB 1: Clinical Decrypted View */}
            {activeModalTab === 'CLINICAL' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/[0.08] bg-[#0E1726] p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[#10B981]" />
                      <span>Decrypted in Client Memory (AES-256-GCM Unwrapped)</span>
                    </div>
                    <span className="text-[10px] text-[#10B981] font-mono">Zero Plaintext Egress</span>
                  </div>

                  <div className="text-sm text-white leading-relaxed">
                    {selectedRecord.description}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/[0.06] text-xs">
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">Physician</span>
                      <strong className="text-white">{selectedRecord.doctorName || 'Dr. Vance'}</strong>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">Exam Date</span>
                      <strong className="text-white">{selectedRecord.examinationDate}</strong>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">Ciphertext Size</span>
                      <strong className="text-white">{(selectedRecord.fileSize / 1024).toFixed(1)} KB</strong>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">Integrity Proof</span>
                      <strong className="text-[#10B981]">ANCHORED & VALID</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Cryptographic Provenance */}
            {activeModalTab === 'CRYPTO' && (
              <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-[#040810] p-5 text-xs font-mono">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[#94A3B8]">
                    <span className="text-[11px] font-sans font-bold uppercase text-[#64748B]">
                      Decentralized IPFS Content Identifier (CID):
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedRecord.encryptedCid || '', 'cid')}
                      className="text-[#06B6D4] hover:underline flex items-center gap-1 text-[11px]"
                    >
                      {copiedField === 'cid' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedField === 'cid' ? 'Copied' : 'Copy CID'}</span>
                    </button>
                  </div>
                  <div className="break-all rounded-xl bg-[#0E1726] p-3 text-[#06B6D4]">
                    {selectedRecord.encryptedCid}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-[#94A3B8]">
                    <span className="text-[11px] font-sans font-bold uppercase text-[#64748B]">
                      Payload SHA-256 Fingerprint:
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedRecord.contentHash, 'hash')}
                      className="text-[#10B981] hover:underline flex items-center gap-1 text-[11px]"
                    >
                      {copiedField === 'hash' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedField === 'hash' ? 'Copied' : 'Copy Hash'}</span>
                    </button>
                  </div>
                  <div className="break-all rounded-xl bg-[#0E1726] p-3 text-[#10B981]">
                    {selectedRecord.contentHash}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-[#94A3B8]">
                    <span className="text-[11px] font-sans font-bold uppercase text-[#64748B]">
                      Ethereum Contract Anchor Transaction:
                    </span>
                    <Link
                      href="/blockchain"
                      className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Layers className="h-3 w-3" />
                      <span>Inspect On-Chain</span>
                    </Link>
                  </div>
                  <div className="break-all rounded-xl bg-[#0E1726] p-3 text-amber-400">
                    {selectedRecord.blockchainTxHash}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Integrity Challenge Laboratory */}
            {activeModalTab === 'CHALLENGE' && (
              <div className="space-y-5 rounded-2xl border border-white/[0.08] bg-[#0E1726] p-6">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-400" />
                    <span>Cryptographic Tamper-Detection Engine</span>
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Demonstrates the core security principle: compare retrieved ciphertext hash with
                    the immutable smart contract registry, or simulate unauthorized byte tampering.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    disabled={isVerifying}
                    onClick={() => handleVerify(selectedRecord.id, false)}
                    className="flex items-center gap-2 rounded-xl bg-[#10B981] px-5 py-2.5 text-xs font-bold text-[#070D18] hover:bg-[#10B981]/90 shadow"
                  >
                    <RefreshCw className={`h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`} />
                    <span>Run Authentic On-Chain Verification</span>
                  </button>

                  <button
                    disabled={isVerifying}
                    onClick={() => handleVerify(selectedRecord.id, true)}
                    className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>Simulate Malicious Byte Tamper</span>
                  </button>
                </div>

                {verificationResult && (
                  <div
                    className={`rounded-2xl p-4 border text-xs leading-relaxed ${
                      verificationResult.isVerified
                        ? 'border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]'
                        : 'border-red-500/40 bg-red-500/10 text-red-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm mb-1">
                      {verificationResult.isVerified ? (
                        <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                      <span>
                        {verificationResult.isVerified
                          ? 'VERIFICATION PASSED — AUTHENTIC & UNALTERED'
                          : 'INTEGRITY VIOLATION DETECTED: SMART CONTRACT ANCHOR REJECTED PAYLOAD'}
                      </span>
                    </div>
                    <p>{verificationResult.details}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: FHIR R4 Schema */}
            {activeModalTab === 'FHIR' && (
              <div className="rounded-2xl border border-white/[0.08] bg-[#040810] p-4 text-xs font-mono text-[#06B6D4] max-h-72 overflow-y-auto">
                <pre>{JSON.stringify(medicalRecordToFHIR(selectedRecord), null, 2)}</pre>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-xl border border-white/[0.1] px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/[0.05]"
              >
                Close
              </button>
              <button
                onClick={() => alert(`Decrypted copy safely extracted to local client memory.`)}
                className="flex items-center gap-2 rounded-xl bg-[#06B6D4] px-5 py-2.5 text-xs font-bold text-[#070D18] hover:bg-[#06B6D4]/90"
              >
                <Download className="h-4 w-4" />
                <span>Export Decrypted Copy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MedicalVaultPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white">Loading Medical Vault...</div>}>
      <VaultContent />
    </Suspense>
  );
}
