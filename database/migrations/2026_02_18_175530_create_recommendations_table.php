<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('query');
            $table->string('query_hash', 32)->index();
            $table->json('response');
            $table->timestamps();

            $table->unique(['user_id', 'query_hash']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recommendations');
    }
};
