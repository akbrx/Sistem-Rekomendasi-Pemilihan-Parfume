<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Perfume;
use App\Services\TopsisCalculationService;

class RecommendationController extends Controller
{
    public function index(TopsisCalculationService $topsisService)
    {
        // 1. Ambil seluruh data parfum dari database
        $perfumes = Perfume::all();

        // 2. Bobot statis sementara (total 1)
        $ahpWeights = [
            'sillage' => 0.2,
            'projection' => 0.2,
            'longevity' => 0.3,
            'price' => 0.3
        ];

        // 3. Tipe kriteria (cost vs benefit)
        $criteriaTypes = [
            'sillage' => 'benefit',
            'projection' => 'benefit',
            'longevity' => 'benefit',
            'price' => 'cost'
        ];

        // 4. Format data dari database menjadi array assosiatif
        $evaluations = [];
        foreach ($perfumes as $perfume) {
            $evaluations[$perfume->id] = [
                // Fallback untuk property baik dia uppercase (seperti csv) atau lowercase standar laravel
                'sillage' => $perfume->Sillage ?? $perfume->sillage,
                'projection' => $perfume->Projection ?? $perfume->projection,
                'longevity' => $perfume->Longevity ?? $perfume->longevity,
                'price' => $perfume->Harga ?? $perfume->harga ?? $perfume->price,
            ];
        }

        // 5. Panggil TopsisCalculationService dan kalkulasi
        $rankings = $topsisService->calculate($evaluations, $ahpWeights, $criteriaTypes);

        // 6. Kirim hasil perankingan tersebut ke view bernama recommendation.index
        return view('recommendation.index', compact('rankings'));
    }
}
