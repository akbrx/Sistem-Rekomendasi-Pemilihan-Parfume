'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export default function NavbarAuth() {
  const { data: session, status } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  if (status === 'loading') {
    return <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>;
  }

  if (!session) {
    // Guest - Show Login Button
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-xs sm:text-sm shadow-md hover:shadow-indigo-500/25 transition duration-150"
      >
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        <span>Masuk</span>
      </Link>
    );
  }

  // Logged in
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 group cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
          {session.user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span className="text-gray-300 text-sm font-medium group-hover:text-indigo-400 transition hidden sm:inline">
          {session.user?.name}
        </span>
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
            <Link
              href="/profil"
              onClick={() => setShowMenu(false)}
              className="block px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition text-sm font-medium"
            >
              Profil & Favorit
            </Link>
            <button
              onClick={() => { setShowMenu(false); signOut({ callbackUrl: '/' }); }}
              className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-700 hover:text-red-300 transition text-sm font-medium border-t border-gray-700"
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
