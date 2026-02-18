<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecommendationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_recommendations(): void
    {
        $this->postJson(route('recommendations.store'), ['query' => 'ciencia ficción'])
            ->assertUnauthorized();
    }

    public function test_recommendations_require_a_query(): void
    {
        $user = User::factory()->withBookPreferences()->create();

        $this->actingAs($user)
            ->postJson(route('recommendations.store'), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['query']);
    }

    public function test_recommendations_require_query_to_be_at_least_3_characters(): void
    {
        $user = User::factory()->withBookPreferences()->create();

        $this->actingAs($user)
            ->postJson(route('recommendations.store'), ['query' => 'ab'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['query']);
    }

    public function test_recommendations_query_cannot_exceed_500_characters(): void
    {
        $user = User::factory()->withBookPreferences()->create();

        $this->actingAs($user)
            ->postJson(route('recommendations.store'), ['query' => str_repeat('a', 501)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['query']);
    }

    public function test_user_without_preferences_is_redirected_to_onboarding_from_recommendations(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('recommendations.store'), ['query' => 'ciencia ficción'])
            ->assertRedirect(route('onboarding'));
    }
}
