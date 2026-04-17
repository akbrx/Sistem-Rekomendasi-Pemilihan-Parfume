// frontend/src/lib/topsis.ts

export interface EvaluationMatrix {
    [id: number]: {
        sillage: number;
        projection: number;
        longevity: number;
        price: number;
        [key: string]: number; // opsional jika ada kriteria lain nantinya
    }
}

export interface Weights {
    [key: string]: number;
}

export interface CriteriaTypes {
    [key: string]: 'benefit' | 'cost';
}

export class TopsisCalculationService {
    calculate(evaluations: EvaluationMatrix, weights: Weights, criteriaTypes: CriteriaTypes) {
        if (Object.keys(evaluations).length === 0) return { rankings: {}, steps: null };

        const normalizedMatrix = this.step1Normalize(evaluations);
        const weightedMatrix = this.step2ApplyWeights(normalizedMatrix, weights);
        const idealSolutions = this.step3FindIdealSolutions(weightedMatrix, criteriaTypes);
        const distances = this.step4CalculateDistances(weightedMatrix, idealSolutions.positive, idealSolutions.negative);
        const preferenceScores = this.step5CalculatePreferences(distances);

        // Sort Descending (Terbesar ke Terkecil)
        const sortedRankings = Object.entries(preferenceScores)
            .sort(([, a], [, b]) => b - a)
            .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

        return {
            rankings: sortedRankings,
            steps: {
                normalizedMatrix,
                weightedMatrix,
                idealSolutions,
                distances,
                preferenceScores
            }
        };
    }

    private step1Normalize(evaluations: EvaluationMatrix) {
        const tempSumSquared: Record<string, number> = {};
        const criteriaKeys = Object.keys(Object.values(evaluations)[0] || {});

        // Hitung pembagi akar kuadrat per kriteria
        for (const criterion of criteriaKeys) {
            tempSumSquared[criterion] = 0;
            for (const id in evaluations) {
                tempSumSquared[criterion] += Math.pow(evaluations[id][criterion], 2);
            }
        }

        const normalizedMatrix: EvaluationMatrix = {};
        for (const id in evaluations) {
            normalizedMatrix[id] = {} as any;
            for (const criterion of criteriaKeys) {
                const divider = Math.sqrt(tempSumSquared[criterion]);
                normalizedMatrix[id][criterion] = divider === 0 ? 0 : evaluations[id][criterion] / divider;
            }
        }
        return normalizedMatrix;
    }

    private step2ApplyWeights(normalizedMatrix: EvaluationMatrix, weights: Weights) {
        const weightedMatrix: EvaluationMatrix = {};
        for (const id in normalizedMatrix) {
            weightedMatrix[id] = {} as any;
            for (const criterion in normalizedMatrix[id]) {
                weightedMatrix[id][criterion] = normalizedMatrix[id][criterion] * (weights[criterion] || 0);
            }
        }
        return weightedMatrix;
    }

    private step3FindIdealSolutions(weightedMatrix: EvaluationMatrix, criteriaTypes: CriteriaTypes) {
        const positiveIdeal: Record<string, number> = {};
        const negativeIdeal: Record<string, number> = {};

        const criteriaKeys = Object.keys(Object.values(weightedMatrix)[0] || {});

        for (const criterion of criteriaKeys) {
            const values = Object.values(weightedMatrix).map(row => row[criterion]);
            
            if (criteriaTypes[criterion] === 'benefit') {
                positiveIdeal[criterion] = Math.max(...values);
                negativeIdeal[criterion] = Math.min(...values);
            } else {
                positiveIdeal[criterion] = Math.min(...values);
                negativeIdeal[criterion] = Math.max(...values);
            }
        }

        return { positive: positiveIdeal, negative: negativeIdeal };
    }

    private step4CalculateDistances(weightedMatrix: EvaluationMatrix, positiveIdeal: Record<string, number>, negativeIdeal: Record<string, number>) {
        const distances: Record<number, { pos: number, neg: number }> = {};
        
        for (const idStr in weightedMatrix) {
            const id = Number(idStr);
            let dPos = 0;
            let dNeg = 0;
            
            for (const criterion in weightedMatrix[id]) {
                dPos += Math.pow(weightedMatrix[id][criterion] - positiveIdeal[criterion], 2);
                dNeg += Math.pow(weightedMatrix[id][criterion] - negativeIdeal[criterion], 2);
            }
            
            distances[id] = {
                pos: Math.sqrt(dPos),
                neg: Math.sqrt(dNeg)
            };
        }
        
        return distances;
    }

    private step5CalculatePreferences(distances: Record<number, { pos: number, neg: number }>) {
        const rankings: Record<number, number> = {};
        for (const id in distances) {
            const dPos = distances[id].pos;
            const dNeg = distances[id].neg;
            if (dPos + dNeg === 0) {
                rankings[id] = 0;
            } else {
                rankings[id] = dNeg / (dPos + dNeg);
            }
        }
        return rankings;
    }
}
