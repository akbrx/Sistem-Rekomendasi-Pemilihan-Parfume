<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('perfumes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('brand');
            $table->integer('sillage');
            $table->integer('projection');
            $table->integer('longevity');
            $table->decimal('price', 15, 2);
            $table->string('olfactory_family');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('perfumes');
    }
};
