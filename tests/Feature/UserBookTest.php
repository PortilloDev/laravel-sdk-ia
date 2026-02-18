<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserBook;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class UserBookTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_user_books(): void
    {
        $this->get(route('user-books.index'))->assertRedirect(route('login'));
        $this->postJson(route('user-books.store'))->assertUnauthorized();
    }

    public function test_user_can_view_their_library(): void
    {
        $user = User::factory()->withBookPreferences()->create();

        $this->actingAs($user)
            ->get(route('user-books.index'))
            ->assertOk();
    }

    public function test_user_can_save_a_book(): void
    {
        Http::fake([
            'api.openai.com/*' => Http::response($this->fakeEmbeddingResponse(), 200),
        ]);

        $user = User::factory()->withBookPreferences()->create();

        $this->actingAs($user)
            ->postJson(route('user-books.store'), [
                'title' => 'Dune',
                'author' => 'Frank Herbert',
                'description' => 'Una épica de ciencia ficción sobre política y ecología.',
                'reason' => 'Porque te gusta la ciencia ficción filosófica.',
            ])
            ->assertStatus(201)
            ->assertJsonStructure(['userBook' => ['id', 'title', 'author'], 'saved']);

        $this->assertDatabaseHas('user_books', [
            'user_id' => $user->id,
            'title' => 'Dune',
            'author' => 'Frank Herbert',
        ]);
    }

    public function test_saving_a_book_twice_returns_existing_without_duplicate(): void
    {
        Http::fake([
            'api.openai.com/*' => Http::response($this->fakeEmbeddingResponse(), 200),
        ]);

        $user = User::factory()->withBookPreferences()->create();
        $bookData = [
            'title' => 'Dune',
            'author' => 'Frank Herbert',
            'description' => 'Una épica de ciencia ficción.',
            'reason' => null,
        ];

        $this->actingAs($user)->postJson(route('user-books.store'), $bookData)->assertStatus(201);
        $this->actingAs($user)->postJson(route('user-books.store'), $bookData)->assertStatus(200)
            ->assertJson(['saved' => false]);

        $this->assertDatabaseCount('user_books', 1);
    }

    /**
     * @return array<string, mixed>
     */
    private function fakeEmbeddingResponse(): array
    {
        return [
            'object' => 'list',
            'data' => [
                [
                    'object' => 'embedding',
                    'embedding' => array_fill(0, 1536, 0.1),
                    'index' => 0,
                ],
            ],
            'model' => 'text-embedding-3-small',
            'usage' => ['prompt_tokens' => 5, 'total_tokens' => 5],
        ];
    }

    public function test_user_can_delete_their_book(): void
    {
        $user = User::factory()->withBookPreferences()->create();
        $book = UserBook::factory()->for($user)->create();

        $this->actingAs($user)
            ->deleteJson(route('user-books.destroy', $book))
            ->assertOk()
            ->assertJson(['deleted' => true]);

        $this->assertDatabaseMissing('user_books', ['id' => $book->id]);
    }

    public function test_user_cannot_delete_another_users_book(): void
    {
        $owner = User::factory()->withBookPreferences()->create();
        $other = User::factory()->withBookPreferences()->create();
        $book = UserBook::factory()->for($owner)->create();

        $this->actingAs($other)
            ->deleteJson(route('user-books.destroy', $book))
            ->assertForbidden();

        $this->assertDatabaseHas('user_books', ['id' => $book->id]);
    }

    public function test_store_requires_title_author_and_description(): void
    {
        $user = User::factory()->withBookPreferences()->create();

        $this->actingAs($user)
            ->postJson(route('user-books.store'), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'author', 'description']);
    }
}
