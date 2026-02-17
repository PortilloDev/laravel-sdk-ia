<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $guarded = [];

        protected $fillable = [
        'title',
        'author',
        'description',
        'embedding',
    ];

    protected function casts(): array
    {
        return [
            'embedding' => 'array', 
        ];
    }
}
