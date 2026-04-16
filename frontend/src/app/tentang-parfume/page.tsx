import Link from 'next/link';

export default function About() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center p-12 bg-white shadow-xl rounded-3xl border border-gray-100 max-w-lg mx-auto relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-yellow-50 rounded-full opacity-60 blur-xl"></div>
        <div className="relative z-10">
          <div className="mb-6 flex justify-center">
            <span className="text-7xl drop-shadow-sm">🚧</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800 mb-4 tracking-tight">Halaman sedang tahap pengembangan</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">Nantinya kami akan menyajikan kumpulan informasi komprehensif terkait serba serbi Parfum di halaman ini.</p>
          <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-bold transition group">
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">&larr;</span> Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
