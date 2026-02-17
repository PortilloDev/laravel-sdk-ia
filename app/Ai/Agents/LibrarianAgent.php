<?php

namespace App\Ai\Agents;


use Stringable;
use Laravel\Ai\Promptable;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Contracts\HasTools;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Temperature;

// #[Provider('openai')]            // Forzamos que use OpenAI
// #[Model('gpt-o3-mini')]             // Usamos el modelo inteligente para mejores recomendaciones
// #[Temperature(0.5)]              // Creatividad media (0 = robot, 1 = poeta loco)
class LibrarianAgent implements Agent, Conversational, HasTools, HasStructuredOutput
{
    use Promptable;

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return "You are an expert librarian with 40 years of experience. 
                Your job is to recommend books based on abstract tastes.
                Your recommendations should be masterpieces or hidden gems, avoiding obvious bestsellers.
                The summary should be captivating but accurate";
    }

    /**
     * Get the list of messages comprising the conversation so far.
     */
    public function messages(): iterable
    {
        return [];
    }

    /**
     * Get the tools available to the agent.
     *
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [];
    }

    /**
     * Get the agent's structured output schema definition.
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
