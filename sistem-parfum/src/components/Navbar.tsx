'use client';

import Link from 'next/link';
import { useState } from 'react';
import NavbarAuth from '@/components/NavbarAuth';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-900/90 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight hover:opacity-80 transition"
            >
              PerfumeSuggest
            </Link>
          </div>

          {/* Desktop Navigation Links & Auth */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-indigo-400 font-medium transition duration-150">
              Home
            </Link>
            <Link href="/#edukasi" className="text-gray-300 hover:text-indigo-400 font-medium transition duration-150">
              Tentang
            </Link>
            <Link href="/rekomendasi" className="text-gray-300 hover:text-indigo-400 font-medium transition duration-150">
              Rekomendasi
            </Link>
            <div className="ml-4 pl-4 border-l border-gray-700">
              <NavbarAuth />
            </div>
          </div>

          {/* Mobile Navigation Right Side (Auth + Hamburger) */}
          <div className="flex items-center gap-3 md:hidden">
            <NavbarAuth />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800 px-4 pt-3 pb-4 space-y-2 animate-fadeIn">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition"
          >
            Home
          </Link>
          <Link
            href="/#edukasi"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition"
          >
            Tentang
          </Link>
          <Link
            href="/rekomendasi"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-indigo-400 hover:bg-gray-800 transition"
          >
            Rekomendasi
          </Link>
        </div>
      )}
    </nav>
  );
}
