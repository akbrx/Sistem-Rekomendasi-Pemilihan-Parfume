'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FavoriteItem {
  favoriteId: number;
  perfume: {
    id: number;
    name: string;
    brand: string;
    olfactory_family: string;
    price: number;
  };
}

export default function ProfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch('/api/favorites')
        .then(res => res.json())
        .then(data => {
          if (data.success) setFavorites(data.favorites);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  const removeFavorite = async (perfumeId: number) => {
    await fetch('/api/favorites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perfume_id: perfumeId }),
    });
    setFavorites(prev => prev.filter(f => f.perfume.id !== perfumeId));
  };

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-gray-400 font-medium text-sm">Memuat profil…</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Profile Card */}
      <div className="bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden mb-10">
        <div className="bg-gradient-to-br from-indigo-600/80 to-purple-600/80 px-8 py-10 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-extrabold text-2xl border-2 border-white/30">
            {session.user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">{session.user?.name}</h1>
            <p className="text-indigo-200 text-sm">{session.user?.email}</p>
          </div>
        </div>
        <div className="p-6 flex justify-end">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-5 py-2.5 bg-red-500/20 border border-red-500/30 text-red-400 font-semibold rounded-xl hover:bg-red-500/30 transition text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Favorites Section */}
      <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
        <span className="text-red-400">♥</span> Parfum Favorit Saya
      </h2>

      {favorites.length === 0 ? (
        <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-12 text-center">
          <p className="text-gray-400 text-lg mb-4">Anda belum memiliki parfum favorit.</p>
          <Link
            href="/rekomendasi"
            className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition shadow-lg shadow-indigo-500/20"
          >
            Cari Rekomendasi
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {favorites.map((item) => (
            <div
              key={item.favoriteId}
              className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 flex justify-between items-start hover:border-gray-600 transition"
            >
              <div>
                <h3 className="text-white font-bold text-lg">{item.perfume.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{item.perfume.brand}</p>
                <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 rounded-full">
                  {item.perfume.olfactory_family}
                </span>
                <p className="text-gray-300 font-medium mt-2">Rp {item.perfume.price.toLocaleString('id-ID')}</p>
              </div>
              <button
                onClick={() => removeFavorite(item.perfume.id)}
                className="text-red-400 hover:text-red-300 transition p-2 hover:bg-red-500/10 rounded-lg"
                title="Hapus dari favorit"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
