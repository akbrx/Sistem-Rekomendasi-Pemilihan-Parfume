import pandas as pd
import re
import os
import sys

def map_longevity(text):
    if pd.isna(text):
        return 3
    text = str(text).lower()
    nums = re.findall(r'\d+(?:\.\d+)?', text)
    if not nums:
        return 3
    nums = [float(n) for n in nums]
    avg = sum(nums) / len(nums)
    
    if avg < 4:
        return 1
    elif avg <= 6:
        return 2
    elif avg <= 8:
        return 3
    elif avg <= 10:
        return 4
    else:
        return 5

def map_projection(text):
    if pd.isna(text):
        return 3
    text = str(text).lower()
    nums = re.findall(r'\d+(?:\.\d+)?', text)
    if not nums:
        return 3
    nums = [float(n) for n in nums]
    avg = sum(nums) / len(nums)
    
    if avg < 1.0:
        return 1
    elif avg <= 1.5:
        return 2
    elif avg <= 2.0:
        return 3
    elif avg <= 3.0:
        return 4
    else:
        return 5

def map_sillage(text):
    if pd.isna(text):
        return 3
    text = str(text).lower()
    if 'strong' in text and 'medium' in text:
        return 4
    elif 'medium-strong' in text or 'medium to strong' in text:
        return 4
    elif 'strong' in text or 'loud' in text:
        return 5
    elif 'medium' in text:
        return 3
    elif 'soft' in text:
        return 2
    elif 'skin' in text or 'awal' in text:
        return 1
    else:
        return 3

def main():
    input_file = 'Parfume.csv'
    if not os.path.exists(input_file):
        print(f"Error: File '{input_file}' tidak ditemukan di direktori saat ini.")
        sys.exit(1)

    print("Membaca file CSV...")
    df = pd.read_csv(input_file, sep=';')

    # Buang kolom yang kosong (Unnamed)
    df = df.loc[:, ~df.columns.str.contains('^Unnamed')]

    # Bersihkan kolom Harga
    if 'Harga' in df.columns:
        print("Membersihkan kolom Harga...")
        df['Harga'] = df['Harga'].astype(str).str.replace('Rp', '', case=False)
        df['Harga'] = df['Harga'].str.replace(',', '')
        df['Harga'] = df['Harga'].str.replace(' ', '')
        df['Harga'] = df['Harga'].str.replace('-', '')
        df['Harga'] = pd.to_numeric(df['Harga'], errors='coerce').fillna(0).astype(int)

    # Transformasi Longevity
    if 'Longevity' in df.columns:
        print("Transformasi kolom Longevity...")
        df['Longevity'] = df['Longevity'].apply(map_longevity)

    # Transformasi Projection
    if 'Projection' in df.columns:
        print("Transformasi kolom Projection...")
        df['Projection'] = df['Projection'].apply(map_projection)

    # Transformasi Sillage
    if 'Sillage' in df.columns:
        print("Transformasi kolom Sillage...")
        df['Sillage'] = df['Sillage'].apply(map_sillage)

    # Simpan hasil akhir
    output_dir = os.path.join('database', 'seeders', 'csv')
    os.makedirs(output_dir, exist_ok=True)
    
    output_file = os.path.join(output_dir, 'parfume_cleaned.csv')
    df.to_csv(output_file, sep=',', index=False)
    print(f"Data berhasil dibersihkan dan disimpan ke {output_file}")

if __name__ == "__main__":
    main()
