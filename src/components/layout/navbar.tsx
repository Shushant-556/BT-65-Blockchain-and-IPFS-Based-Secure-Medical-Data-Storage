'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import {
  ShieldCheck,
  FolderLock,
  UserCheck,
  Cpu,
  Layers,
  Activity,
  LogOut,
  ChevronDown,
  Lock,
  Sparkles,
  Zap,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Menu,
  X,
  Stethoscope,
  Building,
  KeyRound,
} from 'lucide-react';

export const Navbar = () => {
  const pathname = usePathname();
  const { user, logout, switchDemoUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [blockHeight, setBlockHeight] = useState(1072);

  // Simulated live blockchain block ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight((prev) => prev + 1);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const getPortalLink = () => {
    if (!user) return '/patient';
    switch (user.role) {
      case 'DOCTOR':
        return '/doctor';
      case 'HOSPITAL':
        return '/hospital';
      case 'ADMIN':
        return '/admin';
      case 'PATIENT':
      default:
        return '/patient';
    }
  };

  const navLinks = [
    { label: 'Portal', href: getPortalLink(), icon: FolderLock },
    { label: 'Medical Vault', href: '/patient/vault', icon: Lock },
    { label: 'Consent Center', href: '/patient/consent', icon: UserCheck },
    { label: 'Blockchain Explorer', href: '/blockchain', icon: Layers },
    { label: 'FHIR Interop', href: '/fhir', icon: Cpu },
    { label: 'System Health', href: '/health', icon: Activity },
  ];

  const copyWallet = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#070D18]/90 backdrop-blur-xl">
      {/* Top micro-status bar */}
      <div className="border-b border-white/[0.04] bg-[#050A13] px-4 py-1 text-[10px] font-mono text-[#94A3B8]">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#10B981]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-ping" />
              EVM Hardhat Node Active
            </span>
            <span className="hidden sm:inline text-white/30">•</span>
            <span className="hidden sm:inline text-white/60">
              Block <strong className="text-white">#{blockHeight}</strong>
            </span>
            <span className="hidden md:inline text-white/30">•</span>
            <span className="hidden md:inline text-white/60">Gas: 12 Gwei</span>
            <span className="hidden lg:inline text-white/30">•</span>
            <span className="hidden lg:inline text-[#06B6D4]">IPFS CID Engine: Online</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">
              AES-256-GCM Authenticated
            </span>
            <span className="text-white/40 hidden sm:inline">Zero-Knowledge Prototype</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#10B981]/20 to-[#06B6D4]/20 border border-[#10B981]/40 shadow-lg shadow-[#10B981]/15 group-hover:border-[#10B981] transition-all">
              <ShieldCheck className="h-5 w-5 text-[#10B981]" />
              <div className="absolute inset-0 rounded-xl bg-[#10B981]/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white font-sans">
                  MED<span className="text-[#10B981]">CHAIN</span>
                </span>
                <span className="rounded-full bg-[#10B981]/15 px-2 py-0.5 text-[9px] font-bold tracking-widest text-[#10B981] uppercase border border-[#10B981]/30">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[10px] text-[#64748B] font-medium tracking-wide">
                Encrypted & Verifiable Healthcare Infrastructure
              </p>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#10B981]/20 to-transparent text-[#10B981] border-l-2 border-[#10B981] font-bold'
                      : 'text-[#94A3B8] hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#10B981]' : 'text-[#64748B]'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side: Demo Personas Switcher & Account Badge */}
        <div className="flex items-center gap-3">
          {/* Demo Persona Switcher Bar */}
          <div className="hidden sm:flex items-center gap-1 rounded-xl border border-white/[0.08] bg-[#0E1726]/80 p-1 backdrop-blur-md">
            <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              <Sparkles className="h-3 w-3 text-[#10B981]" />
              <span>Persona:</span>
            </div>

            <button
              onClick={() => switchDemoUser('PATIENT')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                user?.role === 'PATIENT'
                  ? 'bg-[#10B981] text-[#070D18] font-bold shadow-md shadow-[#10B981]/25'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              Patient
            </button>
            <button
              onClick={() => switchDemoUser('DOCTOR')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                user?.role === 'DOCTOR'
                  ? 'bg-[#06B6D4] text-[#070D18] font-bold shadow-md shadow-[#06B6D4]/25'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              Doctor
            </button>
            <button
              onClick={() => switchDemoUser('HOSPITAL')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                user?.role === 'HOSPITAL'
                  ? 'bg-purple-400 text-[#070D18] font-bold shadow-md'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              Hospital
            </button>
            <button
              onClick={() => switchDemoUser('ADMIN')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                user?.role === 'ADMIN'
                  ? 'bg-amber-400 text-[#070D18] font-bold shadow-md'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              Admin
            </button>
          </div>

          {/* User Account Info Chip */}
          {user && (
            <div className="flex items-center gap-2 pl-3 border-l border-white/[0.08]">
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0E1726]/60 px-3 py-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#10B981] to-[#06B6D4] text-[#070D18] font-bold text-xs">
                  {user.displayName.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white leading-tight">
                    {user.displayName}
                  </div>
                  <div className="text-[10px] text-[#10B981] font-mono flex items-center gap-1">
                    <span>
                      {user.walletAddress
                        ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                        : 'Encrypted Identity'}
                    </span>
                    {user.walletAddress && (
                      <button
                        onClick={copyWallet}
                        title="Copy wallet address"
                        className="text-[#64748B] hover:text-white"
                      >
                        {copied ? <Check className="h-2.5 w-2.5 text-[#10B981]" /> : <Copy className="h-2.5 w-2.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign out"
                className="rounded-xl border border-white/[0.08] p-2 text-[#64748B] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden rounded-lg p-2 text-white hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/[0.08] bg-[#070D18] px-4 py-4 space-y-3">
          <div className="flex flex-wrap gap-2 pb-3 border-b border-white/[0.08]">
            <button
              onClick={() => {
                switchDemoUser('PATIENT');
                setMobileMenuOpen(false);
              }}
              className="rounded-lg bg-[#10B981] px-3 py-1.5 text-xs font-bold text-[#070D18]"
            >
              Switch to Patient
            </button>
            <button
              onClick={() => {
                switchDemoUser('DOCTOR');
                setMobileMenuOpen(false);
              }}
              className="rounded-lg bg-[#06B6D4] px-3 py-1.5 text-xs font-bold text-[#070D18]"
            >
              Switch to Doctor
            </button>
            <button
              onClick={() => {
                switchDemoUser('ADMIN');
                setMobileMenuOpen(false);
              }}
              className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-[#070D18]"
            >
              Switch to Admin
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg p-2.5 text-xs text-white hover:bg-white/10"
                >
                  <Icon className="h-4 w-4 text-[#10B981]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
