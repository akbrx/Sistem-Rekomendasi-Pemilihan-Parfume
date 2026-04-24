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
            if (family.includes(' / ')) {
                const parts = family.split(' / ');
                whereClause.OR = parts.map(p => ({
                    olfactory_family: { contains: p }
                }));
            } else {
                whereClause.olfactory_family = { contains: family };
            }
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
            projection: 0.38,
            longevity: 0.35,
            price: 0.16,
            sillage: 0.11
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
        const { rankings, steps } = topsisService.calculate(evaluations, ahpWeights, criteriaTypes);

        // 5. Build responses
        const results = [];
        let rankOrder = 1;
        
        // Ambil 10 ID teratas untuk detail perhitungan
        const top10Ids = Object.keys(rankings).slice(0, 10).map(id => Number(id));

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

        // Filter steps agar hanya berisi 10 data teratas (menghemat bandwith)
        const filteredSteps = steps ? {
            normalizedMatrix: Object.fromEntries(Object.entries(steps.normalizedMatrix).filter(([id]) => top10Ids.includes(Number(id)))),
            weightedMatrix: Object.fromEntries(Object.entries(steps.weightedMatrix).filter(([id]) => top10Ids.includes(Number(id)))),
            idealSolutions: steps.idealSolutions,
            distances: Object.fromEntries(Object.entries(steps.distances).filter(([id]) => top10Ids.includes(Number(id)))),
            preferenceScores: Object.fromEntries(Object.entries(steps.preferenceScores).filter(([id]) => top10Ids.includes(Number(id))))
        } : null;

        return NextResponse.json({ 
            success: true, 
            rankings: results,
            calculationSteps: filteredSteps 
        });
        
    } catch (e: any) {
        console.error("Error TOPSIS Engine:", e);
        return NextResponse.json({ success: false, message: 'Terjadi kesalahan pada mesin AI Topsis Backend.' }, { status: 500 });
    }
}
