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
        Schema::create('trips', function (Blueprint $table) {
            $table->id();
            $table->string('code_trip')->unique();
            $table->foreignId('kendaraan_id')->constrained('kendaraans')->onDelete('cascade');
            $table->dateTime('waktu_keberangkatan');
            $table->dateTime('waktu_kembali')->nullable();
            $table->string('tujuan');
            $table->enum('status', ['Sedang Berjalan', 'Selesai', 'Dibatalkan'])->default('Sedang Berjalan');
            $table->integer('jarak')->nullable();
            $table->text('catatan')->nullable();
            $table->text('catatan_kembali')->nullable();
            $table->json('photos')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};
