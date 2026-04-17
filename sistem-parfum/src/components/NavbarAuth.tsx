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
    // Guest
    return (
      <Link href="/login" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-gray-400 text-sm font-medium group-hover:text-indigo-400 transition">Guest</span>
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
