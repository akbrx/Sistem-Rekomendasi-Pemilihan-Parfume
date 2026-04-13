<?php

namespace App\Services;

class TopsisCalculationService
{
    public function calculate(array $evaluations, array $weights, array $criteriaTypes)
    {
        $normalizedMatrix = $this->step1Normalize($evaluations);
        $weightedMatrix = $this->step2WeightedNormalization($normalizedMatrix, $weights);
        $idealSolutions = $this->step3IdealSolutions($weightedMatrix, $criteriaTypes);
        $distances = $this->step4CalculateDistances($weightedMatrix, $idealSolutions);
        $preferences = $this->step5CalculatePreference($distances);

        arsort($preferences); // Urutkan dari skor tertinggi
        return $preferences;
    }

    private function step1Normalize(array $evaluations)
    {
        $normalized = [];
        $divisors = [];
        
        foreach ($evaluations as $id => $criteriaValues) {
            foreach ($criteriaValues as $criterion => $value) {
                if (!isset($divisors[$criterion])) $divisors[$criterion] = 0;
                $divisors[$criterion] += pow($value, 2);
            }
        }
        
        foreach ($divisors as $criterion => $sum) {
            $divisors[$criterion] = sqrt($sum);
        }

        foreach ($evaluations as $id => $criteriaValues) {
            foreach ($criteriaValues as $criterion => $value) {
                $normalized[$id][$criterion] = $value / $divisors[$criterion];
            }
        }
        return $normalized;
    }

    private function step2WeightedNormalization(array $normalizedMatrix, array $weights)
    {
        $weighted = [];
        foreach ($normalizedMatrix as $id => $criteriaValues) {
            foreach ($criteriaValues as $criterion => $value) {
                $weighted[$id][$criterion] = $value * $weights[$criterion];
            }
        }
        return $weighted;
    }

    private function step3IdealSolutions(array $weightedMatrix, array $criteriaTypes)
    {
        $ideal = ['positive' => [], 'negative' => []];
        $criteriaList = array_keys(current($weightedMatrix));

        foreach ($criteriaList as $criterion) {
            $columnValues = array_column($weightedMatrix, $criterion);
            $type = $criteriaTypes[$criterion];

            if ($type === 'benefit') {
                $ideal['positive'][$criterion] = max($columnValues);
                $ideal['negative'][$criterion] = min($columnValues);
            } else { // cost
                $ideal['positive'][$criterion] = min($columnValues);
                $ideal['negative'][$criterion] = max($columnValues);
            }
        }
        return $ideal;
    }

    private function step4CalculateDistances(array $weightedMatrix, array $idealSolutions)
    {
        $distances = [];
        foreach ($weightedMatrix as $id => $criteriaValues) {
            $dPlus = 0;
            $dMinus = 0;
            foreach ($criteriaValues as $criterion => $value) {
                $dPlus += pow($value - $idealSolutions['positive'][$criterion], 2);
                $dMinus += pow($value - $idealSolutions['negative'][$criterion], 2);
            }
            $distances[$id]['D+'] = sqrt($dPlus);
            $distances[$id]['D-'] = sqrt($dMinus);
        }
        return $distances;
    }

    private function step5CalculatePreference(array $distances)
    {
        $preferences = [];
        foreach ($distances as $id => $d) {
            // Cegah division by zero
            $denominator = $d['D+'] + $d['D-'];
            $preferences[$id] = $denominator != 0 ? $d['D-'] / $denominator : 0;
        }
        return $preferences;
    }
}
