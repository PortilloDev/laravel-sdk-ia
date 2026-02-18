<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OnboardingTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login_from_onboarding(): void
    {
        $this->get(route('onboarding'))->assertRedirect(route('login'));
        $this->post(route('onboarding.store'))->assertRedirect(route('login'));
    }

    public function test_user_without_preferences_can_access_onboarding(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('onboarding'))
            ->assertOk();
    }

    public function test_user_with_preferences_is_redirected_away_from_onboarding_to_dashboard(): void
    {
        $user = User::factory()->withBookPreferences()->create();

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk();
    }

    public function test_onboarding_requires_at_least_one_genre(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('onboarding.store'), ['genres' => []])
            ->assertSessionHasErrors('genres');
    }

    public function test_onboarding_saves_preferences_and_redirects_to_dashboard(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('onboarding.store'), [
                'genres' => ['sci-fi', 'fantasy'],
                'notes' => 'Me gusta la ciencia ficción filosófica.',
            ])
            ->assertRedirect(route('dashboard'));

        $user->refresh();

        $this->assertNotNull($user->book_preferences);
        $this->assertEquals(['sci-fi', 'fantasy'], $user->book_preferences['genres']);
        $this->assertEquals('Me gusta la ciencia ficción filosófica.', $user->book_preferences['notes']);
    }

    public function test_onboarding_saves_preferences_without_optional_notes(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('onboarding.store'), [
                'genres' => ['mystery'],
            ])
            ->assertRedirect(route('dashboard'));

        $user->refresh();

        $this->assertEquals(['mystery'], $user->book_preferences['genres']);
    }

    public function test_user_without_preferences_is_redirected_to_onboarding_from_dashboard(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertRedirect(route('onboarding'));
    }
}
