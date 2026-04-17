/**
 * Script migrasi data dari SQLite ke MySQL
 * Jalankan: node prisma/seed.js
 */

const { PrismaClient } = require('@prisma/client');
const Database = require('better-sqlite3');
const path = require('path');

async function main() {
  // Buka SQLite lama
  const sqlitePath = path.join(__dirname, 'database.sqlite');
  let db;
  try {
    db = new Database(sqlitePath, { readonly: true });
  } catch (e) {
    console.error('❌ File database.sqlite tidak ditemukan di folder prisma/');
    console.error('   Pastikan file database.sqlite ada di:', sqlitePath);
    process.exit(1);
  }

  // Koneksi ke MySQL (via Prisma)
  const prisma = new PrismaClient();

  try {
    // Baca semua parfum dari SQLite
    const perfumes = db.prepare('SELECT * FROM perfumes').all();
    console.log(`📦 Ditemukan ${perfumes.length} parfum di SQLite.`);

    if (perfumes.length === 0) {
      console.log('⚠️  Tidak ada data untuk dimigrasikan.');
      return;
    }

    // Insert ke MySQL satu per satu (agar aman jika ada error)
    let success = 0;
    for (const p of perfumes) {
      try {
        await prisma.perfumes.create({
          data: {
            name: p.name,
            brand: p.brand,
            sillage: p.sillage,
            projection: p.projection,
            longevity: p.longevity,
            price: p.price,
            olfactory_family: p.olfactory_family,
            created_at: p.created_at ? new Date(p.created_at) : new Date(),
            updated_at: p.updated_at ? new Date(p.updated_at) : new Date(),
          },
        });
        success++;
      } catch (e) {
        console.error(`⚠️  Gagal insert: ${p.name} — ${e.message}`);
      }
    }

    console.log(`✅ Berhasil memigrasikan ${success}/${perfumes.length} parfum ke MySQL!`);
  } finally {
    db.close();
    await prisma.$disconnect();
  }
}

main().catch(console.error);
