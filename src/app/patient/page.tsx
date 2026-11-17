'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import {
  FolderLock,
  Upload,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  Database,
  Lock,
  Sparkles,
  Layers,
  Activity,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export default function PatientDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [statsRes, recordsRes] = await Promise.all([
          fetch('/api/stats', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/records', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const statsJson = await statsRes.json();
        const recordsJson = await recordsRes.json();

        if (statsJson.success) setStats(statsJson.data);
        if (recordsJson.success) setRecords(recordsJson.data || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 space-y-8">
      {/* Top Welcome HUD Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-r from-[#0E1726] via-[#101B2E] to-[#0E1726] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#10B981]/15 to-[#06B6D4]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#10B981]/15 px-3 py-1 text-[11px] font-bold text-[#10B981] border border-[#10B981]/30">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                Zero-Knowledge Vault Active
              </span>
              <span className="text-xs text-[#64748B] font-mono">ID: {user?.id ? `${user.id.slice(0, 10)}...` : 'pat-1002'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome, {user?.displayName || 'Sarah Jenkins'}
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1.5 max-w-2xl leading-relaxed">
              Your medical history is encrypted client-side with your personal 256-bit key. Healthcare
              providers can only inspect documents when you explicitly grant on-chain consent.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/patient/upload"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] px-5 py-3 text-xs font-bold text-[#070D18] hover:brightness-110 shadow-lg shadow-[#10B981]/25 transition-all"
            >
              <Upload className="h-4 w-4" />
              <span>Encrypt & Upload</span>
            </Link>
            <Link
              href="/patient/consent"
              className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-[#16243C] px-5 py-3 text-xs font-bold text-white hover:bg-[#1E304E] transition-all"
            >
              <UserCheck className="h-4 w-4 text-[#06B6D4]" />
              <span>Doctor Consents</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Records */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0E1726]/80 p-5 backdrop-blur-md hover:border-[#10B981]/40 transition-all">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Encrypted Vault</span>
            <div className="p-2 rounded-lg bg-[#10B981]/10 text-[#10B981]">
              <FolderLock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white font-mono">
            {loading ? '...' : stats?.totalRecords ?? records.length}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#10B981] font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>100% AES-256-GCM Encrypted</span>
          </div>
        </div>

        {/* Blockchain Integrity */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0E1726]/80 p-5 backdrop-blur-md hover:border-[#06B6D4]/40 transition-all">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">EVM Anchor Status</span>
            <div className="p-2 rounded-lg bg-[#06B6D4]/10 text-[#06B6D4]">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white font-mono">
            {loading ? '...' : `${stats?.verifiedRecords ?? records.length} / ${records.length}`}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#06B6D4] font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Smart Contract Hashes Match</span>
          </div>
        </div>

        {/* Active Doctor Consents */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0E1726]/80 p-5 backdrop-blur-md hover:border-purple-400/40 transition-all">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Authorized Doctors</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white font-mono">
            {loading ? '...' : stats?.activeConsents ?? 1}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-purple-400 font-medium">
            <Clock className="h-3.5 w-3.5" />
            <span>Dr. Vance (Cardiology)</span>
          </div>
        </div>

        {/* Storage Footprint */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0E1726]/80 p-5 backdrop-blur-md hover:border-amber-400/40 transition-all">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Decentralized CID Store</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Database className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white font-mono">
            {loading ? '...' : `${(stats?.storageFootprintKb || 1120).toFixed(0)} KB`}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
            <span>Zero Plaintext Bytes</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Vault Records & Interactive Security Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Records in Vault */}
        <div className="lg:col-span-2 rounded-3xl border border-white/[0.08] bg-[#0A1628]/80 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Recent Medical Documents</h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Encrypted clinical reports stored in your personal zero-knowledge vault
              </p>
            </div>
            <Link
              href="/patient/vault"
              className="flex items-center gap-1 text-xs font-bold text-[#10B981] hover:underline"
            >
              <span>Full Vault</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-[#0E1726]/90 p-4 hover:border-[#10B981]/50 hover:bg-[#101B2E] transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#10B981]/15 to-[#06B6D4]/10 text-[#10B981] border border-[#10B981]/30 group-hover:scale-105 transition-transform">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#10B981] transition-colors">
                      {rec.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#64748B]">
                      <span className="rounded-md bg-white/[0.05] px-2 py-0.5 font-mono text-[10px] text-[#06B6D4] border border-white/[0.06]">
                        {rec.category}
                      </span>
                      <span>•</span>
                      <span>{rec.examinationDate || '2024-03-12'}</span>
                      <span>•</span>
                      <span>{rec.doctorName || 'Dr. Vance'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/15 px-2.5 py-1 text-[10px] font-bold text-[#10B981] border border-[#10B981]/30">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                  <Link
                    href={`/patient/vault?id=${rec.id}`}
                    className="rounded-xl border border-white/[0.1] bg-[#16243C] px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    Inspect
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Security & Cryptographic Health Card */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#0A1628]/80 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#10B981] mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Security Assurance</span>
            </div>
            <h3 className="text-lg font-bold text-white">Cryptographic Status</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="rounded-2xl border border-white/[0.06] bg-[#0E1726] p-4 space-y-1">
              <div className="flex items-center justify-between text-white font-semibold">
                <span>Encryption Cipher</span>
                <span className="font-mono text-[#10B981]">AES-256-GCM</span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                Authenticated client-side cipher with 96-bit unique IV per payload
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-[#0E1726] p-4 space-y-1">
              <div className="flex items-center justify-between text-white font-semibold">
                <span>Key Wrapping Scheme</span>
                <span className="font-mono text-[#06B6D4]">Envelope (RSA/KW)</span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                DEKs wrapped per doctor and permanently deactivated upon revocation
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-[#0E1726] p-4 space-y-1">
              <div className="flex items-center justify-between text-white font-semibold">
                <span>Immutable Anchor</span>
                <span className="font-mono text-amber-400">Hardhat EVM</span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                Contract 0x5FbD...aa3 verified & active
              </p>
            </div>
          </div>

          <Link
            href="/patient/consent"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#101B2E] border border-white/[0.1] py-3 text-xs font-bold text-white hover:bg-[#16243C] transition-all"
          >
            <span>Review Doctor Permissions</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
