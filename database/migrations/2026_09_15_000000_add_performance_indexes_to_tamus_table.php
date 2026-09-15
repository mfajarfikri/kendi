<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambahkan index untuk kolom yang dipakai proses filter (lokasi/status)
     * dan pengurutan/rentang tanggal (waktu_kedatangan) pada tabel tamus.
     */
    public function up(): void
    {
        Schema::table('tamus', function (Blueprint $table) {
            $table->index('lokasi', 'tamus_lokasi_index');
            $table->index('status', 'tamus_status_index');
            $table->index('waktu_kedatangan', 'tamus_waktu_kedatangan_index');
        });
    }

    public function down(): void
    {
        Schema::table('tamus', function (Blueprint $table) {
            $table->dropIndex('tamus_lokasi_index');
            $table->dropIndex('tamus_status_index');
            $table->dropIndex('tamus_waktu_kedatangan_index');
        });
    }
};
