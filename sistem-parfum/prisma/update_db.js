const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    console.log('--- Memulai Proses Impor Data Parfum ---');

    // 1. Baca file CSV
    const csvPath = path.join(__dirname, '../../data parfum.csv');
    if (!fs.existsSync(csvPath)) {
        console.error('File data parfum.csv tidak ditemukan di:', csvPath);
        return;
    }

    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() !== '');

    // Header: Brand;Nama Parfum;Harga;Keluarga Aroma;Sillage;Projection;Longevity
    const [header, ...rows] = lines;

    const perfumesToInsert = [];

    for (const row of rows) {
        const columns = row.split(';');
        if (columns.length < 7) continue;

        let [brand, name, priceStr, familyRaw, sillageStr, projectionStr, longevityStr] = columns;

        // --- CLEANING ---
        
        // 1. Price
        const price = parseInt(priceStr.replace(/Rp|\./g, '')) || 0;

        // 2. Family (Hapus emoji - Pertahankan huruf dari bahasa apapun termasuk aksen seperti è)
        const family = familyRaw.replace(/[^\p{L}\s,/\-.]/gu, '').replace(/\s+/g, ' ').trim();

        // 3. Sillage Mapping (1-5)
        let sillage = 3;
        if (sillageStr.toLowerCase().includes('strong')) sillage = 5;
        if (sillageStr.toLowerCase().includes('medium-strong')) sillage = 4;
        if (sillageStr.toLowerCase().includes('medium')) sillage = 3;
        if (sillageStr.toLowerCase().includes('weak')) sillage = 1;

        // 4. Projection Mapping (1-5)
        let projection = 3;
        if (projectionStr.includes('3 m+')) projection = 5;
        if (projectionStr.includes('2-3 m')) projection = 4;
        if (projectionStr.includes('2 m') || projectionStr.includes('1.5-2.5 m')) projection = 3;
        if (projectionStr.includes('1.5 m') || projectionStr.includes('1-1.5 m')) projection = 2;
        if (projectionStr.includes('1 m')) projection = 1;

        // 5. Longevity Mapping (1-5)
        let longevity = 3;
        if (longevityStr.includes('12+') || longevityStr.includes('12 hours')) longevity = 5;
        if (longevityStr.includes('8-12') || longevityStr.includes('8-10') || longevityStr.includes('7-10')) longevity = 4;
        if (longevityStr.includes('6-8') || longevityStr.includes('5-7') || longevityStr.includes('6-7')) longevity = 3;
        if (longevityStr.includes('4-6') || longevityStr.includes('4-5') || longevityStr.includes('5-6')) longevity = 2;
        if (longevityStr.includes('2-3') || longevityStr.includes('2-4')) longevity = 1;

        perfumesToInsert.push({
            name,
            brand,
            olfactory_family: family,
            price: price,
            sillage: sillage,
            projection: projection,
            longevity: longevity
        });
    }

    try {
        // 2. Kosongkan database
        console.log('Menghapus data lama...');
        await prisma.perfumes.deleteMany({});

        // 3. Insert data baru
        console.log(`Mengimpor ${perfumesToInsert.length} data parfum baru...`);
        
        // Kita gunakan createMany jika didukung, jika tidak looping biasa
        await prisma.perfumes.createMany({
            data: perfumesToInsert
        });

        console.log('✅ Berhasil mengimpor data parfum baru!');
    } catch (e) {
        console.error('❌ Gagal mengimpor data:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
