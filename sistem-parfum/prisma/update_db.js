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

        // Helper function matching Python clean_data.py logic
        const getAvg = (text) => {
            const nums = text.match(/\d+(?:\.\d+)?/g);
            if (!nums) return null;
            const values = nums.map(Number);
            return values.reduce((a, b) => a + b, 0) / values.length;
        };

        // 3. Sillage Mapping (1-5) - Matching map_sillage in clean_data.py
        let sillage = 3;
        const sLower = sillageStr.toLowerCase();
        if (sLower.includes('strong') && sLower.includes('medium')) sillage = 4;
        else if (sLower.includes('medium-strong') || sLower.includes('medium to strong')) sillage = 4;
        else if (sLower.includes('strong') || sLower.includes('loud')) sillage = 5;
        else if (sLower.includes('medium')) sillage = 3;
        else if (sLower.includes('soft')) sillage = 2;
        else if (sLower.includes('skin') || sLower.includes('awal')) sillage = 1;

        // 4. Projection Mapping (1-5) - Matching map_projection (avg-based)
        let projection = 3;
        const projAvg = getAvg(projectionStr);
        if (projAvg !== null) {
            if (projAvg < 1.0) projection = 1;
            else if (projAvg <= 1.5) projection = 2;
            else if (projAvg <= 2.0) projection = 3;
            else if (projAvg <= 3.0) projection = 4;
            else projection = 5;
        }

        // 5. Longevity Mapping (1-5) - Matching map_longevity (avg-based)
        let longevity = 3;
        const longAvg = getAvg(longevityStr);
        if (longAvg !== null) {
            if (longAvg < 4) longevity = 1;
            else if (longAvg <= 6) longevity = 2;
            else if (longAvg <= 8) longevity = 3;
            else if (longAvg <= 10) longevity = 4;
            else longevity = 5;
        }

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
