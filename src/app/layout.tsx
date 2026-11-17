import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/components/providers/auth-provider';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'MEDCHAIN — Your Health. Your Data. Your Control.',
  description:
    'Decentralized, encrypted, verifiable healthcare data platform using IPFS CID addressing and blockchain integrity proofs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0A1628] text-[#F8FAFC] antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 pb-12">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
