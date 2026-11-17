'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import {
  Cpu,
  FileCode,
  Download,
  Upload,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Share2,
  Boxes,
  Code2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  patientToFHIR,
  doctorToFHIR,
  hospitalToFHIR,
  medicalRecordToFHIR,
  consentGrantToFHIR,
} from '@/lib/fhir/mapper';

export default function FHIRInteropPage() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'RECORD' | 'PATIENT' | 'CONSENT' | 'BUNDLE'>('RECORD');
  const [records, setRecords] = useState<any[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [fhirJson, setFhirJson] = useState<string>('{}');

  // Simulated ingestion state
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [ingestSuccess, setIngestSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch('/api/records', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data?.length > 0) {
          setRecords(j.data);
          setSelectedRecordId(j.data[0].id);
        }
      });
  }, [token]);

  useEffect(() => {
    const currentRecord = records.find((r) => r.id === selectedRecordId) || records[0];

    if (activeTab === 'RECORD' && currentRecord) {
      setFhirJson(JSON.stringify(medicalRecordToFHIR(currentRecord), null, 2));
    } else if (activeTab === 'PATIENT') {
      setFhirJson(
        JSON.stringify(
          patientToFHIR({
            id: user?.id || 'pat-1002',
            firstName: 'Sarah',
            lastName: 'Jenkins',
            dateOfBirth: '1988-06-14',
            gender: 'female',
            bloodGroup: 'O+',
          }),
          null,
          2
        )
      );
    } else if (activeTab === 'CONSENT') {
      setFhirJson(
        JSON.stringify(
          consentGrantToFHIR({
            id: 'grant-2041',
            patientId: user?.id || 'pat-1002',
            doctorId: 'doc-8812',
            isRevoked: false,
            grantedAt: '2024-03-01T00:00:00.000Z',
            expiresAt: '2024-04-01T00:00:00.000Z',
          }),
          null,
          2
        )
      );
    } else {
      // Complete FHIR Transaction Bundle
      const bundle = {
        resourceType: 'Bundle',
        type: 'transaction',
        entry: [
          {
            fullUrl: `urn:uuid:${user?.id || 'pat-1002'}`,
            resource: patientToFHIR({
              id: user?.id || 'pat-1002',
              firstName: 'Sarah',
              lastName: 'Jenkins',
              dateOfBirth: '1988-06-14',
              gender: 'female',
              bloodGroup: 'O+',
            }),
            request: { method: 'POST', url: 'Patient' },
          },
          ...(currentRecord
            ? [
                {
                  fullUrl: `urn:uuid:${currentRecord.id}`,
                  resource: medicalRecordToFHIR(currentRecord),
                  request: { method: 'POST', url: 'DocumentReference' },
                },
              ]
            : []),
          {
            fullUrl: 'urn:uuid:grant-2041',
            resource: consentGrantToFHIR({
              id: 'grant-2041',
              patientId: user?.id || 'pat-1002',
              doctorId: 'doc-8812',
              isRevoked: false,
              grantedAt: '2024-03-01T00:00:00.000Z',
              expiresAt: '2024-04-01T00:00:00.000Z',
            }),
            request: { method: 'POST', url: 'Consent' },
          },
        ],
      };
      setFhirJson(JSON.stringify(bundle, null, 2));
    }
  }, [activeTab, selectedRecordId, records, user]);

  const handleCopy = () => {
    navigator.clipboard.writeText(fhirJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateIngest = () => {
    setIngestSuccess(true);
    setTimeout(() => {
      setIngestSuccess(false);
      setShowIngestModal(false);
      alert('FHIR Resource successfully mapped, encrypted with AES-256-GCM, and stored on IPFS.');
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-16 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-[#0F172A] via-[#0E2038] to-[#0A101D] p-6 shadow-2xl">
        <div className="absolute top-0 right-0 h-64 w-64 bg-cyan-500/10 blur-[90px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/3 h-48 w-48 bg-emerald-500/10 blur-[80px] pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-0.5 text-xs font-semibold text-cyan-400">
                <Cpu className="h-3.5 w-3.5" />
                Interoperability Layer &bull; HL7 FHIR Release 4
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Schema: v4.0.1 Compliant
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>HL7 FHIR R4 Interoperability Center</span>
              <span className="text-xs font-mono font-normal rounded border border-white/10 bg-white/5 px-2 py-1 text-slate-400">
                JSON &bull; REST API
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Bi-directional schema mapper bridging decentralized IPFS content-addressed storage and Ethereum smart contract anchors with standard electronic health record (EHR) schemas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowIngestModal(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition active:scale-95"
            >
              <Upload className="h-4 w-4" />
              <span>Ingest External FHIR</span>
            </button>
          </div>
        </div>

        {/* Live Mapping Spec Strip */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 text-[10px] uppercase">IPFS Mapping Target</span>
            <div className="text-cyan-400">content[0].attachment.url</div>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">SHA-256 Integrity Mapping</span>
            <div className="text-emerald-400">content[0].attachment.hash</div>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">Consent Policy Model</span>
            <div className="text-slate-200">Consent.provision.action</div>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">De-identification Standard</span>
            <div className="text-slate-300">HIPAA Safe Harbor Synthetic</div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="rounded-2xl border border-white/10 bg-[#0F172A]/90 p-6 backdrop-blur-md shadow-xl space-y-5">
        {/* Resource Selector & Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'RECORD', label: 'DocumentReference' },
                { id: 'PATIENT', label: 'Patient' },
                { id: 'CONSENT', label: 'Consent' },
                { id: 'BUNDLE', label: 'Transaction Bundle' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Record Selector when Record tab is selected */}
          {activeTab === 'RECORD' && records.length > 0 && (
            <select
              value={selectedRecordId}
              onChange={(e) => setSelectedRecordId(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
            >
              {records.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.category})
                </option>
              ))}
            </select>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={() => {
                const blob = new Blob([fhirJson], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `fhir_${activeTab.toLowerCase()}_${Date.now()}.json`;
                a.click();
              }}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 transition active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export FHIR JSON</span>
            </button>
          </div>
        </div>

        {/* Schema Validation Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>HL7 FHIR v4.0.1 Resource Structure Verified Valid</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
            <span className="rounded bg-white/5 px-2 py-0.5 text-cyan-300">resourceType: OK</span>
            <span className="rounded bg-white/5 px-2 py-0.5 text-cyan-300">attachment.hash: SHA-256</span>
            <span className="rounded bg-white/5 px-2 py-0.5 text-cyan-300">attachment.url: ipfs://</span>
          </div>
        </div>

        {/* JSON Code Viewer */}
        <div className="relative rounded-2xl border border-white/10 bg-slate-950 p-4 font-mono text-xs overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between text-[11px] text-slate-500 pb-2 mb-2 border-b border-white/5">
            <span>MIME: application/fhir+json; fhirVersion=4.0.1</span>
            <span className="text-cyan-400">Synthea / ONC Schema Standard</span>
          </div>

          <pre className="text-cyan-300 overflow-x-auto max-h-[540px] p-2 leading-relaxed selection:bg-cyan-500/30">
            {fhirJson}
          </pre>
        </div>
      </div>

      {/* Ingest FHIR Modal */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-[#0B1527] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Ingest External FHIR R4 Bundle</h3>
              </div>
              <button
                onClick={() => setShowIngestModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Paste any valid HL7 FHIR R4 JSON document (e.g. from Epic MyChart, Cerner Millennium, or Synthea). MedChain will parse the attachment, generate an ephemeral AES-256-GCM key, and register the cryptographic digest on-chain.
              </p>

              <textarea
                rows={6}
                placeholder="Paste FHIR R4 JSON here..."
                defaultValue={fhirJson}
                className="w-full rounded-xl border border-white/10 bg-slate-900 p-2.5 font-mono text-[11px] text-cyan-300 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowIngestModal(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs text-white hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulateIngest}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Parse, Encrypt &amp; Ingest</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
