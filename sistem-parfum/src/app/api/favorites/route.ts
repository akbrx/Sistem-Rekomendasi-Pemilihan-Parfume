import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET — Ambil daftar favorit user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = Number((session.user as any).id);

  const favs = await prisma.favorites.findMany({
    where: { user_id: userId },
  });

  // Ambil data parfum terkait
  const perfumeIds = favs.map(f => f.perfume_id);
  const perfumes = await prisma.perfumes.findMany({
    where: { id: { in: perfumeIds } },
  });

  const results = favs.map(f => {
    const p = perfumes.find(p => p.id === f.perfume_id);
    return {
      favoriteId: f.id,
      perfume: p ? {
        id: p.id,
        name: p.name,
        brand: p.brand,
        olfactory_family: p.olfactory_family,
        price: Number(p.price),
      } : null,
    };
  }).filter(r => r.perfume !== null);

  return NextResponse.json({ success: true, favorites: results });
}

// POST — Tambah parfum ke favorit
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = Number((session.user as any).id);
  const { perfume_id } = await req.json();

  if (!perfume_id) {
    return NextResponse.json({ error: 'perfume_id required' }, { status: 400 });
  }

  try {
    const fav = await prisma.favorites.create({
      data: { user_id: userId, perfume_id: Number(perfume_id) },
    });
    return NextResponse.json({ success: true, favorite: fav });
  } catch (e: any) {
    // Duplicate
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Sudah ada di favorit.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// DELETE — Hapus parfum dari favorit
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = Number((session.user as any).id);
  const { perfume_id } = await req.json();

  await prisma.favorites.deleteMany({
    where: { user_id: userId, perfume_id: Number(perfume_id) },
  });

  return NextResponse.json({ success: true });
}
