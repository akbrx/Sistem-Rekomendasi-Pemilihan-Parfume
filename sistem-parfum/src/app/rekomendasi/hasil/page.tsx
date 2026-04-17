'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface CalculationSteps {
  normalizedMatrix: Record<number, Record<string, number>>;
  weightedMatrix: Record<number, Record<string, number>>;
  idealSolutions: { positive: Record<string, number>, negative: Record<string, number> };
  distances: Record<number, { pos: number, neg: number }>;
  preferenceScores: Record<number, number>;
}

export default function HasilRekomendasi() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [results, setResults] = useState<PerfumeResult[]>([]);
  const [calcSteps, setCalcSteps] = useState<CalculationSteps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [toastMsg, setToastMsg] = useState('');
  const [openStep, setOpenStep] = useState<number | null>(null);

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
          setCalcSteps(data.calculationSteps);
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

        {/* Tabel Ranking Utama */}
        <div className="bg-gray-800/60 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden border border-gray-700/50 mb-16">
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
                                      #{perfume.rank}
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

        {/* Section Detail Perhitungan TOPSIS */}
        {calcSteps && results.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-extrabold text-white mb-8 text-center flex items-center justify-center gap-3">
              <span className="bg-indigo-500/20 p-2 rounded-lg">📊</span>
              Detail Perhitungan TOPSIS (Top 10)
            </h2>

            <div className="space-y-4">
              {[
                { title: 'Step 1: Matriks Normalisasi (R)', data: calcSteps.normalizedMatrix, desc: 'Mengubah nilai asli menjadi nilai berskala antara 0 dan 1.' },
                { title: 'Step 2: Matriks Normalisasi Terbobot (Y)', data: calcSteps.weightedMatrix, desc: 'Mengalikan matriks normalisasi dengan bobot kriteria AHP.' },
                { title: 'Step 3: Solusi Ideal Positif & Negatif', data: null, isIdeal: true },
                { title: 'Step 4: Jarak Solusi & Preferensi Akhir (Ci)', data: calcSteps.distances, isFinal: true },
              ].map((step, sIdx) => (
                <div key={sIdx} className="bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-700/50 overflow-hidden text-sm">
                  {/* Accordion Header */}
                  <button
                    onClick={() => setOpenStep(openStep === sIdx ? null : sIdx)}
                    className={`w-full flex items-center justify-between px-6 py-4 text-left font-bold text-gray-200 hover:bg-gray-700/30 transition-all ${openStep === sIdx ? 'bg-indigo-500/10 text-indigo-300' : ''}`}
                  >
                    <span>{step.title}</span>
                    <svg className={`w-5 h-5 transition-transform ${openStep === sIdx ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  {/* Accordion Content */}
                  {openStep === sIdx && (
                    <div className="p-6 overflow-x-auto border-t border-gray-700/30 bg-gray-900/40">
                      {step.desc && <p className="text-gray-400 mb-4 italic text-xs">{step.desc}</p>}

                      {step.data && !step.isFinal && (
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-800">
                              <th className="py-2">Parfum</th>
                              <th className="py-2">Sillage</th>
                              <th className="py-2">Projection</th>
                              <th className="py-2">Longevity</th>
                              <th className="py-2">Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(step.data).map(([idStr, vals]: [string, any]) => {
                               const perf = results.find(p => p.id === Number(idStr));
                               return (
                                 <tr key={idStr} className="border-b border-gray-800/30 text-gray-300">
                                   <td className="py-3 font-medium text-white">{perf?.name || 'Unknown'}</td>
                                   <td className="py-3 font-mono">{vals.sillage.toFixed(4)}</td>
                                   <td className="py-3 font-mono">{vals.projection.toFixed(4)}</td>
                                   <td className="py-3 font-mono">{vals.longevity.toFixed(4)}</td>
                                   <td className="py-3 font-mono">{vals.price.toFixed(4)}</td>
                                 </tr>
                               );
                            })}
                          </tbody>
                        </table>
                      )}

                      {step.isIdeal && (
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                            <h4 className="text-indigo-400 font-bold mb-3">Solusi Ideal Positif (A+)</h4>
                            <ul className="space-y-2 text-xs font-mono text-gray-300">
                              {Object.entries(calcSteps.idealSolutions.positive).map(([k, v]) => (
                                <li key={k} className="flex justify-between border-b border-gray-800 py-1">
                                  <span className="uppercase">{k}</span>
                                  <span>{v.toFixed(4)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                            <h4 className="text-red-400 font-bold mb-3">Solusi Ideal Negatif (A-)</h4>
                            <ul className="space-y-2 text-xs font-mono text-gray-300">
                              {Object.entries(calcSteps.idealSolutions.negative).map(([k, v]) => (
                                <li key={k} className="flex justify-between border-b border-gray-800 py-1">
                                  <span className="uppercase">{k}</span>
                                  <span>{v.toFixed(4)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {step.isFinal && (
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-800">
                              <th className="py-2">Parfum</th>
                              <th className="py-2">D+ (Jarak Positif)</th>
                              <th className="py-2">D- (Jarak Negatif)</th>
                              <th className="py-2 font-bold text-indigo-400">Ci (Skor Akhir)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(step.data).map(([idStr, distances]: [string, any]) => {
                               const perf = results.find(p => p.id === Number(idStr));
                               const score = calcSteps.preferenceScores[Number(idStr)];
                               return (
                                 <tr key={idStr} className="border-b border-gray-800/30 text-gray-300">
                                   <td className="py-3 font-medium text-white">{perf?.name || 'Unknown'}</td>
                                   <td className="py-3 font-mono text-red-300">{distances.pos.toFixed(4)}</td>
                                   <td className="py-3 font-mono text-green-300">{distances.neg.toFixed(4)}</td>
                                   <td className="py-3 font-mono font-extrabold text-indigo-300">{score.toFixed(4)}</td>
                                 </tr>
                               );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <p className="mt-8 text-center text-gray-500 text-xs max-w-2xl mx-auto leading-relaxed">
              * Perhitungan di atas mencakup 10 alternatif teratas berdasarkan perbandingan kriteria dengan solusi ideal positif dan negatif.
              Alternatif dengan skor Ci terdekat ke 1 (D- paling besar & D+ paling kecil) menjadi peringkat pertama.
            </p>
          </div>
        )}
    </div>
  );
}
