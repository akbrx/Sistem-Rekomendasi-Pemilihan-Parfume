<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Perfume extends Model
{
    use HasFactory;
    
    // Mengizinkan semua kolom diisi kecuali ID
    protected $guarded = ['id'];
}
