'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Konversi jam → skala longevity database (1-5)
function hoursToScale(hours: number): number {
  if (hours < 4) return 1;
  if (hours <= 6) return 2;
  if (hours <= 8) return 3;
  if (hours <= 10) return 4;
  return 5;
}

// Format angka ke tampilan Rupiah (dengan titik pemisah ribuan)
function formatRupiah(value: string): string {
  const num = value.replace(/\D/g, '');
  if (!num) return '';
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Kembalikan angka mentah (tanpa titik) untuk dikirim ke API
function parseRupiahToNumber(formatted: string): string {
  return formatted.replace(/\./g, '');
}

export default function RecommendationForm() {
  const router = useRouter();
  const [families, setFamilies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [family, setFamily] = useState('');
  const [priceDisplay, setPriceDisplay] = useState(''); // tampilan "500.000"
  const [hours, setHours] = useState('');                // input jam

  useEffect(() => {
    fetch('/api/perfumes/families')
      .then(res => res.json())
      .then(data => {
        if (data.families) setFamilies(data.families);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setPriceDisplay(formatRupiah(raw));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (family) params.append('olfactory_family', family);

    const rawPrice = parseRupiahToNumber(priceDisplay);
    if (rawPrice) params.append('max_price', rawPrice);

    if (hours) {
      const scale = hoursToScale(Number(hours));
      params.append('min_longevity', scale.toString());
    }

    router.push(`/rekomendasi/hasil?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-gray-400 font-medium text-sm">Memuat data aroma…</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16 sm:py-20">
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-500 px-8 py-10 text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Cari Parfum Idamanmu</h1>
          <p className="text-indigo-100 mt-2 text-sm">Tentukan preferensi Anda, biarkan algoritma yang bekerja.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-7">
          {/* Keluarga Aroma */}
          <div>
            <label htmlFor="olfactory_family" className="block text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wide">
              Keluarga Aroma
            </label>
            <select
              id="olfactory_family"
              value={family}
              onChange={(e) => setFamily(e.target.value)}
              className="w-full border border-gray-200 rounded-xl py-3.5 px-4 text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="">Semua Aroma</option>
              {families.map((f, i) => (
                <option key={i} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="max_price" className="block text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wide">
              Budget Maksimal
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm select-none">Rp</span>
              <input
                type="text"
                id="max_price"
                inputMode="numeric"
                value={priceDisplay}
                onChange={handlePriceChange}
                placeholder="500.000"
                className="w-full border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 font-mono text-lg tracking-wider"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5 ml-1">Kosongkan jika tidak ingin membatasi budget.</p>
          </div>

          {/* Jam Ketahanan */}
          <div>
            <label htmlFor="hours" className="block text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wide">
              Minimal Ketahanan Parfum
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { value: '2', label: '2 Jam', sub: 'Ringan' },
                { value: '5', label: '5 Jam', sub: 'Menengah' },
                { value: '7', label: '7 Jam', sub: 'Tahan Lama' },
                { value: '9', label: '9 Jam', sub: 'Sangat Tahan' },
                { value: '11', label: '11 Jam', sub: 'Ekstrem' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setHours(hours === opt.value ? '' : opt.value)}
                  className={`
                    flex flex-col items-center justify-center py-3 px-1 rounded-xl border-2 transition-all duration-200 cursor-pointer
                    ${hours === opt.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-100'
                      : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-white'
                    }
                  `}
                >
                  <span className="font-bold text-sm leading-none">{opt.label}</span>
                  <span className="text-[10px] mt-1 opacity-70">{opt.sub}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5 ml-1">Kosongkan jika tidak ada preferensi ketahanan.</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-indigo-300/40 transition-all duration-300 text-base tracking-wide"
          >
            Cari Rekomendasi
          </button>
        </form>
      </div>
    </div>
  );
}
