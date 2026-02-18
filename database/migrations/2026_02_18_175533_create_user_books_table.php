<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::ensureVectorExtensionExists();

        Schema::create('user_books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('author');
            $table->text('description');
            $table->text('reason')->nullable();
            $table->vector('embedding', dimensions: 1536)->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'title', 'author']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_books');
    }
};
