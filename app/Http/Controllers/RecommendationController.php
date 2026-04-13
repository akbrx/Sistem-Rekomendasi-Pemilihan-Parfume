<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Perfume;
use App\Services\TopsisCalculationService;

class RecommendationController extends Controller
{
    public function showForm()
    {
        $families = Perfume::select('olfactory_family')->distinct()->pluck('olfactory_family');
        return view('recommendation.form', compact('families'));
    }

    public function calculate(Request $request, TopsisCalculationService $topsisService)
    {
        $query = Perfume::query();

        if ($request->filled('olfactory_family')) {
            $query->where('olfactory_family', $request->olfactory_family);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }
        if ($request->filled('min_longevity')) {
            $query->where('longevity', '>=', $request->min_longevity);
        }

        $perfumes = $query->get();
        
        if ($perfumes->isEmpty()) {
            return back()->with('error', 'Maaf, tidak ada parfum yang sesuai dengan kriteria budget dan aroma Anda.');
        }

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
                'sillage' => $perfume->sillage,
                'projection' => $perfume->projection,
                'longevity' => $perfume->longevity,
                'price' => $perfume->price,
            ];
        }

        // 5. Panggil TopsisCalculationService dan kalkulasi
        $rankings = $topsisService->calculate($evaluations, $ahpWeights, $criteriaTypes);

        // 6. Kirim hasil perankingan tersebut ke view bernama recommendation.index
        return view('recommendation.index', compact('rankings'));
    }
}
