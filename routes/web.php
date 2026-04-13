<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RecommendationController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/rekomendasi', [RecommendationController::class, 'showForm']);
Route::post('/rekomendasi/hasil', [RecommendationController::class, 'calculate']);
