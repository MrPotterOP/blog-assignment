<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreArticleRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'content' => 'required|string',
            'cover_image' => 'nullable|url',
            'source_original_url' => 'nullable|url',
            'source_references' => 'nullable|array',
            'source_references.*' => 'url',
            'author' => 'nullable|string',
            'published_at' => 'nullable|date',
        ];
    }
}