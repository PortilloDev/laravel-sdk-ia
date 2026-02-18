<?php

namespace App\Http\Controllers;

use App\Http\Requests\OnboardingRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('onboarding');
    }

    public function store(OnboardingRequest $request): RedirectResponse
    {
        $request->user()->update([
            'book_preferences' => [
                'genres' => $request->validated('genres'),
                'notes' => $request->validated('notes'),
            ],
        ]);

        return redirect()->route('dashboard');
    }
}
