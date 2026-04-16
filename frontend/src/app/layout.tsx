import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

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
      <body className={`${inter.className} bg-gray-50 flex flex-col min-h-screen text-gray-900`}>
        {/* Top Navbar */}
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-extrabold text-indigo-600 tracking-tight hover:opacity-80 transition">
                  PerfumeSuggest
                </Link>
              </div>
              <div className="hidden md:flex space-x-8">
                <Link href="/" className="text-gray-700 hover:text-indigo-600 font-medium transition duration-150">Home</Link>
                <Link href="/tentang-parfume" className="text-gray-700 hover:text-indigo-600 font-medium transition duration-150">Tentang</Link>
                <Link href="/rekomendasi" className="text-gray-700 hover:text-indigo-600 font-medium transition duration-150">Rekomendasi</Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8 mt-12 w-full">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="mb-2 font-medium">&copy; {new Date().getFullYear()} PerfumeSuggest. All rights reserved.</p>
            <p className="text-gray-400 text-sm">Sistem Rekomendasi Parfum menggunakan kombinasi metode kalkulasi rasio AHP & TOPSIS.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
