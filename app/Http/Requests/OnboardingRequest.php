<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OnboardingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'genres' => ['required', 'array', 'min:1'],
            'genres.*' => ['required', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'genres.required' => 'Debes seleccionar al menos un género.',
            'genres.min' => 'Debes seleccionar al menos un género.',
        ];
    }
}
