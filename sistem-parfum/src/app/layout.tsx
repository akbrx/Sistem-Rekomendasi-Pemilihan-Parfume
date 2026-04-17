import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import AuthProvider from '@/components/AuthProvider';
import NavbarAuth from '@/components/NavbarAuth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PerfumeSuggest',
  description: 'Sistem Rekomendasi Parfum Menggunakan AHP & TOPSIS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-gray-900 flex flex-col min-h-screen text-white`}>
        <AuthProvider>
          {/* Top Navbar */}
          <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
            <div className="w-full px-6 sm:px-10 lg:px-12">
              <div className="flex justify-between items-center h-16">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight hover:opacity-80 transition">
                    PerfumeSuggest
                  </Link>
                </div>
                <div className="hidden md:flex items-center space-x-8">
                  <Link href="/" className="text-gray-300 hover:text-indigo-400 font-medium transition duration-150">Home</Link>
                  <Link href="/#edukasi" className="text-gray-300 hover:text-indigo-400 font-medium transition duration-150">Tentang</Link>
                  <Link href="/rekomendasi" className="text-gray-300 hover:text-indigo-400 font-medium transition duration-150">Rekomendasi</Link>
                  <div className="ml-4 pl-4 border-l border-gray-700">
                    <NavbarAuth />
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-grow">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-gray-950 border-t border-gray-800 text-white py-8 w-full">
            <div className="max-w-6xl mx-auto px-4 text-center">
              <p className="mb-2 font-medium text-gray-300">&copy; {new Date().getFullYear()} PerfumeSuggest. All rights reserved.</p>
              <p className="text-gray-500 text-sm">Sistem Rekomendasi Parfum menggunakan kombinasi metode kalkulasi rasio AHP & TOPSIS.</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
