<?php

namespace App\Http\Controllers;

use App\Ai\Agents\LibrarianAgent;
use App\Http\Requests\RecommendationRequest;
use App\Models\Recommendation;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class RecommendationController extends Controller
{
    public function index(): Response
    {
        $recommendations = request()->user()
            ->recommendations()
            ->limit(20)
            ->get(['id', 'query', 'response', 'created_at']);

        return Inertia::render('recommendations/history', [
            'recommendations' => $recommendations,
        ]);
    }

    public function store(RecommendationRequest $request): JsonResponse
    {
        $query = $request->validated('query');
        $queryHash = md5(mb_strtolower(trim($query)));
        $user = $request->user();

        $cached = Recommendation::query()
            ->where('user_id', $user->id)
            ->where('query_hash', $queryHash)
            ->first();

        if ($cached) {
            return response()->json([
                'recommendations' => $cached->response,
                'cached' => true,
            ]);
        }

        $response = (new LibrarianAgent($user->book_preferences))
            ->prompt(
                prompt: "Recommend books for someone who says: '{$query}'",
            );

        $recommendations = $response['recommendations'];

        Recommendation::create([
            'user_id' => $user->id,
            'query' => $query,
            'query_hash' => $queryHash,
            'response' => $recommendations,
        ]);

        return response()->json([
            'recommendations' => $recommendations,
            'cached' => false,
        ]);
    }
}
