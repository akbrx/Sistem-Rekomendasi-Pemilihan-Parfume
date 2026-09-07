import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';

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
          {/* Responsive Top Navbar */}
          <Navbar />

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
