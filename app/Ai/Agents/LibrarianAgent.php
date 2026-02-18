<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Promptable;
use Stringable;

class LibrarianAgent implements Agent, Conversational, HasStructuredOutput, HasTools
{
    use Promptable;

    /**
     * @param  array{genres?: string[], notes?: string}|null  $userPreferences
     */
    public function __construct(private readonly ?array $userPreferences = null) {}

    public function instructions(): Stringable|string
    {
        $base = 'You are an expert librarian with 40 years of experience.
Your job is to recommend books based on abstract tastes.
Your recommendations should be masterpieces or hidden gems, avoiding obvious bestsellers.
The summary should be captivating but accurate.';

        if (! empty($this->userPreferences)) {
            $genres = implode(', ', $this->userPreferences['genres'] ?? []);
            $notes = $this->userPreferences['notes'] ?? '';

            $base .= "\n\nThis user's reading preferences:";

            if ($genres) {
                $base .= "\n- Favourite genres: {$genres}";
            }

            if ($notes) {
                $base .= "\n- Additional notes: {$notes}";
            }

            $base .= "\n\nWeigh these preferences heavily when making recommendations.";
        }

        return $base;
    }

    public function messages(): iterable
    {
        return [];
    }

    /**
     * @return iterable<mixed>
     */
    public function tools(): iterable
    {
        return [];
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        $bookItem = $schema->object([
            'title' => $schema->string()->description('The exact title of the book')->required(),
            'author' => $schema->string()->description('Author name')->required(),
            'description' => $schema->string()->description('A brief synopsis (max. 300 characters) of the book')->required(),
            'reason' => $schema->string()->description('Why it fits with the user\'s request')->required(),
        ])->withoutAdditionalProperties();

        $recommendationsArray = $schema->array();
        $recommendationsArray->items($bookItem);
        $recommendationsArray->min(1);
        $recommendationsArray->max(3);
        $recommendationsArray->required();

        return [
            'recommendations' => $recommendationsArray,
        ];
    }
}
