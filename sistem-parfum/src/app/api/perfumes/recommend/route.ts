import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TopsisCalculationService, EvaluationMatrix } from '@/lib/topsis';

export const dynamic = 'force-dynamic';


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
    const { perfume, prefFamilies, prefSillage, prefProjection, prefLongevity } = params;
    
    // Badge hanya mencerminkan ketidaksesuaian preferensi aroma/sillage/dll.
    // Budget sudah tercermin di ranking itu sendiri (via transformasi matriks TOPSIS).
    const prefPenalty = calcPreferencePenalty({ perfume, prefFamilies, prefSillage, prefProjection, prefLongevity });
    return Math.min(prefPenalty, 1.0);
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

        // ─── 1. Ambil SEMUA parfum dari database lalu pisahkan berdasarkan budget ──
        const allPerfumes = await prisma.perfumes.findMany();

        if (allPerfumes.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Database parfum kosong.' },
                { status: 404 }
            );
        }

        // Pisahkan: parfum dalam budget masuk TOPSIS utama,
        // parfum melebihi budget ditampilkan terpisah di bawah hasil.
        const perfumes      = maxPrice !== null ? allPerfumes.filter(p => Number(p.price) <= maxPrice) : allPerfumes;
        const overBudget    = maxPrice !== null ? allPerfumes.filter(p => Number(p.price) >  maxPrice) : [];

        // ─── 2. Setup Bobot AHP dan Tipe Kriteria ─────────────────────────────────
        // Bobot AHP bersifat KONSTAN — ditetapkan oleh pakar dan tidak pernah diubah
        // oleh sistem (termasuk saat budget aktif).
        // Penyesuaian budget ditangani di level transformasi matriks evaluasi (Langkah 3),
        // bukan di level bobot, sehingga integritas keputusan pakar tetap terjaga.
        const ahpWeights: Record<string, number> = {
            projection: 0.38,
            longevity:  0.35,
            price:      0.16,
            sillage:    0.11,
        };

        const criteriaTypes: Record<string, 'benefit' | 'cost'> = {
            sillage:    'benefit',
            projection: 'benefit',
            longevity:  'benefit',
            price:      'cost',
        };

        // ─── 3. Format Evaluation Matrix ──────────────────────────────────────────
        // Transformasi nilai diterapkan di level matriks — BUKAN di level bobot AHP.
        //
        // [A] Preferensi target (sillage / projection / longevity):
        //     Jika user memilih preferensi, nilai diubah menjadi skor kesesuaian:
        //     evaluatedValue = 5 - |preferensiUser - nilaiParfum|
        //     Parfum yang paling dekat ke target mendapat nilai tertinggi (5).
        //
        // [B] Harga: selalu menggunakan nilai asli (Rp) — tidak ada manipulasi.
        //     Filter budget ditangani dengan memisahkan parfum SEBELUM TOPSIS (Langkah 1),
        //     bukan dengan mengubah nilai atau bobot.

        /** Helper: buat evaluation matrix dari daftar parfum */
        const buildEvaluations = (list: typeof allPerfumes): EvaluationMatrix => {
            const ev: EvaluationMatrix = {};
            for (const p of list) {
                ev[p.id] = {
                    sillage: prefSillage !== null
                        ? (5 - Math.abs(prefSillage - Number(p.sillage)))
                        : Number(p.sillage),
                    projection: prefProjection !== null
                        ? (5 - Math.abs(prefProjection - Number(p.projection)))
                        : Number(p.projection),
                    longevity: prefLongevity !== null
                        ? (5 - Math.abs(prefLongevity - Number(p.longevity)))
                        : Number(p.longevity),
                    price: Number(p.price), // harga asli — tidak ditransformasi
                };
            }
            return ev;
        };

        const evaluations = buildEvaluations(perfumes);

        // ─── 4. Kalkulasi TOPSIS untuk parfum dalam budget ───────────────────────
        const topsisService = new TopsisCalculationService();
        let rankings: Record<string, number> = {};
        let steps: any = null;

        if (perfumes.length > 0) {
            const result = topsisService.calculate(evaluations, ahpWeights, criteriaTypes);
            rankings = result.rankings as Record<string, number>;
            steps = result.steps;
        }

        // ─── 4b. Kalkulasi TOPSIS terpisah untuk parfum over-budget ─────────────
        // (Digunakan untuk mengurutkan parfum over-budget di antara diri mereka sendiri)
        let overBudgetRankings: Record<string, number> = {};
        if (overBudget.length > 0) {
            const obEvaluations = buildEvaluations(overBudget);
            const obResult = topsisService.calculate(obEvaluations, ahpWeights, criteriaTypes);
            overBudgetRankings = obResult.rankings as Record<string, number>;
        }

        // ─── 5. Terapkan Preference Penalty (aroma family) ke skor TOPSIS ───────
        // Budget sudah ditangani di level filter (Langkah 1), bukan di post-processing.
        // Satu-satunya penyesuaian post-TOPSIS adalah soft-penalty untuk
        // ketidakcocokan aroma family (tidak bisa dimasukkan ke matriks numerik).
        const prefPenaltyWeight = 0.70;

        /** Helper: terapkan preference penalty ke raw TOPSIS scores */
        const applyPenalty = (
            rawRankings: Record<string, number>,
            perfumeList: typeof allPerfumes
        ): Record<number, number> => {
            const adjusted: Record<number, number> = {};
            for (const [idStr, rawScore] of Object.entries(rawRankings)) {
                const id = Number(idStr);
                const perfumeRecord = perfumeList.find(p => p.id === id)!;
                const prefPenalty = calcPreferencePenalty({
                    perfume: perfumeRecord,
                    prefFamilies,
                    prefSillage,
                    prefProjection,
                    prefLongevity,
                });
                adjusted[id] = (rawScore as number) * (1 - prefPenalty * prefPenaltyWeight);
            }
            return adjusted;
        };

        const adjustedScores    = applyPenalty(rankings, perfumes);
        const obAdjustedScores  = applyPenalty(overBudgetRankings, overBudget);


        // ─── 6. Sort berdasarkan adjusted score ──────────────────────────────────
        const sortedEntries   = Object.entries(adjustedScores).sort((a, b) => b[1] - a[1]);
        const obSortedEntries = Object.entries(obAdjustedScores).sort((a, b) => b[1] - a[1]);

        // Ambil 10 ID teratas (in-budget) untuk detail perhitungan
        const top10Ids = sortedEntries.slice(0, 10).map(([id]) => Number(id));

        // ─── 7. Bangun response rankings (in-budget) ─────────────────────────────
        const results = [];
        let rankOrder = 1;

        for (const [idStr, adjustedScore] of sortedEntries) {
            const id = Number(idStr);
            const perfumeRecord = perfumes.find((p) => p.id === id);
            const rawTopsisScore = rankings[idStr] || 0;

            if (perfumeRecord) {
                const prefPenalty = calcPreferencePenalty({
                    perfume: perfumeRecord,
                    prefFamilies,
                    prefSillage,
                    prefProjection,
                    prefLongevity,
                });
                const totalPenaltyForBadge = calcTotalPenaltyForBadge({
                    perfume: perfumeRecord,
                    prefFamilies,
                    maxPrice,
                    prefSillage,
                    prefProjection,
                    prefLongevity,
                });
                const matchesPreference = prefPenalty < 0.15;

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
                    score: adjustedScore,
                    rawScore: rawTopsisScore,
                    penalty: Math.round(totalPenaltyForBadge * 100),
                    matchesPreference,
                    withinBudget: true,
                });
            }
        }

        // ─── 7b. Bangun response overBudgetResults ───────────────────────────────
        const overBudgetResults = [];
        let obRankOrder = 1;

        for (const [idStr, adjustedScore] of obSortedEntries) {
            const id = Number(idStr);
            const perfumeRecord = overBudget.find((p) => p.id === id);
            const rawTopsisScore = overBudgetRankings[idStr] || 0;

            if (perfumeRecord) {
                const prefPenalty = calcPreferencePenalty({
                    perfume: perfumeRecord,
                    prefFamilies,
                    prefSillage,
                    prefProjection,
                    prefLongevity,
                });
                const totalPenaltyForBadge = calcTotalPenaltyForBadge({
                    perfume: perfumeRecord,
                    prefFamilies,
                    maxPrice,
                    prefSillage,
                    prefProjection,
                    prefLongevity,
                });
                const matchesPreference = prefPenalty < 0.15;

                overBudgetResults.push({
                    rank: obRankOrder++,
                    id: perfumeRecord.id,
                    name: perfumeRecord.name,
                    brand: perfumeRecord.brand,
                    olfactory_family: perfumeRecord.olfactory_family,
                    price: Number(perfumeRecord.price),
                    sillage: Number(perfumeRecord.sillage),
                    projection: Number(perfumeRecord.projection),
                    longevity: Number(perfumeRecord.longevity),
                    score: adjustedScore,
                    rawScore: rawTopsisScore,
                    penalty: Math.round(totalPenaltyForBadge * 100),
                    matchesPreference,
                    withinBudget: false,
                });
            }
        }

        // ─── 8. Filter steps untuk 10 teratas (in-budget) ───────────────────────
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
            overBudgetResults,
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
