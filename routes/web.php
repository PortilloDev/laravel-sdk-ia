<?php

use App\Models\Book;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Ai\Agents\LibrarianAgent;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


Route::get('/recomendar', function () {
    $gustosUsuario = "Me gustan las historias de ciencia ficción filosófica, tipo Blade Runner pero más optimista.";
    $libros = Cache::remember("reco_".md5($gustosUsuario), 60 * 60 * 24, function () use ($gustosUsuario) {
         $respuesta = (new LibrarianAgent)
         ->prompt(
               prompt: "Recommend books for someone who says: '$gustosUsuario'",
           );
        return $respuesta['recommendations']; 
   });


    return $libros;
});

/***
 * ¿Qué está pasando aquí?
*   1. Laravel toma tu frase ("Busco algo sobre...").
*   2. La envía a OpenAI para convertirla en un vector (automáticamente).
*   3. Le pide a PostgreSQL: "Dame los registros cuyos vectores estén matemáticamente cerca de este vector de búsqueda".
*   4. Debería devolverte Dune o Fundación, aunque no hayas escrito esos títulos.
 * 
 * 
 */
Route::get('/buscar-libro', function () {
    // Nota que no uso la palabra "Dune" ni "gusanos", sino conceptos relacionados.
    $consultaUsuario = "Busco algo sobre imperios en el espacio y política complicada";

    // Laravel 12 hace la búsqueda vectorial nativa con 'whereVectorSimilarTo'
    $resultados = Book::query()
        ->whereVectorSimilarTo('embedding', $consultaUsuario, minSimilarity: 0.5)
        ->limit(2)
        ->get();

    return $resultados;
});


require __DIR__.'/settings.php';
