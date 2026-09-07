import pandas as pd
import math

# ============================================================
# LOAD DATA (73 alternatif dari parfume_cleaned.csv)
# ============================================================
df = pd.read_csv(r'd:\Sistem Rekomendasi Pemilihan Parfume\database\seeders\csv\parfume_cleaned.csv')
df = df.dropna(subset=['Nama Parfum'])
df = df[df['Nama Parfum'].str.strip() != '']
df = df.reset_index(drop=True)

print(f"Total data: {len(df)} alternatif\n")

# Urutan kolom sesuai topsis.ts: sillage, projection, longevity, price
# Key mapping: sillage=Sillage, projection=Projection, longevity=Longevity, price=Harga
criteria = ['Sillage', 'Projection', 'Longevity', 'Harga']
criteria_keys = ['sillage', 'projection', 'longevity', 'price']

# Bobot AHP (W)
weights = {
    'sillage':    0.11,
    'projection': 0.38,
    'longevity':  0.35,
    'price':      0.16
}

# Tipe kriteria
criteria_types = {
    'sillage':    'benefit',
    'projection': 'benefit',
    'longevity':  'benefit',
    'price':      'cost'
}

col_map = {
    'sillage':    'Sillage',
    'projection': 'Projection',
    'longevity':  'Longevity',
    'price':      'Harga'
}

# ============================================================
# STEP 1: Matriks Keputusan (X) – nilai mentah
# ============================================================
X = {}
for i, row in df.iterrows():
    idx = i + 1  # 1-indexed ID sesuai DB
    X[idx] = {
        'sillage':    float(row['Sillage']),
        'projection': float(row['Projection']),
        'longevity':  float(row['Longevity']),
        'price':      float(row['Harga'])
    }

# ============================================================
# STEP 2: Normalisasi (R) – Euclidean norm per kolom (semua 73 data)
# ============================================================
sum_sq = {k: 0.0 for k in criteria_keys}
for idx in X:
    for k in criteria_keys:
        sum_sq[k] += X[idx][k] ** 2

dividers = {k: math.sqrt(sum_sq[k]) for k in criteria_keys}

print("=== AKAR KUADRAT PEMBAGI (Euclidean Norm) dari 73 data ===")
for k in criteria_keys:
    print(f"  {k}: sqrt({sum_sq[k]:.4f}) = {dividers[k]:.6f}")
print()

R = {}
for idx in X:
    R[idx] = {}
    for k in criteria_keys:
        R[idx][k] = X[idx][k] / dividers[k] if dividers[k] != 0 else 0.0

# ============================================================
# STEP 3: Matriks Normalisasi Terbobot (Y)
# ============================================================
Y = {}
for idx in R:
    Y[idx] = {}
    for k in criteria_keys:
        Y[idx][k] = R[idx][k] * weights[k]

# ============================================================
# STEP 4: Solusi Ideal Positif (A+) dan Negatif (A-)
# ============================================================
A_pos = {}
A_neg = {}
for k in criteria_keys:
    vals = [Y[idx][k] for idx in Y]
    if criteria_types[k] == 'benefit':
        A_pos[k] = max(vals)
        A_neg[k] = min(vals)
    else:  # cost
        A_pos[k] = min(vals)
        A_neg[k] = max(vals)

print("=== SOLUSI IDEAL GLOBAL (A+ dan A-) dari 73 data ===")
for k in criteria_keys:
    print(f"  {k}: A+ = {A_pos[k]:.6f} | A- = {A_neg[k]:.6f}")
print()

# ============================================================
# STEP 5: Jarak D+ dan D-
# ============================================================
D = {}
for idx in Y:
    dpos = math.sqrt(sum((Y[idx][k] - A_pos[k])**2 for k in criteria_keys))
    dneg = math.sqrt(sum((Y[idx][k] - A_neg[k])**2 for k in criteria_keys))
    D[idx] = {'pos': dpos, 'neg': dneg}

# ============================================================
# STEP 6: Nilai Preferensi V
# ============================================================
V = {}
for idx in D:
    dpos = D[idx]['pos']
    dneg = D[idx]['neg']
    V[idx] = dneg / (dpos + dneg) if (dpos + dneg) != 0 else 0.0

# ============================================================
# RANKING
# ============================================================
ranked = sorted(V.items(), key=lambda x: x[1], reverse=True)

print("=== RANKING LENGKAP (Top 5 dan Terakhir) ===")
for rank, (idx, v) in enumerate(ranked, 1):
    row = df.iloc[idx - 1]
    print(f"  Rank {rank:2d}: [{idx:2d}] {row['Nama Parfum'][:35]:<35} V={v:.6f}")

print()

# Identifikasi 5 alternatif yang diperlukan
rank1_idx = ranked[0][0]
rank2_idx = ranked[1][0]
rank3_idx = ranked[2][0]
rank4_idx = ranked[3][0]
rank73_idx = ranked[72][0]

target_ranks = {
    1: rank1_idx,
    2: rank2_idx,
    3: rank3_idx,
    4: rank4_idx,
    73: rank73_idx
}

# ============================================================
# OUTPUT DETAIL PER 5 ALTERNATIF
# ============================================================
print("=" * 80)
print("DETAIL PERHITUNGAN TOPSIS - 5 ALTERNATIF TERPILIH")
print("=" * 80)

print(f"\nBobot W: Sillage={weights['sillage']}, Projection={weights['projection']}, Longevity={weights['longevity']}, Harga={weights['price']}")
print(f"Tipe  : Sillage=Benefit, Projection=Benefit, Longevity=Benefit, Harga=Cost")
print()

for rank_no, idx in target_ranks.items():
    row = df.iloc[idx - 1]
    name = row['Nama Parfum']
    brand = row['Brand']
    print(f"--- PERINGKAT {rank_no}: {brand} – {name} (ID={idx}) ---")
    
    print(f"  [X]  Matriks Keputusan (nilai mentah):")
    print(f"       Sillage={X[idx]['sillage']:.4f}  Projection={X[idx]['projection']:.4f}  Longevity={X[idx]['longevity']:.4f}  Harga={X[idx]['price']:.4f}")
    
    print(f"  [R]  Matriks Ternormalisasi (xi / sqrt_sum):")
    print(f"       Sillage={R[idx]['sillage']:.6f}  Projection={R[idx]['projection']:.6f}  Longevity={R[idx]['longevity']:.6f}  Harga={R[idx]['price']:.6f}")
    
    print(f"  [Y]  Matriks Normalisasi Terbobot (R * W):")
    print(f"       Sillage={Y[idx]['sillage']:.6f}  Projection={Y[idx]['projection']:.6f}  Longevity={Y[idx]['longevity']:.6f}  Harga={Y[idx]['price']:.6f}")
    
    print(f"  [D]  Jarak Ideal:")
    print(f"       D+ = {D[idx]['pos']:.6f}   D- = {D[idx]['neg']:.6f}")
    
    print(f"  [V]  Nilai Preferensi:")
    print(f"       V  = {V[idx]:.6f}")
    print()

print("\n=== RINGKASAN SOLUSI IDEAL (4 desimal) ===")
print(f"  A+: sillage={A_pos['sillage']:.4f}  projection={A_pos['projection']:.4f}  longevity={A_pos['longevity']:.4f}  price={A_pos['price']:.4f}")
print(f"  A-: sillage={A_neg['sillage']:.4f}  projection={A_neg['projection']:.4f}  longevity={A_neg['longevity']:.4f}  price={A_neg['price']:.4f}")

print("\n=== SUM OF SQUARES dan DIVIDERS ===")
for k in criteria_keys:
    print(f"  {k}: sum_sq={sum_sq[k]:.2f}  divider={dividers[k]:.6f}")
