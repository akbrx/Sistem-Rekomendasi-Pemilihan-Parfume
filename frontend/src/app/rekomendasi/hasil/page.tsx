'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  
  const [results, setResults] = useState<PerfumeResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) {
    return <div className="min-h-[50vh] flex flex-col items-center justify-center">
             <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
             <p className="text-gray-500 font-medium">Mengkalkulasi Pembobotan Evaluasi TOPSIS...</p>
           </div>;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-16 bg-white p-8 rounded-3xl shadow-xl border border-red-100">
         <div className="flex items-center space-x-4 text-red-600 mb-6">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <h2 className="text-2xl font-bold">Oops!</h2>
         </div>
         <p className="text-gray-700 text-lg mb-8 bg-red-50 p-4 rounded-lg">{error}</p>
         <button onClick={() => router.back()} className="px-6 py-3 bg-gray-900 font-bold text-white rounded-xl hover:bg-gray-800 transition shadow-md">
           Kembali Ubah Filter
         </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10 text-center animate-fade-in-up">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Hasil Rekomendasi Parfum</h1>
            <p className="text-gray-500 mt-3 text-lg">Berdasarkan perhitungan metode AHP & TOPSIS</p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="overflow-x-auto">
              <table className="min-w-full leading-normal">
                  <thead>
                      <tr>
                          <th className="px-6 py-4 border-b-2 border-gray-100 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rank</th>
                          <th className="px-6 py-4 border-b-2 border-gray-100 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Parfum</th>
                          <th className="px-6 py-4 border-b-2 border-gray-100 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Brand</th>
                          <th className="px-6 py-4 border-b-2 border-gray-100 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Keluarga Aroma</th>
                          <th className="px-6 py-4 border-b-2 border-gray-100 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Harga</th>
                          <th className="px-6 py-4 border-b-2 border-gray-100 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Skor Preferensi (Ci)</th>
                      </tr>
                  </thead>
                  <tbody>
                      {results.map((perfume) => (
                          <tr key={perfume.id} className={`${perfume.rank === 1 ? 'bg-indigo-50/50' : 'bg-white'} hover:bg-gray-50 transition duration-150`}>
                              <td className="px-6 py-5 border-b border-gray-100 text-sm whitespace-nowrap">
                                  <span className={`font-extrabold ${perfume.rank === 1 ? 'text-indigo-600 text-lg' : 'text-gray-900'}`}>
                                      {perfume.rank === 1 ? '🏆 ' : ''}#{perfume.rank}
                                  </span>
                              </td>
                              <td className="px-6 py-5 border-b border-gray-100 text-sm">
                                  <p className="text-gray-900 font-bold">{perfume.name}</p>
                              </td>
                              <td className="px-6 py-5 border-b border-gray-100 text-sm">
                                  <p className="text-gray-600 font-medium">{perfume.brand}</p>
                              </td>
                              <td className="px-6 py-5 border-b border-gray-100 text-sm">
                                  <span className="relative inline-block px-3 py-1 font-semibold text-indigo-900 leading-tight">
                                      <span aria-hidden className="absolute inset-0 bg-indigo-100 rounded-full"></span>
                                      <span className="relative">{perfume.olfactory_family}</span>
                                  </span>
                              </td>
                              <td className="px-6 py-5 border-b border-gray-100 text-sm whitespace-nowrap">
                                  <p className="text-gray-900 font-medium">Rp {perfume.price.toLocaleString('id-ID')}</p>
                              </td>
                              <td className="px-6 py-5 border-b border-gray-100 text-sm whitespace-nowrap">
                                  <p className="text-gray-900 font-mono font-bold bg-gray-100 px-2 py-1 rounded inline-block">{perfume.score.toFixed(4)}</p>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 text-right">
              <Link href="/rekomendasi" className="text-indigo-600 font-semibold hover:text-indigo-800 transition">
                &larr; Coba Filter Lain
              </Link>
            </div>
        </div>
    </div>
  );
}
