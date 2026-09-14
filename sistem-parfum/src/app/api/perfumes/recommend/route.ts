import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TopsisCalculationService, EvaluationMatrix } from '@/lib/topsis';

export const dynamic = 'force-dynamic';

/**
 * Hitung over-budget penalty score (0.0 – 1.0).
 * Penalti progresif berdasarkan persentase kelebihan harga dari budget:
 *  - ≤ 10% kelebihan  → penalti 15%   (masih bisa ditolerir)
 *  - 10–30% kelebihan → penalti 40%   (agak mahal)
 *  - 30–50% kelebihan → penalti 65%   (cukup mahal)
 *  - 50–100% kelebihan→ penalti 80%   (mahal)
 *  - > 100% kelebihan → penalti 92%   (jauh di luar budget)
 */
function calcBudgetPenalty(price: number, maxPrice: number): number {
    if (price <= maxPrice) return 0;

    const overshoot = (price - maxPrice) / maxPrice; // 0.1 = 10% lebih mahal

    if (overshoot <= 0.10) return 0.15;
    if (overshoot <= 0.30) return 0.40;
    if (overshoot <= 0.50) return 0.65;
    if (overshoot <= 1.00) return 0.80;
    return 0.92; // > 2x lipat dari budget
}

/**
 * Hitung in-budget boost multiplier (1.0 – 1.30).
 * Parfum yang harganya ≤ maxPrice mendapat kenaikan prioritas,
 * terutama yang mendekati nilai budget (lebih dimaksimalkan penggunaannya).
 */
function calcBudgetBoost(price: number, maxPrice: number): number {
    if (price > maxPrice) return 1.0; // tidak ada boost jika over-budget

    // Parfum semakin mendekati budget → boost lebih tinggi (ideal = 80-100% dari budget)
    const usageRatio = price / maxPrice; // 0 = gratis, 1.0 = tepat budget

    if (usageRatio >= 0.80) return 1.30; // 80–100% dari budget → boost +30%
    if (usageRatio >= 0.50) return 1.20; // 50–80% dari budget → boost +20%
    if (usageRatio >= 0.25) return 1.10; // 25–50% dari budget → boost +10%
    return 1.05; // < 25% dari budget → boost +5% (sangat murah, mungkin kurang)
}

/**
 * Hitung soft-penalty score (0.0 – 1.0) untuk kriteria non-harga.
 * 0.0 = tidak ada penalti (sesuai preferensi)
 * Makin besar = makin jauh dari preferensi
 */
function calcPreferencePenalty(params: {
    perfume: any;
    prefFamilies: string[];
    prefSillage: number | null;
    prefProjection: number | null;
    prefLongevity: number | null;
}): number {
    const { perfume, prefFamilies, prefSillage, prefProjection, prefLongevity } = params;
    let penalty = 0;

    // ─── Penalty Aroma (max 0.30) ───────────────────────────────────────────────
    if (prefFamilies.length > 0) {
        const famLower = (perfume.olfactory_family as string).toLowerCase();
        const matched = prefFamilies.some((f) => famLower.includes(f.toLowerCase()));
        if (!matched) penalty += 0.30;
    }

    // ─── Penalty Sillage (max 0.20) ─────────────────────────────────────────────
    if (prefSillage !== null) {
        const diff = Math.abs(prefSillage - Number(perfume.sillage));
        penalty += (diff / 4) * 0.20;
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

    return penalty; // total antara 0 – 0.90
}

/**
 * Hitung total penalty gabungan (budget + preferensi) untuk keperluan badge UI.
 */
function calcTotalPenaltyForBadge(params: {
    perfume: any;
    prefFamilies: string[];
    maxPrice: number | null;
    prefSillage: number | null;
    prefProjection: number | null;
    prefLongevity: number | null;
}): number {
    const { perfume, prefFamilies, maxPrice, prefSillage, prefProjection, prefLongevity } = params;
    
    const prefPenalty = calcPreferencePenalty({ perfume, prefFamilies, prefSillage, prefProjection, prefLongevity });
    const budgetPenaltyValue = maxPrice !== null ? calcBudgetPenalty(Number(perfume.price), maxPrice) : 0;
    
    // Gabungkan: budget penalty lebih dominan jika aktif
    return Math.min(prefPenalty + budgetPenaltyValue * 0.5, 1.0);
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
        // Jika user mengaktifkan budget, bobot harga dinaikkan secara proporsional
        // agar TOPSIS secara organik memfavoritkan parfum yang ramah kantong.
        let ahpWeights: Record<string, number>;
        if (maxPrice !== null) {
            // Budget aktif → naikkan bobot price, turunkan bobot performa secara proporsional
            ahpWeights = {
                projection: 0.28,
                longevity: 0.27,
                price:     0.35, // dari 0.16 → 0.35 saat budget aktif
                sillage:   0.10,
            };
        } else {
            // Default: bobot AHP tanpa pertimbangan budget
            ahpWeights = {
                projection: 0.38,
                longevity:  0.35,
                price:      0.16,
                sillage:    0.11,
            };
        }

        const criteriaTypes: Record<string, 'benefit' | 'cost'> = {
            sillage:    'benefit',
            projection: 'benefit',
            longevity:  'benefit',
            price:      'cost',
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

        // ─── 5. Terapkan Budget Penalty & Boost + Preference Penalty ke skor TOPSIS ─
        const prefPenaltyWeight = 0.70; // bobot penalti preferensi (aroma, sillage, dll.)

        const adjustedScores: Record<number, number> = {};
        for (const [idStr, rawScore] of Object.entries(rankings as Record<string, number>)) {
            const id = Number(idStr);
            const perfumeRecord = perfumes.find((p) => p.id === id)!;
            const price = Number(perfumeRecord.price);

            // Hitung penalti preferensi non-harga
            const prefPenalty = calcPreferencePenalty({
                perfume: perfumeRecord,
                prefFamilies,
                prefSillage,
                prefProjection,
                prefLongevity,
            });

            let score = (rawScore as number) * (1 - prefPenalty * prefPenaltyWeight);

            if (maxPrice !== null) {
                if (price > maxPrice) {
                    // ── Parfum Over-Budget: penalti progresif ──
                    const budgetPen = calcBudgetPenalty(price, maxPrice);
                    score = score * (1 - budgetPen);
                } else {
                    // ── Parfum In-Budget: berikan boost prioritas ──
                    const boost = calcBudgetBoost(price, maxPrice);
                    score = score * boost;
                }
            }

            adjustedScores[id] = score;
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
                const price = Number(perfumeRecord.price);

                // Hitung penalty gabungan untuk badge UI
                const totalPenaltyForBadge = calcTotalPenaltyForBadge({
                    perfume: perfumeRecord,
                    prefFamilies,
                    maxPrice,
                    prefSillage,
                    prefProjection,
                    prefLongevity,
                });

                // Parfum dianggap "cocok" jika: dalam budget (jika budget aktif) DAN penalti preferensi kecil
                const isWithinBudget = maxPrice === null || price <= maxPrice;
                const prefPenalty = calcPreferencePenalty({
                    perfume: perfumeRecord,
                    prefFamilies,
                    prefSillage,
                    prefProjection,
                    prefLongevity,
                });
                const matchesPreference = isWithinBudget && prefPenalty < 0.15;

                results.push({
                    rank: rankOrder++,
                    id: perfumeRecord.id,
                    name: perfumeRecord.name,
                    brand: perfumeRecord.brand,
                    olfactory_family: perfumeRecord.olfactory_family,
                    price,
                    sillage: Number(perfumeRecord.sillage),
                    projection: Number(perfumeRecord.projection),
                    longevity: Number(perfumeRecord.longevity),
                    score: adjustedScore,                           // skor setelah penalty+boost (untuk ranking)
                    rawScore: rawTopsisScore,                       // skor TOPSIS murni (untuk tampilan detail)
                    penalty: Math.round(totalPenaltyForBadge * 100), // % penalty gabungan (untuk badge)
                    matchesPreference,
                    withinBudget: isWithinBudget,                  // apakah parfum ada di dalam budget
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
