<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistem Rekomendasi Parfum - AHP & TOPSIS</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-8 font-sans">
    <div class="max-w-6xl mx-auto">
        <div class="mb-8 text-center">
            <h1 class="text-3xl font-bold text-gray-800">Hasil Rekomendasi Parfum</h1>
            <p class="text-gray-600 mt-2">Berdasarkan perhitungan metode AHP & TOPSIS</p>
        </div>

        <div class="bg-white shadow-lg rounded-lg overflow-hidden">
            <table class="min-w-full leading-normal">
                <thead>
                    <tr>
                        <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-800 text-left text-xs font-semibold text-white uppercase tracking-wider">Rank</th>
                        <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-800 text-left text-xs font-semibold text-white uppercase tracking-wider">Nama Parfum</th>
                        <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-800 text-left text-xs font-semibold text-white uppercase tracking-wider">Brand</th>
                        <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-800 text-left text-xs font-semibold text-white uppercase tracking-wider">Keluarga Aroma</th>
                        <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-800 text-left text-xs font-semibold text-white uppercase tracking-wider">Harga</th>
                        <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-800 text-left text-xs font-semibold text-white uppercase tracking-wider">Skor Preferensi (Ci)</th>
                    </tr>
                </thead>
                <tbody>
                    @php $rank = 1; @endphp
                    @foreach($rankings as $id => $score)
                        @php
                            $perfume = \App\Models\Perfume::find($id);
                        @endphp
                        <tr class="{{ $rank == 1 ? 'bg-yellow-50' : 'bg-white' }} hover:bg-gray-50 transition duration-150">
                            <td class="px-5 py-4 border-b border-gray-200 text-sm">
                                <span class="font-bold {{ $rank == 1 ? 'text-yellow-600 text-lg' : 'text-gray-900' }}">
                                    @if($rank == 1) 🏆 @endif #{{ $rank }}
                                </span>
                            </td>
                            <td class="px-5 py-4 border-b border-gray-200 text-sm">
                                <p class="text-gray-900 font-semibold">{{ $perfume->name }}</p>
                            </td>
                            <td class="px-5 py-4 border-b border-gray-200 text-sm">
                                <p class="text-gray-600">{{ $perfume->brand }}</p>
                            </td>
                            <td class="px-5 py-4 border-b border-gray-200 text-sm">
                                <span class="relative inline-block px-3 py-1 font-semibold text-blue-900 leading-tight">
                                    <span aria-hidden class="absolute inset-0 bg-blue-200 opacity-50 rounded-full"></span>
                                    <span class="relative">{{ $perfume->olfactory_family }}</span>
                                </span>
                            </td>
                            <td class="px-5 py-4 border-b border-gray-200 text-sm">
                                <p class="text-gray-900">Rp {{ number_format($perfume->price, 0, ',', '.') }}</p>
                            </td>
                            <td class="px-5 py-4 border-b border-gray-200 text-sm">
                                <p class="text-gray-900 font-mono font-bold">{{ number_format($score, 4) }}</p>
                            </td>
                        </tr>
                        @php $rank++; @endphp
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
