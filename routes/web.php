<?php

use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\UserBookController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('onboarding', [OnboardingController::class, 'show'])->name('onboarding');
    Route::post('onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');
});

Route::middleware(['auth', 'verified', 'onboarding'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard', [
            'bookPreferences' => auth()->user()->book_preferences,
        ]);
    })->name('dashboard');

    Route::get('recommendations/history', [RecommendationController::class, 'index'])->name('recommendations.history');
    Route::post('recommendations', [RecommendationController::class, 'store'])->name('recommendations.store');

    Route::get('my-library', [UserBookController::class, 'index'])->name('user-books.index');
    Route::post('my-library', [UserBookController::class, 'store'])->name('user-books.store');
    Route::delete('my-library/{userBook}', [UserBookController::class, 'destroy'])->name('user-books.destroy');
});

require __DIR__.'/settings.php';
