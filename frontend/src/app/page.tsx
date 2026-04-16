import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 animate-fade-in-up">
      <div className="text-center bg-white rounded-3xl shadow-xl overflow-hidden py-16 px-6 sm:px-12 md:px-20 relative border border-gray-100">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-72 h-72 bg-indigo-50 rounded-full opacity-60 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-blue-50 rounded-full opacity-60 blur-3xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
            Selamat Datang di <br className="hidden md:block" />
            <span className="text-indigo-600 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">Sistem Rekomendasi Parfum Terbaik</span>
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-3xl mx-auto mb-10 leading-relaxed">
            Kami hadir untuk membantu Anda menemukan karakteristik wewangian yang merepresentasikan diri Anda melalui metode saintifik <strong className="text-gray-700">AHP (Analytical Hierarchy Process)</strong> dan <strong className="text-gray-700">TOPSIS</strong>—memastikan akurasi tinggi sesuai dengan pertimbangan budget, ketahanan aroma, unjuk pancaran, hingga sillage-nya.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/tentang-parfume" 
               className="w-full sm:w-auto px-8 py-3.5 border-2 border-indigo-600 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition duration-300 shadow-sm text-center">
                Pelajari Tentang Parfum
            </Link>
            
            <Link href="/rekomendasi" 
               className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition duration-300 shadow-lg hover:shadow-indigo-500/30 text-center">
                Mulai Cari Parfum Mu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
