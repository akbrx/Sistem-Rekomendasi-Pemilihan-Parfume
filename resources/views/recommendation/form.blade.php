<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cari Rekomendasi Parfum</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-8 font-sans">
    <div class="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-lg mt-10">
        <h1 class="text-2xl font-bold text-gray-800 mb-6 text-center">Cari Parfum Idamanmu</h1>

        <!-- Session Error Alert -->
        @if(session('error'))
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                <strong class="font-bold">Oops!</strong>
                <span class="block sm:inline">{{ session('error') }}</span>
            </div>
        @endif

        <form action="{{ url('/rekomendasi/hasil') }}" method="POST">
            @csrf

            <!-- Dropdown Olfactory Family -->
            <div class="mb-5">
                <label for="olfactory_family" class="block text-gray-700 font-bold mb-2">Pilih Keluarga Aroma</label>
                <select name="olfactory_family" id="olfactory_family" class="shadow border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Semua Aroma</option>
                    @foreach($families as $family)
                        <option value="{{ $family }}">{{ $family }}</option>
                    @endforeach
                </select>
            </div>

            <!-- Input Max Price -->
            <div class="mb-5">
                <label for="max_price" class="block text-gray-700 font-bold mb-2">Budget Maksimal (Rp)</label>
                <input type="number" name="max_price" id="max_price" placeholder="Contoh: 500000" class="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <!-- Radio Button Min Longevity -->
            <div class="mb-8">
                <label class="block text-gray-700 font-bold mb-2">Minimal Ketahanan (Skala 1 - 5)</label>
                <div class="flex items-center space-x-6 mt-2">
                    <label class="inline-flex items-center cursor-pointer">
                        <input type="radio" name="min_longevity" value="1" class="form-radio h-5 w-5 text-blue-600">
                        <span class="ml-2 text-gray-700">1</span>
                    </label>
                    <label class="inline-flex items-center cursor-pointer">
                        <input type="radio" name="min_longevity" value="2" class="form-radio h-5 w-5 text-blue-600">
                        <span class="ml-2 text-gray-700">2</span>
                    </label>
                    <label class="inline-flex items-center cursor-pointer">
                        <input type="radio" name="min_longevity" value="3" class="form-radio h-5 w-5 text-blue-600">
                        <span class="ml-2 text-gray-700">3</span>
                    </label>
                    <label class="inline-flex items-center cursor-pointer">
                        <input type="radio" name="min_longevity" value="4" class="form-radio h-5 w-5 text-blue-600">
                        <span class="ml-2 text-gray-700">4</span>
                    </label>
                    <label class="inline-flex items-center cursor-pointer">
                        <input type="radio" name="min_longevity" value="5" class="form-radio h-5 w-5 text-blue-600">
                        <span class="ml-2 text-gray-700">5</span>
                    </label>
                </div>
            </div>

            <!-- Submit Button -->
            <div class="flex items-center justify-center">
                <button type="submit" class="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-150">
                    Cari Rekomendasi
                </button>
            </div>
        </form>
    </div>
</body>
</html>
