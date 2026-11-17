'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Layers,
  FileKey2,
  Activity,
  ArrowRight,
  Database,
  CheckCircle2,
  EyeOff,
  UserCheck,
  Server,
  Zap,
  Cpu,
  KeyRound,
  FileCheck2,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';

export default function HomePage() {
  const { switchDemoUser } = useAuth();
  const [activePipelineTab, setActivePipelineTab] = useState<number>(0);

  const pipelineSteps = [
    {
      title: '1. Client-Side Encryption',
      icon: Lock,
      color: '#10B981',
      headline: 'AES-256-GCM in WebCrypto',
      body: 'Before leaving the browser, a random 256-bit symmetric Data Encryption Key (DEK) and 96-bit IV are generated in secure memory. The file is encrypted directly on-device. Zero plaintext bytes touch the network.',
      codeSnippet: `const dek = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt"]);\nconst ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, dek, fileBuffer);`,
    },
    {
      title: '2. IPFS Content Addressing',
      icon: Database,
      color: '#06B6D4',
      headline: 'Cryptographic CID Generation',
      body: 'The encrypted binary payload is stored in the decentralized content-addressed network. A cryptographic SHA-256 multihash Content Identifier (CID) is derived directly from the ciphertext bytes.',
      codeSnippet: `const cid = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";\n// Content-addressed immutable reference. Anyone with CID only gets ciphertext.`,
    },
    {
      title: '3. EVM Smart Contract Anchor',
      icon: Layers,
      color: '#F59E0B',
      headline: 'Ethereum Immutability Proof',
      body: 'The payload SHA-256 fingerprint, encrypted CID, and version are anchored into the MedicalRecordRegistry smart contract on Ethereum. No private health information or names are ever exposed on-chain.',
      codeSnippet: `contract MedicalRecordRegistry {\n  function registerRecord(bytes32 recordId, bytes32 contentHash, string calldata cid) external;\n}`,
    },
    {
      title: '4. Granular Consent & Key Wrapping',
      icon: UserCheck,
      color: '#A855F7',
      headline: 'Asymmetric Envelope Exchange',
      body: 'When patient authorizes a physician, the patient unwraps the DEK and wraps it specifically with the doctor public key. Revoking consent instantly deactivates the wrapped key on smart contract.',
      codeSnippet: `// Doctor key envelope wrapped with RSA-OAEP-256 / AES-KW\nconst doctorEnvelope = wrapKey(dek, doctorPublicKey);\nconsentManager.grantConsent(patient, doctor, recordId, SCOPE_ALL, expiresAt);`,
    },
  ];

  return (
    <div className="flex flex-col gap-24 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-6 sm:pt-24 sm:pb-12">
        {/* Glow backdrop circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-[#10B981]/20 to-[#06B6D4]/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <div className="flex flex-col items-center text-center">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-[#101B2E]/90 px-4 py-1.5 text-xs font-semibold text-white shadow-xl backdrop-blur-xl mb-8">
              <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-ping" />
              <span className="text-[#10B981]">Enterprise Web3 Healthcare</span>
              <span className="text-white/20">•</span>
              <span className="text-[#94A3B8]">Solidity 0.8.24 + WebCrypto AES-GCM</span>
            </div>

            {/* Main Headline */}
            <h1 className="max-w-5xl text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
              Decentralized, Encrypted &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] via-[#06B6D4] to-[#10B981]">
                Verifiable
              </span>{' '}
              Healthcare Data.
            </h1>

            {/* Subhead */}
            <p className="mt-8 max-w-3xl text-base sm:text-lg text-[#94A3B8] leading-relaxed">
              MEDCHAIN is a state-of-the-art decentralized platform. Patient records are encrypted
              client-side before upload, addressed via decentralized IPFS CIDs, and anchored to Ethereum
              smart contracts for mathematical tamper-detection and granular consent control.
            </p>

            {/* Persona Action Cards */}
            <div className="mt-12 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              {/* Patient */}
              <Link
                href="/patient"
                onClick={() => switchDemoUser('PATIENT')}
                className="group rounded-2xl border border-white/[0.08] bg-[#0E1726]/80 p-5 hover:border-[#10B981] hover:bg-[#101B2E] transition-all duration-300 shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#10B981]/10 rounded-full blur-xl group-hover:bg-[#10B981]/25 transition-all" />
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 mb-4 group-hover:scale-110 transition-transform">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="text-xs font-bold text-[#10B981] uppercase tracking-wider">Patient Portal</div>
                <div className="text-base font-bold text-white mt-1">Sarah Jenkins</div>
                <p className="text-[11px] text-[#64748B] mt-1.5 leading-normal">
                  Zero-knowledge vault, client encryption, and consent control.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#10B981] group-hover:translate-x-1 transition-transform">
                  <span>Enter Vault</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>

              {/* Doctor */}
              <Link
                href="/doctor"
                onClick={() => switchDemoUser('DOCTOR')}
                className="group rounded-2xl border border-white/[0.08] bg-[#0E1726]/80 p-5 hover:border-[#06B6D4] hover:bg-[#101B2E] transition-all duration-300 shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#06B6D4]/10 rounded-full blur-xl group-hover:bg-[#06B6D4]/25 transition-all" />
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30 mb-4 group-hover:scale-110 transition-transform">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div className="text-xs font-bold text-[#06B6D4] uppercase tracking-wider">Doctor Portal</div>
                <div className="text-base font-bold text-white mt-1">Dr. Vance, MD</div>
                <p className="text-[11px] text-[#64748B] mt-1.5 leading-normal">
                  Authorized patient records, in-memory decryption, and requests.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#06B6D4] group-hover:translate-x-1 transition-transform">
                  <span>Open Clinic</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>

              {/* Blockchain */}
              <Link
                href="/blockchain"
                className="group rounded-2xl border border-white/[0.08] bg-[#0E1726]/80 p-5 hover:border-[#F59E0B] hover:bg-[#101B2E] transition-all duration-300 shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#F59E0B]/10 rounded-full blur-xl group-hover:bg-[#F59E0B]/25 transition-all" />
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 mb-4 group-hover:scale-110 transition-transform">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">EVM Ledger</div>
                <div className="text-base font-bold text-white mt-1">Block Explorer</div>
                <p className="text-[11px] text-[#64748B] mt-1.5 leading-normal">
                  Live block ticker, hashes, smart contract events, and gas fees.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#F59E0B] group-hover:translate-x-1 transition-transform">
                  <span>Explore Chain</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>

              {/* FHIR Interop */}
              <Link
                href="/fhir"
                className="group rounded-2xl border border-white/[0.08] bg-[#0E1726]/80 p-5 hover:border-purple-400 hover:bg-[#101B2E] transition-all duration-300 shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/25 transition-all" />
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 mb-4 group-hover:scale-110 transition-transform">
                  <Cpu className="h-5 w-5" />
                </div>
                <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">Interoperability</div>
                <div className="text-base font-bold text-white mt-1">FHIR R4 Hub</div>
                <p className="text-[11px] text-[#64748B] mt-1.5 leading-normal">
                  HL7 FHIR standard mapping, JSON export, and DocumentReference.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
                  <span>Inspect FHIR</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Cryptographic Pipeline Showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl border border-white/[0.08] bg-[#0A1628]/90 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10 pb-8 border-b border-white/[0.08]">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#10B981] mb-2">
                <Sparkles className="h-4 w-4" />
                <span>Interactive Cryptography Showcase</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                How MEDCHAIN Protects Sensitive Healthcare Records
              </h2>
            </div>
            <div className="text-xs text-[#64748B] font-mono bg-[#070D18] px-4 py-2 rounded-xl border border-white/[0.06]">
              Zero-Plaintext Egress Guarantee
            </div>
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {pipelineSteps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activePipelineTab === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActivePipelineTab(idx)}
                  className={`text-left rounded-2xl p-4 transition-all duration-300 border ${
                    isActive
                      ? 'border-[#10B981] bg-[#101B2E] shadow-xl shadow-[#10B981]/10'
                      : 'border-white/[0.05] bg-[#070D18]/60 hover:bg-[#070D18] hover:border-white/[0.1]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${step.color}20`, color: step.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-mono text-[#64748B]">STEP 0{idx + 1}</span>
                  </div>
                  <div className="text-xs font-bold text-white">{step.title}</div>
                </button>
              );
            })}
          </div>

          {/* Active Tab Deep Dive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center rounded-2xl border border-white/[0.06] bg-[#070D18] p-6 sm:p-8">
            <div className="space-y-4">
              <span
                className="text-xs font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-md"
                style={{
                  backgroundColor: `${pipelineSteps[activePipelineTab].color}20`,
                  color: pipelineSteps[activePipelineTab].color,
                }}
              >
                {pipelineSteps[activePipelineTab].headline}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {pipelineSteps[activePipelineTab].title}
              </h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                {pipelineSteps[activePipelineTab].body}
              </p>

              <div className="pt-2 flex items-center gap-4 text-xs font-mono text-[#10B981]">
                <CheckCircle2 className="h-4 w-4" />
                <span>Audited Cryptographic Primitive (NIST SP 800-38D)</span>
              </div>
            </div>

            {/* Code / Terminal View */}
            <div className="rounded-xl border border-white/[0.08] bg-[#040810] p-4 font-mono text-xs text-[#06B6D4] shadow-inner overflow-x-auto">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/[0.06] text-[10px] text-[#64748B]">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500/80" />
                  <span className="h-2 w-2 rounded-full bg-amber-500/80" />
                  <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
                </div>
                <span>MEDCHAIN Cryptographic Implementation</span>
              </div>
              <pre className="text-[11px] leading-relaxed text-[#A7F3D0]">
                {pipelineSteps[activePipelineTab].codeSnippet}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Architecture Numbers */}
      <section className="border-y border-white/[0.08] bg-[#0A1628]/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-black text-[#10B981] font-mono tracking-tight">
                256-bit
              </div>
              <div className="text-xs font-semibold text-white uppercase tracking-wider mt-2">
                AES-GCM Encryption
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">Unique single-use DEK per file</div>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-black text-[#06B6D4] font-mono tracking-tight">
                0 Bytes
              </div>
              <div className="text-xs font-semibold text-white uppercase tracking-wider mt-2">
                Plaintext on IPFS/Chain
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">Zero-knowledge decentralized storage</div>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-black text-amber-400 font-mono tracking-tight">
                100%
              </div>
              <div className="text-xs font-semibold text-white uppercase tracking-wider mt-2">
                Patient Consent Driven
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">Smart contract enforced time limits</div>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-black text-purple-400 font-mono tracking-tight">
                FHIR R4
              </div>
              <div className="text-xs font-semibold text-white uppercase tracking-wider mt-2">
                Healthcare Standard Mapped
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">HL7 DocumentReference & Consent</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mb-12">
        <div className="rounded-3xl border border-[#10B981]/30 bg-gradient-to-b from-[#10B981]/15 via-[#0A1628] to-[#0A1628] p-10 sm:p-16 text-center shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Experience the Future of Patient Privacy
            </h2>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Launch Sarah's medical vault to test client-side decryption, or run the interactive
              integrity challenge to observe real-time cryptographic tamper rejection.
            </p>
            <div className="pt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/patient/vault"
                className="rounded-xl bg-[#10B981] px-6 py-3 text-xs font-bold text-[#070D18] hover:bg-[#10B981]/90 shadow-xl shadow-[#10B981]/20 transition-all flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                <span>Open Patient Vault</span>
              </Link>
              <Link
                href="/blockchain"
                className="rounded-xl border border-white/[0.1] bg-[#101B2E] px-6 py-3 text-xs font-bold text-white hover:bg-white/[0.05] transition-all flex items-center gap-2"
              >
                <Layers className="h-4 w-4 text-[#F59E0B]" />
                <span>Explore Ethereum Ledger</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
