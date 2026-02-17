<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Book;
use Illuminate\Support\Str;

class BookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $libros = [
        [
            'title' => 'Dune',
            'author' => 'Frank Herbert',
            'description' => 'Una épica de ciencia ficción sobre política, religión y ecología en un planeta desértico con gusanos gigantes.',
        ],
        [
            'title' => 'El Señor de los Anillos',
            'author' => 'J.R.R. Tolkien',
            'description' => 'Un grupo de héroes emprende un viaje peligroso para destruir un anillo poderoso y salvar la Tierra Media de la oscuridad.',
        ],
        [
            'title' => 'Fundación',
            'author' => 'Isaac Asimov',
            'description' => 'Un matemático desarrolla una ciencia para predecir la caída de un imperio galáctico y reducir el tiempo de barbarie.',
        ],
    ];
    

    foreach ($libros as $libro) {
        $vector = Str::of($libro['description'])->toEmbeddings();


        Book::create([
            'title' => $libro['title'],
            'author' => $libro['author'],
            'description' => $libro['description'],
            'embedding' => $vector, 
        ]);
    }
    }
}
