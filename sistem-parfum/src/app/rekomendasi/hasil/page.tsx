'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface PerfumeResult {
  rank: number;
  id: number;
  name: string;
  brand: string;
  olfactory_family: string;
  price: number;
  score: number;
}

export default function HasilRekomendasi() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [results, setResults] = useState<PerfumeResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [toastMsg, setToastMsg] = useState('');

  // Fetch hasil rekomendasi
  useEffect(() => {
    const fetchData = async () => {
      try {
        const formData = new FormData();
        const family = searchParams.get('olfactory_family');
        const maxPrice = searchParams.get('max_price');
        const minLongevity = searchParams.get('min_longevity');

        if(family) formData.append('olfactory_family', family);
        if(maxPrice) formData.append('max_price', maxPrice);
        if(minLongevity) formData.append('min_longevity', minLongevity);

        const res = await fetch('/api/perfumes/recommend', {
          method: 'POST',
          body: formData,
        });
        
        const data = await res.json();
        
        if (data.success) {
          setResults(data.rankings);
        } else {
          setError(data.message || 'Gagal mengambil data.');
        }
      } catch (err) {
        setError('Terjadi kesalahan jaringan.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  // Fetch favorit user (jika sudah login)
  useEffect(() => {
    if (session) {
      fetch('/api/favorites')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const ids = new Set<number>(data.favorites.map((f: any) => f.perfume.id));
            setFavoriteIds(ids);
          }
        });
    }
  }, [session]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const toggleFavorite = async (perfumeId: number) => {
    if (!session) {
      showToast('Silakan login terlebih dahulu untuk menyimpan favorit.');
      return;
    }

    if (favoriteIds.has(perfumeId)) {
      // Remove
      await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perfume_id: perfumeId }),
      });
      setFavoriteIds(prev => { const n = new Set(prev); n.delete(perfumeId); return n; });
      showToast('Dihapus dari favorit.');
    } else {
      // Add
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perfume_id: perfumeId }),
      });
      setFavoriteIds(prev => new Set(prev).add(perfumeId));
      showToast('Ditambahkan ke favorit!');
    }
  };

  if (loading) {
    return <div className="min-h-[50vh] flex flex-col items-center justify-center">
             <div className="w-12 h-12 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
             <p className="text-gray-400 font-medium">Mengkalkulasi Pembobotan Evaluasi TOPSIS...</p>
           </div>;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-16 bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700/50">
         <div className="flex items-center space-x-4 text-red-400 mb-6">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <h2 className="text-2xl font-bold">Oops!</h2>
         </div>
         <p className="text-gray-300 text-lg mb-8 bg-red-900/30 border border-red-800/50 p-4 rounded-lg">{error}</p>
         <button onClick={() => router.back()} className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 font-bold text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition shadow-lg shadow-indigo-500/20">
           Kembali Ubah Filter
         </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 relative">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed top-20 right-6 z-50 bg-gray-800 border border-gray-600 text-gray-200 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-pulse">
            {toastMsg}
          </div>
        )}

        <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Hasil Rekomendasi Parfum</h1>
            <p className="text-gray-400 mt-3 text-lg">Berdasarkan perhitungan metode AHP & TOPSIS</p>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden border border-gray-700/50">
            <div className="overflow-x-auto">
              <table className="min-w-full leading-normal">
                  <thead>
                      <tr>
                          <th className="px-6 py-4 border-b border-gray-700 bg-gray-800/80 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Rank</th>
                          <th className="px-6 py-4 border-b border-gray-700 bg-gray-800/80 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Parfum</th>
                          <th className="px-6 py-4 border-b border-gray-700 bg-gray-800/80 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Brand</th>
                          <th className="px-6 py-4 border-b border-gray-700 bg-gray-800/80 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Keluarga Aroma</th>
                          <th className="px-6 py-4 border-b border-gray-700 bg-gray-800/80 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Harga</th>
                          <th className="px-6 py-4 border-b border-gray-700 bg-gray-800/80 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Skor (Ci)</th>
                          <th className="px-4 py-4 border-b border-gray-700 bg-gray-800/80 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Favorit</th>
                      </tr>
                  </thead>
                  <tbody>
                      {results.map((perfume) => (
                          <tr key={perfume.id} className={`${perfume.rank === 1 ? 'bg-indigo-500/10' : ''} hover:bg-gray-700/30 transition duration-150`}>
                              <td className="px-6 py-5 border-b border-gray-700/50 text-sm whitespace-nowrap">
                                  <span className={`font-extrabold ${perfume.rank === 1 ? 'text-indigo-400 text-lg' : 'text-gray-200'}`}>
                                      {perfume.rank === 1 ? '' : ''}#{perfume.rank}
                                  </span>
                              </td>
                              <td className="px-6 py-5 border-b border-gray-700/50 text-sm">
                                  <p className="text-white font-bold">{perfume.name}</p>
                              </td>
                              <td className="px-6 py-5 border-b border-gray-700/50 text-sm">
                                  <p className="text-gray-300 font-medium">{perfume.brand}</p>
                              </td>
                              <td className="px-6 py-5 border-b border-gray-700/50 text-sm">
                                  <span className="relative inline-block px-3 py-1 font-semibold text-indigo-300 leading-tight">
                                      <span aria-hidden className="absolute inset-0 bg-indigo-500/20 border border-indigo-500/30 rounded-full"></span>
                                      <span className="relative">{perfume.olfactory_family}</span>
                                  </span>
                              </td>
                              <td className="px-6 py-5 border-b border-gray-700/50 text-sm whitespace-nowrap">
                                  <p className="text-gray-200 font-medium">Rp {perfume.price.toLocaleString('id-ID')}</p>
                              </td>
                              <td className="px-6 py-5 border-b border-gray-700/50 text-sm whitespace-nowrap">
                                  <p className="text-indigo-300 font-mono font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded inline-block">{perfume.score.toFixed(4)}</p>
                              </td>
                              <td className="px-4 py-5 border-b border-gray-700/50 text-center">
                                  <button
                                    onClick={() => toggleFavorite(perfume.id)}
                                    className="transition-all duration-200 hover:scale-125 p-1"
                                    title={favoriteIds.has(perfume.id) ? 'Hapus dari favorit' : 'Tambahkan ke favorit'}
                                  >
                                    {favoriteIds.has(perfume.id) ? (
                                      <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      <svg className="w-6 h-6 text-gray-500 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                      </svg>
                                    )}
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-gray-800/50 border-t border-gray-700/50 text-right">
              <Link href="/rekomendasi" className="text-indigo-400 font-semibold hover:text-indigo-300 transition">
                &larr; Coba Filter Lain
              </Link>
            </div>
        </div>
    </div>
  );
}
