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

// Memetakan brand ke URL katalog resmi mereka
function getBrandCatalogUrl(brand: string): string {
  const b = brand.toLowerCase().trim();

  const catalogMap: Record<string, string> = {
    // International Brands
    'chanel': 'https://www.chanel.com/us/fragrance/',
    'dior': 'https://www.dior.com/en_us/beauty/fragrances',
    'christian dior': 'https://www.dior.com/en_us/beauty/fragrances',
    'gucci': 'https://www.gucci.com/us/en/ca/beauty/fragrance-c-beauty-fragrance',
    'tom ford': 'https://www.tomford.com/beauty/fragrance/',
    'versace': 'https://www.versace.com/us/en/men/fragrance/',
    'armani': 'https://www.armani.com/us/armanicom/beauty/fragrances/',
    'giorgio armani': 'https://www.armani.com/us/armanicom/beauty/fragrances/',
    'yves saint laurent': 'https://www.yslbeauty.com/fragrance/',
    'ysl': 'https://www.yslbeauty.com/fragrance/',
    'prada': 'https://www.prada.com/us/en/beauty/fragrances.html',
    'burberry': 'https://us.burberry.com/beauty/fragrance/',
    'hugo boss': 'https://www.hugoboss.com/us/fragrances/',
    'boss': 'https://www.hugoboss.com/us/fragrances/',
    'calvin klein': 'https://www.calvinklein.us/fragrance',
    'ck': 'https://www.calvinklein.us/fragrance',
    'dolce & gabbana': 'https://www.dolcegabbana.com/en/beauty/fragrance/',
    'd&g': 'https://www.dolcegabbana.com/en/beauty/fragrance/',
    'hermes': 'https://www.hermes.com/us/en/category/women/beauty-and-fragrance/fragrance/',
    'hermès': 'https://www.hermes.com/us/en/category/women/beauty-and-fragrance/fragrance/',
    'givenchy': 'https://www.givenchy.com/us/en-US/beauty/fragrances/',
    'lancome': 'https://www.lancome-usa.com/fragrance/',
    'lancôme': 'https://www.lancome-usa.com/fragrance/',
    'valentino': 'https://www.valentino.com/en-us/fragrances',
    'mont blanc': 'https://www.montblanc.com/en-us/fragrances.html',
    'montblanc': 'https://www.montblanc.com/en-us/fragrances.html',
    'mugler': 'https://www.mugler.com/us_en/fragrances',
    'thierry mugler': 'https://www.mugler.com/us_en/fragrances',
    'viktor & rolf': 'https://www.viktor-rolf.com/fragrance/',
    'narciso rodriguez': 'https://www.narcisorodriguez.com/pages/fragrance',
    'carolina herrera': 'https://www.carolinaherrera.com/us/en/fragrances/',
    'marc jacobs': 'https://www.marcjacobsfragrances.com/',
    'coach': 'https://www.coach.com/fragrances',
    'ralph lauren': 'https://www.ralphlauren.com/fragrances',
    'lacoste': 'https://www.lacoste.com/us/fragrance.html',
    'bvlgari': 'https://www.bulgari.com/en-us/world-of-bulgari/fragrances/',
    'bulgari': 'https://www.bulgari.com/en-us/world-of-bulgari/fragrances/',
    'cartier': 'https://www.cartier.com/en-us/fragrances.html',
    'davidoff': 'https://www.davidofffragrances.com/',
    'issey miyake': 'https://www.isseymiyake.com/en/brand/fragrance.html',
    'jean paul gaultier': 'https://www.jeanpaulgaultier.com/en/universe/fragrances',
    'kenzo': 'https://www.kenzo.com/en_US/fragrances.html',
    'loewe': 'https://www.loewe.com/int/en/fragrances/',
    'miu miu': 'https://www.miumiu.com/us/en/beauty/fragrances.html',
    'chloe': 'https://www.chloe.com/us/fragrances',
    'chloe': 'https://www.chloe.com/us/fragrances',
    'bottega veneta': 'https://www.bottegaveneta.com/en-us/beauty/fragrance',
    'ferragamo': 'https://www.ferragamo.com/us/en/parfum/',
    'salvatore ferragamo': 'https://www.ferragamo.com/us/en/parfum/',
    'azzaro': 'https://www.azzaro.com/en_INT/fragrance/',
    'joop': 'https://www.joop.com/en/fragrance/',
    'dunhill': 'https://www.dunhill.com/us/fragrances',
    // Local / Indonesia Brands
    'hmns': 'https://hmns.id/collections/perfume',
    'mykonos': 'https://www.mykonosfragrance.com/',
    // Niche / Designer
    'creed': 'https://www.creedboutique.com/collections/fragrances',
    'diptyque': 'https://www.diptyqueparis.com/en_us/c/fragrances.html',
    'jo malone': 'https://www.jomalone.com/fragrance',
    'maison margiela': 'https://www.maisonmargiela.com/en-us/replica-fragrance/',
  };

  // Exact match
  if (catalogMap[b]) return catalogMap[b];

  // Partial match
  for (const [key, url] of Object.entries(catalogMap)) {
    if (b.includes(key) || key.includes(b)) return url;
  }

  // Fallback: Google Search katalog brand
  return `https://www.google.com/search?q=${encodeURIComponent(brand + ' official perfume catalog')}`;
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
              {/* Info Parfum */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-lg leading-tight">{item.perfume.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{item.perfume.brand}</p>
                <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 rounded-full">
                  {item.perfume.olfactory_family}
                </span>
                <p className="text-gray-300 font-medium mt-2">Rp {item.perfume.price.toLocaleString('id-ID')}</p>
              </div>

              {/* Action Buttons: Keranjang + Hapus */}
              <div className="flex flex-col gap-1.5 items-center ml-4 shrink-0">
                {/* Tombol Keranjang — Katalog Resmi Brand */}
                <a
                  href={getBrandCatalogUrl(item.perfume.brand)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 transition-all duration-200 p-2 hover:bg-emerald-500/10 rounded-lg hover:scale-110"
                  title={`Lihat katalog resmi ${item.perfume.brand}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </a>

                {/* Tombol Hapus */}
                <button
                  onClick={() => removeFavorite(item.perfume.id)}
                  className="text-red-400 hover:text-red-300 transition-all duration-200 p-2 hover:bg-red-500/10 rounded-lg hover:scale-110"
                  title="Hapus dari favorit"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
