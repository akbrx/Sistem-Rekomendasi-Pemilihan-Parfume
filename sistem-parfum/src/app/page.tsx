'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

const aromaFamilies = [
  {
    name: 'Citrus',
    emoji: '🍋',
    color: 'from-yellow-500/20 to-orange-500/20 border-yellow-600/30',
    desc: 'Keluarga aroma segar yang berasal dari buah-buahan sitrus seperti lemon, jeruk, bergamot, dan grapefruit. Cocok untuk cuaca panas dan aktivitas sehari-hari. Parfum citrus biasanya memiliki kesan ceria, energik, dan ringan.',
    examples: 'Acqua di Gio, CK One, Versace Man Eau Fraiche',
  },
  {
    name: 'Floral',
    emoji: '🌸',
    color: 'from-pink-500/20 to-rose-500/20 border-pink-600/30',
    desc: 'Keluarga aroma paling klasik dan populer, didominasi oleh wangi bunga-bungaan seperti mawar, melati, lavender, dan lily. Floral sering digunakan sebagai heart notes dan memberikan kesan feminin, romantis, serta elegan.',
    examples: 'Chanel No. 5, Miss Dior, Gucci Bloom',
  },
  {
    name: 'Fougère',
    emoji: '🌿',
    color: 'from-green-500/20 to-emerald-500/20 border-green-600/30',
    desc: 'Berasal dari bahasa Prancis yang berarti "pakis". Keluarga ini dicirikan oleh kombinasi lavender, oakmoss, dan coumarin. Fougère adalah tulang punggung parfum pria klasik — maskulin, segar, dan herbal.',
    examples: 'Drakkar Noir, Brut, Cool Water',
  },
  {
    name: 'Oriental',
    emoji: '🕌',
    color: 'from-amber-500/20 to-red-500/20 border-amber-600/30',
    desc: 'Keluarga aroma yang hangat, kaya, dan sensual. Menggunakan bahan-bahan eksotis seperti vanila, amber, musk, rempah-rempah (kayu manis, cengkeh), dan kemenyan. Parfum oriental terkesan mewah dan misterius, cocok untuk malam hari.',
    examples: 'Tom Ford Tobacco Vanille, Spicebomb, Shalimar',
  },
  {
    name: 'Woody',
    emoji: '🪵',
    color: 'from-amber-700/20 to-yellow-900/20 border-amber-800/30',
    desc: 'Keluarga aroma berbasis kayu seperti sandalwood, cedarwood, vetiver, oud, dan patchouli. Aroma woody memberikan kesan hangat, matang, berwibawa, dan maskulin. Sangat populer sebagai base notes.',
    examples: 'Terre d\'Hermès, Bleu de Chanel, Oud Wood',
  },
  {
    name: 'Fresh / Aquatic',
    emoji: '🌊',
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-600/30',
    desc: 'Keluarga aroma yang mengingatkan pada udara segar, air laut, dan hujan. Menggunakan bahan sintetis seperti calone untuk menciptakan nuansa akuatik yang bersih dan menyegarkan. Sangat cocok untuk penggunaan harian dan iklim tropis.',
    examples: 'Acqua di Gio Profondo, Light Blue, Nautica Voyage',
  },
  {
    name: 'Gourmand',
    emoji: '🍫',
    color: 'from-rose-500/20 to-purple-500/20 border-rose-600/30',
    desc: 'Keluarga aroma yang terinspirasi dari makanan dan manisan — vanila, cokelat, karamel, kopi, dan madu. Gourmand memberikan kesan manis, hangat, dan "enak dimakan". Populer untuk parfum unisex dan musim dingin.',
    examples: 'Angel by Mugler, Black Opium, BDK Crème de Cuir',
  },
  {
    name: 'Chypre',
    emoji: '🌲',
    color: 'from-teal-500/20 to-green-700/20 border-teal-600/30',
    desc: 'Keluarga aroma sofistikasi yang dibangun di atas fondasi oakmoss, labdanum, dan bergamot. Chypre (diucapkan "sheep-ruh") memiliki karakter elegan, mewah, dan kompleks. Sering dianggap sebagai aroma untuk pecinta parfum sejati.',
    examples: 'Mitsouko, Coco Mademoiselle, Aventus',
  },
];

export default function Home() {
  const fullText = 'Selamat Datang di "PerfumeSuggest"';
  const [displayText, setDisplayText] = useState('');
  const [done, setDone] = useState(false);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Typing effect — ketik sekali lalu berhenti
  useEffect(() => {
    if (displayText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(fullText.substring(0, displayText.length + 1));
      }, 80);
      return () => clearTimeout(timeout);
    } else {
      setDone(true);
    }
  }, [displayText]);

  // Scroll-triggered fade-in untuk kartu edukasi
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-idx'));
            setVisibleCards((prev) => new Set(prev).add(idx));
          }
        });
      },
      { threshold: 0.15 }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToEdukasi = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const elem = document.getElementById('edukasi');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-900 overflow-hidden">

      {/* Animated Background Blobs — Menutupi SELURUH halaman */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      </div>

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center z-10">
        <div className="text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              {displayText}
              {!done && <span className="animate-pulse border-r-4 border-purple-400 ml-1"></span>}
            </span>
          </h1>

          <p className={`mt-6 font-medium text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed transition-opacity duration-700 ${done ? 'opacity-100' : 'opacity-0'}`}>
            Kami menyediakan web ini untuk membantu kalian menemukan parfum yang cocok untuk Anda dan memberikan pengetahuan tentang parfum.
          </p>

          <div className={`mt-12 flex flex-col sm:flex-row gap-5 justify-center items-center transition-opacity duration-700 delay-300 ${done ? 'opacity-100' : 'opacity-0'}`}>
            <a href="#edukasi" onClick={scrollToEdukasi}
              className="w-full sm:w-auto px-8 py-4 bg-gray-800 bg-opacity-50 backdrop-blur-md border border-gray-600 text-white font-bold rounded-2xl hover:bg-gray-700 transition duration-300 shadow-[0_0_15px_rgba(255,255,255,0.1)] text-center group">
              Pelajari Tentang Parfum
            </a>

            <Link href="/rekomendasi"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-extrabold rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition duration-300 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] text-center transform hover:scale-105">
              Mulai Pencarian
            </Link>
          </div>

          {/* Animated scroll indicator */}
          <div className={`mt-16 transition-opacity duration-700 delay-500 ${done ? 'opacity-100' : 'opacity-0'}`}>
            <a href="#edukasi" onClick={scrollToEdukasi} className="inline-block animate-bounce">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* SECTION EDUKASI PARFUM */}
      <section id="edukasi" className="relative z-10 py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Ingin tahu lebih lanjut tentang parfum?</h2>
            <p className="mt-4 text-lg text-gray-400">Pahami anatomi wewangian sebelum Anda memutuskan membeli parfum idaman.</p>
          </div>

          <div className="space-y-12">
            {/* Card 1 */}
            <div
              ref={(el) => { cardRefs.current[0] = el; }}
              data-idx="0"
              className={`bg-gray-800 bg-opacity-60 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl border border-gray-700 transition-all duration-700 ${visibleCards.has(0) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            >
              <h3 className="text-2xl font-bold text-indigo-400 mb-4 flex items-center gap-3">
                <span>📖</span> Sejarah & Definisi
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Kata parfum berasal dari bahasa Latin <i>per fumum</i> yang berarti &quot;melalui asap&quot;. Selama ribuan tahun, manusia menggunakan campuran minyak esensial aromatik untuk menciptakan aroma tubuh yang memikat. Parfum modern tidak hanya sebagai pewangi, melainkan sebagai tanda pengenal (<i>signature scent</i>) karakter seseorang.
              </p>
            </div>

            {/* Card 2 */}
            <div
              ref={(el) => { cardRefs.current[1] = el; }}
              data-idx="1"
              className={`bg-gray-800 bg-opacity-60 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl border border-gray-700 transition-all duration-700 delay-150 ${visibleCards.has(1) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            >
              <h3 className="text-2xl font-bold text-purple-400 mb-6 flex items-center gap-3">
                <span>🧬</span> Teori S.P.L (Sillage, Projection, Longevity)
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-purple-900 bg-opacity-40 p-6 rounded-2xl border border-purple-800">
                  <h4 className="font-bold text-purple-200 text-lg mb-2">Sillage (Jejak)</h4>
                  <p className="text-gray-400 text-sm">Aroma tertinggal di udara saat Anda berjalan melewati seseorang. Jejak gaib yang membuat orang menoleh ke belakang.</p>
                </div>
                <div className="bg-blue-900 bg-opacity-40 p-6 rounded-2xl border border-blue-800">
                  <h4 className="font-bold text-blue-200 text-lg mb-2">Projection (Pancaran)</h4>
                  <p className="text-gray-400 text-sm">Sejauh apa radius parfum dapat tercium oleh orang lain ketika Anda sekadar berdiam diri atau duduk di ruangan.</p>
                </div>
                <div className="bg-indigo-900 bg-opacity-40 p-6 rounded-2xl border border-indigo-800">
                  <h4 className="font-bold text-indigo-200 text-lg mb-2">Longevity (Ketahanan)</h4>
                  <p className="text-gray-400 text-sm">Berapa lama aroma dapat bertahan menempel dan tercium pada kulit atau serat pakaian Anda sejak pertama kali disemprot.</p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div
              ref={(el) => { cardRefs.current[2] = el; }}
              data-idx="2"
              className={`bg-gray-800 bg-opacity-60 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl border border-gray-700 transition-all duration-700 delay-300 ${visibleCards.has(2) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            >
              <h3 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-3">
                <span>🧪</span> Piramida Aroma (Notes)
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg mb-4">
                Sebuah parfum berkelas memiliki 3 fase perubahan aroma ketika bersentuhan dengan udara dan suhu tubuh:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
                <li><strong className="text-gray-200">Top Notes:</strong> Kesan pertama, ringan, dan langsung menguap. (Berlangsung 15 menit pertama).</li>
                <li><strong className="text-gray-200">Middle (Heart) Notes:</strong> Karakter utama dari parfum. Aroma sebenarnya. (Berlangsung 1-4 jam).</li>
                <li><strong className="text-gray-200">Base Notes:</strong> Pondasi parfum yang mengunci aroma agar menempel lama di kulit. (Bertahan hingga seharian).</li>
              </ul>
            </div>

            {/* Card 4 — Konsentrasi Parfum */}
            <div
              ref={(el) => { cardRefs.current[3] = el; }}
              data-idx="3"
              className={`bg-gray-800 bg-opacity-60 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl border border-gray-700 transition-all duration-700 delay-[450ms] ${visibleCards.has(3) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            >
              <h3 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-3">
                <span>🧴</span> Konsentrasi Parfum (Kandungan Minyak &amp; Alkohol)
              </h3>
              <p className="text-gray-300 leading-relaxed text-base mb-6">
                Semua parfum pada dasarnya adalah campuran <strong className="text-white">minyak esensial aromatik</strong> yang dilarutkan dalam <strong className="text-white">alkohol</strong>. Semakin tinggi persentase minyak esensial, semakin pekat, tahan lama, dan mahal harga parfumnya.
              </p>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 bg-amber-900/20 border border-amber-700/40 rounded-2xl px-5 py-4">
                  <div className="flex-none pt-0.5">
                    <span className="inline-block bg-amber-500 text-black text-xs font-black px-3 py-1 rounded-full">20–40%</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-amber-300">Extrait de Parfum (Parfum / Pure Parfum)</p>
                    <p className="text-gray-400 text-sm mt-0.5">Konsentrasi tertinggi. Sangat sedikit alkohol. Aroma paling pekat, mewah, dan tahan lama hingga <strong className="text-gray-200">12+ jam</strong>. Umumnya diaplikasikan 1–2 semprotan saja. Harga tertinggi di kelasnya.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 bg-purple-900/20 border border-purple-700/40 rounded-2xl px-5 py-4">
                  <div className="flex-none pt-0.5">
                    <span className="inline-block bg-purple-500 text-white text-xs font-black px-3 py-1 rounded-full">15–20%</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-purple-300">Eau de Parfum (EDP)</p>
                    <p className="text-gray-400 text-sm mt-0.5">Konsentrasi tinggi yang paling populer di pasaran. Tahan lama <strong className="text-gray-200">6–10 jam</strong>. Keseimbangan sempurna antara ketahanan, proyeksi, dan harga. Cocok untuk sore &amp; malam hari.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 bg-blue-900/20 border border-blue-700/40 rounded-2xl px-5 py-4">
                  <div className="flex-none pt-0.5">
                    <span className="inline-block bg-blue-500 text-white text-xs font-black px-3 py-1 rounded-full">8–15%</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-blue-300">Eau de Toilette (EDT)</p>
                    <p className="text-gray-400 text-sm mt-0.5">Konsentrasi sedang. Ringan dan segar. Tahan lama <strong className="text-gray-200">3–6 jam</strong>. Cocok untuk aktivitas siang hari atau cuaca panas. Lebih terjangkau dari EDP.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 bg-cyan-900/20 border border-cyan-700/40 rounded-2xl px-5 py-4">
                  <div className="flex-none pt-0.5">
                    <span className="inline-block bg-cyan-500 text-black text-xs font-black px-3 py-1 rounded-full">3–8%</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-cyan-300">Eau de Cologne (EDC)</p>
                    <p className="text-gray-400 text-sm mt-0.5">Konsentrasi ringan. Alkohol sangat dominan. Tahan lama <strong className="text-gray-200">2–3 jam</strong>. Memberikan kesegaran singkat yang menyenangkan. Cocok untuk penggunaan santai sehari-hari.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 bg-teal-900/20 border border-teal-700/40 rounded-2xl px-5 py-4">
                  <div className="flex-none pt-0.5">
                    <span className="inline-block bg-teal-500 text-black text-xs font-black px-3 py-1 rounded-full">1–3%</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-teal-300">Eau Fraîche</p>
                    <p className="text-gray-400 text-sm mt-0.5">Konsentrasi paling ringan. Tahan lama <strong className="text-gray-200">1–2 jam</strong>. Lebih berfungsi seperti body mist untuk kesegaran sesaat. Kadar alkohol tertinggi dari semua kategori.</p>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-xs text-gray-500 italic text-center">
                💡 Tip: Parfum lokal Indonesia seperti HMNS &amp; Mykonos umumnya diproduksi dalam format <strong className="text-gray-400">Extrait de Parfum</strong> untuk memberikan daya tahan maksimal di harga yang kompetitif.
              </p>
            </div>

            {/* Card 5 — Accordion Keluarga Aroma */}
            <div
              ref={(el) => { cardRefs.current[4] = el; }}
              data-idx="4"
              className={`bg-gray-800 bg-opacity-60 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl border border-gray-700 transition-all duration-700 delay-[600ms] ${visibleCards.has(4) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            >
              <h3 className="text-2xl font-bold text-emerald-400 mb-2 flex items-center gap-3">
                <span>🌺</span> Keluarga Aroma (Olfactory Families)
              </h3>
              <p className="text-gray-400 mb-6 text-sm">Klik salah satu untuk mempelajari karakteristiknya.</p>

              <div className="space-y-3">
                {aromaFamilies.map((family, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden border border-gray-700/50">
                    {/* Accordion Header */}
                    <button
                      onClick={() => setOpenAccordion(openAccordion === idx ? null : idx)}
                      className={`w-full flex items-center justify-between px-5 py-4 text-left transition-all duration-300 ${openAccordion === idx
                          ? 'bg-gradient-to-r ' + family.color + ' border-b border-gray-700/50'
                          : 'bg-gray-700/30 hover:bg-gray-700/50'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{family.emoji}</span>
                        <span className="font-bold text-white">{family.name}</span>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openAccordion === idx ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Accordion Body */}
                    <div className={`overflow-hidden transition-all duration-300 ${openAccordion === idx ? 'max-h-60' : 'max-h-0'}`}>
                      <div className="px-5 py-4 bg-gray-800/40">
                        <p className="text-gray-300 text-sm leading-relaxed mb-3">{family.desc}</p>
                        <p className="text-xs text-gray-500">
                          <span className="text-indigo-400 font-semibold">Contoh parfum:</span> {family.examples}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
