<?php


use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArticleController;

Route::get('/test', function () {
    return response()->json([
        'message' => 'Hello'
    ]);
});

Route::put('/test-put', function () {
    return response()->json(['message' => 'PUT works']);
});

Route::post('/article', [ArticleController::class, 'store']);
Route::get('/all', [ArticleController::class, 'index']);
Route::get('/article/{slug}', [ArticleController::class, 'show']);
Route::put('/article/{slug}', [ArticleController::class, 'update']);
Route::delete('/article/{slug}', [ArticleController::class, 'destroy']);