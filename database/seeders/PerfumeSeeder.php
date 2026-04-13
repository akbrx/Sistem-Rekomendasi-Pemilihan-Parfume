<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PerfumeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $csvFile = database_path('seeders/csv/parfume_cleaned.csv');
        $file = fopen($csvFile, 'r');
        
        $firstLine = true;
        while (($data = fgetcsv($file, 1000, ',')) !== false) {
            if ($firstLine) {
                $firstLine = false;
                continue;
            }

            // Mencegah baris kosong atau data tidak lengkap masuk database
            if (count($data) < 7) {
                continue;
            }

            \App\Models\Perfume::create([
                'brand' => $data[0],
                'name' => $data[1],
                'price' => $data[2],
                'sillage' => $data[3],
                'projection' => $data[4],
                'longevity' => $data[5],
                'olfactory_family' => $data[6],
            ]);
        }
        
        fclose($file);
    }
}
