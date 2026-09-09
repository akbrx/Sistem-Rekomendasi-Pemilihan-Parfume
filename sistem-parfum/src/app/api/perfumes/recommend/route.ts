import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TopsisCalculationService, EvaluationMatrix } from '@/lib/topsis';

export const dynamic = 'force-dynamic';

/**
 * Hitung soft-penalty score (0.0 – 1.0).
 * 0.0 = tidak ada penalti (sesuai preferensi)
 * Makin besar = makin jauh dari preferensi
 */
function calcPenalty(params: {
    perfume: any;
    prefFamilies: string[];
    maxPrice: number | null;
    prefSillage: number | null;
    prefProjection: number | null;
    prefLongevity: number | null;
}): number {
    const { perfume, prefFamilies, maxPrice, prefSillage, prefProjection, prefLongevity } = params;
    let penalty = 0;

    // ─── Penalty Aroma (max 0.30) ───────────────────────────────────────────────
    if (prefFamilies.length > 0) {
        const famLower = (perfume.olfactory_family as string).toLowerCase();
        const matched = prefFamilies.some((f) => famLower.includes(f.toLowerCase()));
        if (!matched) penalty += 0.30;
    }

    // ─── Penalty Budget (max 0.25) ──────────────────────────────────────────────
    if (maxPrice !== null) {
        const price = Number(perfume.price);
        if (price > maxPrice) {
            // Penalti proporsional, makin jauh dari budget makin besar (cap di 0.25)
            const overshoot = (price - maxPrice) / maxPrice; // ratio kelebihan
            penalty += Math.min(overshoot * 0.25, 0.25);
        }
    }

    // ─── Penalty Sillage (max 0.20) ─────────────────────────────────────────────
    if (prefSillage !== null) {
        const diff = Math.abs(prefSillage - Number(perfume.sillage)); // selisih absolut dari preferensi
        penalty += (diff / 4) * 0.20; // diff maks = 4 (mis. prefer 1, parfum=5)
    }

    // ─── Penalty Projection (max 0.20) ──────────────────────────────────────────
    if (prefProjection !== null) {
        const diff = Math.abs(prefProjection - Number(perfume.projection));
        penalty += (diff / 4) * 0.20;
    }

    // ─── Penalty Longevity (max 0.20) ───────────────────────────────────────────
    if (prefLongevity !== null) {
        const diff = Math.abs(prefLongevity - Number(perfume.longevity));
        penalty += (diff / 4) * 0.20;
    }

    return penalty; // total antara 0 – 1.0
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        // ─── Baca parameter dari form ──────────────────────────────────────────────
        const familiesRaw = formData.get('olfactory_families') as string | null;
        const prefFamilies: string[] = familiesRaw
            ? familiesRaw.split(',').map((s) => s.trim()).filter(Boolean)
            : [];

        const maxPrice = formData.get('max_price') ? Number(formData.get('max_price')) : null;
        const prefSillage = formData.get('pref_sillage') ? Number(formData.get('pref_sillage')) : null;
        const prefProjection = formData.get('pref_projection') ? Number(formData.get('pref_projection')) : null;
        const prefLongevity = formData.get('pref_longevity') ? Number(formData.get('pref_longevity')) : null;

        // ─── 1. Ambil SEMUA parfum dari database (tidak ada filter keras) ──────────
        const perfumes = await prisma.perfumes.findMany();

        if (perfumes.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Database parfum kosong.' },
                { status: 404 }
            );
        }

        // ─── 2. Setup Bobot AHP dan Tipe Kriteria ─────────────────────────────────
        const ahpWeights = {
            projection: 0.38,
            longevity: 0.35,
            price: 0.16,
            sillage: 0.11,
        };

        const criteriaTypes: Record<string, 'benefit' | 'cost'> = {
            sillage: 'benefit',
            projection: 'benefit',
            longevity: 'benefit',
            price: 'cost',
        };

        // ─── 3. Format Evaluation Matrix (Target-Matching berdasarkan preferensi pengguna) ───
        // Jika user memilih preferensi (misal prefSillage = 2), parfum yang paling mendekati target
        // akan mendapat nilai tertinggi (5 - selisih), sehingga otomatis menjadi Solusi Ideal Positif di TOPSIS.
        const evaluations: EvaluationMatrix = {};
        for (const p of perfumes) {
            evaluations[p.id] = {
                sillage: prefSillage !== null 
                    ? (5 - Math.abs(prefSillage - Number(p.sillage))) 
                    : Number(p.sillage),
                projection: prefProjection !== null 
                    ? (5 - Math.abs(prefProjection - Number(p.projection))) 
                    : Number(p.projection),
                longevity: prefLongevity !== null 
                    ? (5 - Math.abs(prefLongevity - Number(p.longevity))) 
                    : Number(p.longevity),
                price: Number(p.price),
            };
        }

        // ─── 4. Kalkulasi TOPSIS murni ────────────────────────────────────────────
        const topsisService = new TopsisCalculationService();
        const { rankings, steps } = topsisService.calculate(evaluations, ahpWeights, criteriaTypes);

        // ─── 5. Terapkan Soft-Penalty ke skor TOPSIS ─────────────────────────────
        const penaltyWeight = 0.85; // bobot penalti tinggi (0.85) agar parfum yang cocok dengan preferensi pengguna diprioritaskan di posisi teratas

        const adjustedScores: Record<number, number> = {};
        for (const [idStr, rawScore] of Object.entries(rankings as Record<string, number>)) {
            const id = Number(idStr);
            const perfumeRecord = perfumes.find((p) => p.id === id)!;

            const penalty = calcPenalty({
                perfume: perfumeRecord,
                prefFamilies,
                maxPrice,
                prefSillage,
                prefProjection,
                prefLongevity,
            });

            // Skor akhir = TOPSIS_score × (1 - penalty × penaltyWeight)
            adjustedScores[id] = (rawScore as number) * (1 - penalty * penaltyWeight);
        }

        // ─── 6. Sort berdasarkan adjusted score ──────────────────────────────────
        const sortedEntries = Object.entries(adjustedScores).sort((a, b) => b[1] - a[1]);

        // Ambil 10 ID teratas untuk detail perhitungan
        const top10Ids = sortedEntries.slice(0, 10).map(([id]) => Number(id));

        // ─── 7. Bangun response ───────────────────────────────────────────────────
        const results = [];
        let rankOrder = 1;

        for (const [idStr, adjustedScore] of sortedEntries) {
            const id = Number(idStr);
            const perfumeRecord = perfumes.find((p) => p.id === id);
            const rawTopsisScore = (rankings as Record<string, number>)[idStr] || 0;

            if (perfumeRecord) {
                // Tentukan apakah parfum ini "sesuai" preferensi (untuk badge UI)
                const penalty = calcPenalty({
                    perfume: perfumeRecord,
                    prefFamilies,
                    maxPrice,
                    prefSillage,
                    prefProjection,
                    prefLongevity,
                });

                results.push({
                    rank: rankOrder++,
                    id: perfumeRecord.id,
                    name: perfumeRecord.name,
                    brand: perfumeRecord.brand,
                    olfactory_family: perfumeRecord.olfactory_family,
                    price: Number(perfumeRecord.price),
                    sillage: Number(perfumeRecord.sillage),
                    projection: Number(perfumeRecord.projection),
                    longevity: Number(perfumeRecord.longevity),
                    score: adjustedScore,           // skor setelah penalty (untuk ranking)
                    rawScore: rawTopsisScore,       // skor TOPSIS murni (untuk tampilan detail)
                    penalty: Math.round(penalty * 100), // % penalty (untuk badge)
                    matchesPreference: penalty < 0.15,  // dianggap cocok jika penalti kecil
                });
            }
        }

        // ─── 8. Filter steps untuk 10 teratas ────────────────────────────────────
        const filteredSteps = steps
            ? {
                normalizedMatrix: Object.fromEntries(
                    Object.entries(steps.normalizedMatrix).filter(([id]) => top10Ids.includes(Number(id)))
                ),
                weightedMatrix: Object.fromEntries(
                    Object.entries(steps.weightedMatrix).filter(([id]) => top10Ids.includes(Number(id)))
                ),
                idealSolutions: steps.idealSolutions,
                distances: Object.fromEntries(
                    Object.entries(steps.distances).filter(([id]) => top10Ids.includes(Number(id)))
                ),
                preferenceScores: Object.fromEntries(
                    Object.entries(steps.preferenceScores).filter(([id]) => top10Ids.includes(Number(id)))
                ),
            }
            : null;

        return NextResponse.json({
            success: true,
            rankings: results,
            calculationSteps: filteredSteps,
            activeFilters: {
                families: prefFamilies,
                maxPrice,
                prefSillage,
                prefProjection,
                prefLongevity,
            },
        });
    } catch (e: any) {
        console.error('Error TOPSIS Engine:', e?.message, e?.stack);
        return NextResponse.json(
            { success: false, message: `Terjadi kesalahan: ${e?.message || 'Unknown error'}` },
            { status: 500 }
        );
    }
}
