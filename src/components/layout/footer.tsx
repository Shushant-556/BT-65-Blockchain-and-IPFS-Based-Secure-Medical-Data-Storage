import React from 'react';
import Link from 'next/link';
import { Shield, Lock, FileCode, CheckCircle2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-[#1A2332] bg-[#060E18] text-[#94A3B8] text-xs py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-bold text-white text-sm">MEDCHAIN</span>
              <span className="text-[10px] text-[#10B981] font-mono">v2.4 Academic Edition</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#64748B]">
              Decentralized, encrypted, verifiable healthcare data platform combining client-side
              AES-256-GCM envelope encryption, IPFS CID content addressing, and EVM smart contract
              integrity proofs.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs mb-3 uppercase tracking-wider">
              Architecture Pillars
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-[#10B981]" />
                Zero Plaintext Storage on IPFS/Chain
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-[#10B981]" />
                Patient-Controlled Granular Consent
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-[#10B981]" />
                Cryptographic Integrity Verification
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-[#10B981]" />
                FHIR R4 Interoperability Layer
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs mb-3 uppercase tracking-wider">
              System Exploration
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/blockchain" className="hover:text-white transition-colors">
                  In-App Blockchain Explorer
                </Link>
              </li>
              <li>
                <Link href="/patient/vault" className="hover:text-white transition-colors">
                  Medical Vault & Decryption Pipeline
                </Link>
              </li>
              <li>
                <Link href="/patient/consent" className="hover:text-white transition-colors">
                  Consent Lifecycle & Revocation
                </Link>
              </li>
              <li>
                <Link href="/health" className="hover:text-white transition-colors">
                  Observability & Health Checks
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs mb-3 uppercase tracking-wider">
              Academic Disclaimer
            </h4>
            <div className="rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/5 p-2.5 text-[10px] text-[#F59E0B] leading-relaxed">
              <span className="font-bold block mb-1">PROTOTYPE NOTICE:</span>
              This system operates exclusively with synthetic medical records for research and
              educational purposes. Revocation cannot erase plaintext already downloaded by authorized
              clients. Not certified for HIPAA/GDPR clinical production use.
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-[#1A2332]/60 text-[11px] text-[#64748B]">
          <p>© 2026 MEDCHAIN Healthcare Research Initiative. Open academic implementation.</p>
          <div className="flex gap-4 mt-2 sm:mt-0 font-mono text-[10px]">
            <span>SHA-256 Verified</span>
            <span>•</span>
            <span>Solidity 0.8.24</span>
            <span>•</span>
            <span>WebCrypto 256-bit</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
