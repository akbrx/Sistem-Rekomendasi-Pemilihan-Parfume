import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TopsisCalculationService, EvaluationMatrix } from '@/lib/topsis';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const family = formData.get('olfactory_family') as string;
        const maxPrice = formData.get('max_price') ? Number(formData.get('max_price')) : null;
        const minLongevity = formData.get('min_longevity') ? Number(formData.get('min_longevity')) : null;

        // 1. Ambil data dari database mematuhi filter
        const whereClause: any = {};
        if (family) {
            whereClause.olfactory_family = family;
        }
        if (maxPrice) {
            whereClause.price = { lte: maxPrice };
        }
        if (minLongevity) {
            whereClause.longevity = { gte: minLongevity };
        }

        const perfumes = await prisma.perfumes.findMany({
            where: whereClause
        });

        if (perfumes.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Maaf, tidak ada parfum yang sesuai dengan kriteria budget dan aroma Anda.'
            }, { status: 404 });
        }

        // 2. Setup Bobot dan Tipe Topsis
        const ahpWeights = {
            sillage: 0.2,
            projection: 0.2,
            longevity: 0.3,
            price: 0.3
        };

        const criteriaTypes: Record<string, 'benefit' | 'cost'> = {
            sillage: 'benefit',
            projection: 'benefit',
            longevity: 'benefit',
            price: 'cost',
        };

        // 3. Format Evaluation Matrix
        const evaluations: EvaluationMatrix = {};
        for (const p of perfumes) {
            evaluations[p.id] = {
                sillage: Number(p.sillage),
                projection: Number(p.projection),
                longevity: Number(p.longevity),
                price: Number(p.price)
            };
        }

        // 4. Kalkulasi TOPSIS
        const topsisService = new TopsisCalculationService();
        const rankings = topsisService.calculate(evaluations, ahpWeights, criteriaTypes);

        // 5. Build responses
        const results = [];
        let rankOrder = 1;
        for (const [idStr, score] of Object.entries(rankings)) {
            const id = Number(idStr);
            const perfumeRecord = perfumes.find((p: any) => p.id === id);
            if (perfumeRecord) {
                results.push({
                    rank: rankOrder++,
                    id: perfumeRecord.id,
                    name: perfumeRecord.name,
                    brand: perfumeRecord.brand,
                    olfactory_family: perfumeRecord.olfactory_family,
                    price: Number(perfumeRecord.price),
                    score: score
                });
            }
        }

        return NextResponse.json({ success: true, rankings: results });
        
    } catch (e: any) {
        console.error("Error TOPSIS Engine:", e);
        return NextResponse.json({ success: false, message: 'Terjadi kesalahan pada mesin AI Topsis Backend.' }, { status: 500 });
    }
}
