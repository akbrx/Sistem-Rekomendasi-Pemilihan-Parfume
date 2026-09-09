'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

// Label Sillage — skala jejak aroma di udara (durasi jejak)
const sillageLabels: Record<number, string> = {
  1: 'Tidak Ada Jejak',
  2: 'Jejak Singkat',
  3: 'Jejak Cukup',
  4: 'Jejak Kentara',
  5: 'Jejak Abadi',
};

// Label Projection — seberapa jauh tercium orang lain
const projectionLabels: Record<number, string> = {
  1: 'Sangat dekat(0–0.5 m)',
  2: 'Dekat(0.5–1 m)',
  3: 'Sedang(1–2 m)',
  4: 'Jauh(2–3 m)',
  5: 'Sangat Jauh(> 3 m)',
};

// Label Longevity — ketahanan aroma di kulit
const longevityLabels: Record<number, string> = {
  1: '< 4 Jam  (Ringan)',
  2: '4–6 Jam  (Cukup)',
  3: '6–8 Jam  (Tahan Lama)',
  4: '8–10 Jam  (Sangat Tahan)',
  5: '> 10 Jam  (Seharian)',
};

interface SliderFieldProps {
  id: string;
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
  labels?: Record<number, string>;
  icon: string;
}

function SliderField({ id, label, description, value, onChange, labels, icon }: SliderFieldProps) {
  const displayLabels = labels || {};
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          {label && (
            <label htmlFor={id} className="flex items-center gap-2 text-gray-200 font-semibold text-sm uppercase tracking-wide">
              <span className="text-lg">{icon}</span>
              {label}
            </label>
          )}
          {description && <p className="text-gray-500 text-xs mt-0.5">{description}</p>}
        </div>
        <div className="text-right shrink-0 ml-4">
          <span className="text-indigo-400 font-bold text-sm">{displayLabels[value] || ''}</span>
          <div className="text-gray-600 text-xs">Skala {value}/5</div>
        </div>
      </div>

      {/* Custom Slider Track */}
      <div className="relative pt-1">
        <input
          type="range"
          id={id}
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #6366f1 0%, #a855f7 ${((value - 1) / 4) * 100}%, #374151 ${((value - 1) / 4) * 100}%, #374151 100%)`
          }}
        />
        {/* Step markers */}
        <div className="flex justify-between mt-1.5 px-0.5">
          {[1, 2, 3, 4, 5].map((v) => (
            <span
              key={v}
              className={`text-[10px] font-medium ${value >= v ? 'text-indigo-400' : 'text-gray-600'}`}
            >
              {v}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RecommendationForm() {
  const router = useRouter();

  // Checklist aroma - multi select
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);

  // Sliders 1-5
  const [sillage, setSillage] = useState(3);
  const [projection, setProjection] = useState(3);
  const [longevity, setLongevity] = useState(3);

  // Budget
  const [priceDisplay, setPriceDisplay] = useState('');

  // Toggle aroma preference
  const [enableSillage, setEnableSillage] = useState(false);
  const [enableProjection, setEnableProjection] = useState(false);
  const [enableLongevity, setEnableLongevity] = useState(false);

  const olfactoryFamilies = [
    { value: 'Citrus', emoji: '🍋' },
    { value: 'Floral', emoji: '🌸' },
    { value: 'Fougère', emoji: '🌿' },
    { value: 'Oriental', emoji: '🌙' },
    { value: 'Woody', emoji: '🪵' },
    { value: 'Fresh / Aquatic', emoji: '💧' },
    { value: 'Gourmand', emoji: '🍫' },
    { value: 'Chypre', emoji: '🍃' },
  ];

  const toggleFamily = (family: string) => {
    setSelectedFamilies((prev) =>
      prev.includes(family) ? prev.filter((f) => f !== family) : [...prev, family]
    );
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setPriceDisplay(formatRupiah(raw));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (selectedFamilies.length > 0) {
      params.append('olfactory_families', selectedFamilies.join(','));
    }

    const rawPrice = parseRupiahToNumber(priceDisplay);
    if (rawPrice) params.append('max_price', rawPrice);

    if (enableSillage) params.append('pref_sillage', sillage.toString());
    if (enableProjection) params.append('pref_projection', projection.toString());
    if (enableLongevity) params.append('pref_longevity', longevity.toString());

    router.push(`/rekomendasi/hasil?${params.toString()}`);
  };

  return (
    <>
      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          cursor: pointer;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2), 0 2px 6px rgba(0,0,0,0.4);
          transition: box-shadow 0.2s;
        }
        .slider-thumb::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 5px rgba(99, 102, 241, 0.3), 0 2px 8px rgba(0,0,0,0.4);
        }
        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border: none;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          cursor: pointer;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }
        .preference-card {
          transition: all 0.3s ease;
        }
        .preference-card.active {
          border-color: rgba(99, 102, 241, 0.5);
          background: rgba(99, 102, 241, 0.08);
        }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        {/* Card */}
        <div className="bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600/80 to-purple-600/80 px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 left-8 text-6xl">✨</div>
              <div className="absolute bottom-2 right-8 text-5xl">🌹</div>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight relative">Cari Parfum Idamanmu</h1>
            <p className="text-indigo-200 mt-2 text-sm relative">Atur preferensi Anda, biarkan algoritma AHP-TOPSIS yang bekerja.</p>
          </div>

          {/* Soft-filter disclaimer */}
          <div className="mx-8 mt-6 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-amber-400 text-lg mt-0.5">💡</span>
            <p className="text-amber-300/80 text-xs leading-relaxed">
              Semua parfum akan ditampilkan dalam hasil. Parfum yang lebih sesuai dengan preferensi Anda akan mendapat <strong>peringkat lebih tinggi</strong>, sementara yang kurang sesuai tetap muncul di bawah.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">

            {/* ── SECTION 1: Keluarga Aroma ── */}
            <div>
              <div className="mb-3">
                <span className="text-gray-200 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                  <span className="text-lg">🌺</span> Keluarga Aroma Favorit
                </span>
                <p className="text-gray-500 text-xs mt-0.5">Pilih satu atau lebih aroma yang Anda sukai (opsional)</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {olfactoryFamilies.map(({ value, emoji }) => {
                  const isChecked = selectedFamilies.includes(value);
                  return (
                    <button
                      type="button"
                      key={value}
                      onClick={() => toggleFamily(value)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer
                        ${isChecked
                          ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 shadow-md shadow-indigo-500/10'
                          : 'border-gray-600/60 bg-gray-700/20 text-gray-400 hover:border-gray-500 hover:bg-gray-700/40'
                        }
                      `}
                    >
                      {/* Checkbox visual */}
                      <span className={`
                        flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                        ${isChecked ? 'border-indigo-500 bg-indigo-500' : 'border-gray-500 bg-transparent'}
                      `}>
                        {isChecked && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span className="text-base">{emoji}</span>
                      <span className="font-medium text-sm leading-tight">{value}</span>
                    </button>
                  );
                })}
              </div>

              {selectedFamilies.length > 0 && (
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500">Dipilih:</span>
                  {selectedFamilies.map((f) => (
                    <span key={f} className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full px-2.5 py-0.5 font-medium">
                      {f}
                    </span>
                  ))}
                  <button type="button" onClick={() => setSelectedFamilies([])} className="text-xs text-gray-500 hover:text-gray-300 underline ml-1">
                    reset
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-700/40" />

            {/* ── SECTION 2: Performance Sliders ── */}
            <div>
              <div className="mb-4">
                <span className="text-gray-200 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                  <span className="text-lg">⚗️</span> Preferensi Performa
                </span>
                <p className="text-gray-500 text-xs mt-0.5">Aktifkan kriteria yang ingin Anda prioritaskan</p>
              </div>

              <div className="space-y-4">
                {/* Sillage */}
                <div className={`preference-card border rounded-2xl p-4 ${enableSillage ? 'active border-indigo-500/40 bg-indigo-500/5' : 'border-gray-700/50 bg-gray-800/30'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-gray-200 font-semibold text-sm flex items-center gap-1.5">
                        💨 Sillage <span className="text-gray-500 font-normal text-xs">(Jejak Aroma)</span>
                      </span>
                      <p className="text-gray-500 text-xs">Seberapa kuat aroma yang tertinggal setelah Anda lewat</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEnableSillage(!enableSillage)}
                      aria-pressed={enableSillage}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 focus:outline-none ${enableSillage ? 'bg-indigo-500' : 'bg-gray-600'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200 ${enableSillage ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  {enableSillage && (
                    <SliderField
                      id="sillage"
                      label=""
                      description=""
                      value={sillage}
                      onChange={setSillage}
                      labels={sillageLabels}
                      icon=""
                    />
                  )}
                </div>

                {/* Projection */}
                <div className={`preference-card border rounded-2xl p-4 ${enableProjection ? 'active border-indigo-500/40 bg-indigo-500/5' : 'border-gray-700/50 bg-gray-800/30'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-gray-200 font-semibold text-sm flex items-center gap-1.5">
                        📡 Projection <span className="text-gray-500 font-normal text-xs">(Jangkauan Aroma)</span>
                      </span>
                      <p className="text-gray-500 text-xs">Seberapa jauh aroma parfum dapat tercium oleh orang sekitar</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEnableProjection(!enableProjection)}
                      aria-pressed={enableProjection}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 focus:outline-none ${enableProjection ? 'bg-indigo-500' : 'bg-gray-600'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200 ${enableProjection ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  {enableProjection && (
                    <SliderField
                      id="projection"
                      label=""
                      description=""
                      value={projection}
                      onChange={setProjection}
                      labels={projectionLabels}
                      icon=""
                    />
                  )}
                </div>

                {/* Longevity */}
                <div className={`preference-card border rounded-2xl p-4 ${enableLongevity ? 'active border-indigo-500/40 bg-indigo-500/5' : 'border-gray-700/50 bg-gray-800/30'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-gray-200 font-semibold text-sm flex items-center gap-1.5">
                        ⏳ Longevity <span className="text-gray-500 font-normal text-xs">(Ketahanan Aroma)</span>
                      </span>
                      <p className="text-gray-500 text-xs">Seberapa lama parfum bertahan di kulit Anda</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEnableLongevity(!enableLongevity)}
                      aria-pressed={enableLongevity}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 focus:outline-none ${enableLongevity ? 'bg-indigo-500' : 'bg-gray-600'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200 ${enableLongevity ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  {enableLongevity && (
                    <SliderField
                      id="longevity"
                      label=""
                      description=""
                      value={longevity}
                      onChange={setLongevity}
                      labels={longevityLabels}
                      icon=""
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-700/40" />

            {/* ── SECTION 3: Budget ── */}
            <div>
              <label htmlFor="max_price" className="flex items-center gap-2 text-gray-200 font-semibold mb-1 text-sm uppercase tracking-wide">
                <span className="text-lg">💰</span> Budget Maksimal
              </label>
              <p className="text-gray-500 text-xs mb-3">Parfum di atas budget tetap muncul, namun peringkatnya akan lebih rendah</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm select-none">Rp</span>
                <input
                  type="text"
                  id="max_price"
                  inputMode="numeric"
                  value={priceDisplay}
                  onChange={handlePriceChange}
                  placeholder="500.000"
                  className="w-full border border-gray-600 rounded-xl py-3.5 pl-12 pr-4 text-gray-200 bg-gray-700/50 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 font-mono text-lg tracking-wider placeholder-gray-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5 ml-1">Kosongkan jika tidak ingin membatasi budget.</p>
            </div>

            {/* ── Summary of active filters ── */}
            {(selectedFamilies.length > 0 || priceDisplay || enableSillage || enableProjection || enableLongevity) && (
              <div className="bg-gray-700/20 border border-gray-600/30 rounded-xl p-4">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">Filter Aktif</p>
                <div className="flex flex-wrap gap-2">
                  {selectedFamilies.map(f => (
                    <span key={f} className="text-xs bg-purple-500/15 text-purple-300 border border-purple-500/25 rounded-full px-2.5 py-1">🌺 {f}</span>
                  ))}
                  {priceDisplay && (
                    <span className="text-xs bg-green-500/15 text-green-300 border border-green-500/25 rounded-full px-2.5 py-1">💰 Max Rp {priceDisplay}</span>
                  )}
                  {enableSillage && (
                    <span className="text-xs bg-blue-500/15 text-blue-300 border border-blue-500/25 rounded-full px-2.5 py-1">💨 Sillage: {sillage}</span>
                  )}
                  {enableProjection && (
                    <span className="text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 rounded-full px-2.5 py-1">📡 Projection: {projection}</span>
                  )}
                  {enableLongevity && (
                    <span className="text-xs bg-amber-500/15 text-amber-300 border border-amber-500/25 rounded-full px-2.5 py-1">⏳ Longevity: {longevity}</span>
                  )}
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 text-base tracking-wide flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Cari Rekomendasi Parfum
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
