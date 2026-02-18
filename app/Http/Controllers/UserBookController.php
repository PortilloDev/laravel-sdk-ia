<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserBookRequest;
use App\Models\UserBook;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UserBookController extends Controller
{
    public function index(Request $request): Response
    {
        $userBooks = $request->user()
            ->userBooks()
            ->get(['id', 'title', 'author', 'description', 'reason', 'created_at']);

        return Inertia::render('user-books/index', [
            'userBooks' => $userBooks,
        ]);
    }

    public function store(StoreUserBookRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();

        $existing = UserBook::query()
            ->where('user_id', $user->id)
            ->where('title', $data['title'])
            ->where('author', $data['author'])
            ->first();

        if ($existing) {
            return response()->json(['userBook' => $existing, 'saved' => false], 200);
        }

        $embedding = Str::of($data['description'])->toEmbeddings();

        $userBook = UserBook::create([
            'user_id' => $user->id,
            'title' => $data['title'],
            'author' => $data['author'],
            'description' => $data['description'],
            'reason' => $data['reason'] ?? null,
            'embedding' => $embedding,
        ]);

        return response()->json(['userBook' => $userBook, 'saved' => true], 201);
    }

    public function destroy(Request $request, UserBook $userBook): JsonResponse
    {
        Gate::authorize('delete', $userBook);

        $userBook->delete();

        return response()->json(['deleted' => true]);
    }
}
