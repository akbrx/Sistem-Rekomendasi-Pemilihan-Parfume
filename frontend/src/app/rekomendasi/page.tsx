'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RecommendationForm() {
  const router = useRouter();
  const [families, setFamilies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // form state
  const [family, setFamily] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minLongevity, setMinLongevity] = useState('3');

  useEffect(() => {
    fetch('/api/perfumes/families')
      .then(res => res.json())
      .then(data => {
        if(data.families) setFamilies(data.families);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert to query params
    const params = new URLSearchParams();
    if(family) params.append('olfactory_family', family);
    if(maxPrice) params.append('max_price', maxPrice);
    if(minLongevity) params.append('min_longevity', minLongevity);
    
    router.push(`/rekomendasi/hasil?${params.toString()}`);
  }

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center">Loading Data...</div>;
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-xl mt-16 border border-gray-100">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">Cari Parfum Idamanmu</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="olfactory_family" className="block text-gray-800 font-bold mb-2">Pilih Keluarga Aroma</label>
          <select 
            id="olfactory_family"
            value={family}
            onChange={(e) => setFamily(e.target.value)}
            className="shadow-sm border border-gray-300 rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          >
            <option value="">Semua Aroma</option>
            {families.map((f, i) => (
              <option key={i} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div>
           <label htmlFor="max_price" className="block text-gray-800 font-bold mb-2">Budget Maksimal (Rp)</label>
           <input 
             type="number" 
             id="max_price"
             value={maxPrice}
             onChange={(e) => setMaxPrice(e.target.value)}
             placeholder="Contoh: 500000" 
             className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
           />
        </div>

        <div>
          <label className="block text-gray-800 font-bold mb-3">Minimal Ketahanan (Skala 1 - 5)</label>
          <div className="flex items-center space-x-6">
            {[1,2,3,4,5].map(num => (
              <label key={num} className="inline-flex flex-col items-center cursor-pointer group">
                <input 
                  type="radio" 
                  name="min_longevity" 
                  value={num} 
                  checked={minLongevity === num.toString()}
                  onChange={(e) => setMinLongevity(e.target.value)}
                  className="form-radio h-6 w-6 text-indigo-600 focus:ring-indigo-500 border-gray-300 transition" 
                />
                <span className="mt-2 text-gray-600 font-medium group-hover:text-indigo-600 transition">{num}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" className="w-full bg-gray-900 hover:bg-indigo-600 text-white font-bold py-4 px-4 rounded-xl shadow-md hover:shadow-lg transition duration-300">
             Cari Rekomendasi Sekarang
          </button>
        </div>
      </form>
    </div>
  );
}
