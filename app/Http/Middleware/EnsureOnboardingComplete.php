<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOnboardingComplete
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->book_preferences === null) {
            return redirect()->route('onboarding');
        }

        return $next($request);
    }
}
