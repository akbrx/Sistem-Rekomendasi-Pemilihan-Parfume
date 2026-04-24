import pandas as pd
import numpy as np

def calculate_full_topsis():
    # Read the cleaned data
    df = pd.read_csv('database/seeders/csv/parfume_cleaned.csv')
    
    # Kriteria
    criteria = ['sillage', 'projection', 'longevity', 'price']
    
    # 1. Hitung Pembagi (Divider) untuk setiap kriteria
    dividers = {}
    for col in criteria:
        # Nama kolom di CSV mungkin kapital
        col_name = col.capitalize() if col != 'price' else 'Harga'
        if col == 'sillage': col_name = 'Sillage'
        if col == 'projection': col_name = 'Projection'
        if col == 'longevity': col_name = 'Longevity'
        
        dividers[col] = np.sqrt(np.sum(df[col_name]**2))
        
    print("--- Normalization Factor (SQRT of SUMSQ) untuk 73 Data ---")
    for col, val in dividers.items():
        print(f"{col.capitalize()}: {val:.10f}")
        
    # 2. Normalisasi untuk parfum Alpha
    alpha = df[df['Nama Parfum'] == 'Alpha'].iloc[0]
    print("\n--- Normalisasi Parfum 'Alpha' (Data Mentah / Divider) ---")
    for col in criteria:
        col_name = col.capitalize() if col != 'price' else 'Harga'
        if col == 'sillage': col_name = 'Sillage'
        if col == 'projection': col_name = 'Projection'
        if col == 'longevity': col_name = 'Longevity'
        
        val = alpha[col_name]
        norm = val / dividers[col]
        print(f"{col.capitalize()} (Mentah: {val}): {norm:.10f}")

    # 3. Weighted Normalization
    weights = {'projection': 0.38, 'longevity': 0.35, 'price': 0.16, 'sillage': 0.11}
    print("\n--- Weighted Normalization 'Alpha' (Normalisasi * Bobot) ---")
    for col in criteria:
        col_name = col.capitalize() if col != 'price' else 'Harga'
        if col == 'sillage': col_name = 'Sillage'
        if col == 'projection': col_name = 'Projection'
        if col == 'longevity': col_name = 'Longevity'
        
        val = alpha[col_name]
        norm = val / dividers[col]
        weighted = norm * weights[col]
        print(f"{col.capitalize()} (Weight: {weights[col]}): {weighted:.10f}")

if __name__ == "__main__":
    calculate_full_topsis()
