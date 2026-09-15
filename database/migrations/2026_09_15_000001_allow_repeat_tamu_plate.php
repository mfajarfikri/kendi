<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tamu dapat datang kembali menggunakan kendaraan yang sama,
     * sehingga plat_kendaraan tidak boleh unik. Index biasa tetap
     * dipertahankan agar pencarian plat tetap cepat.
     */
    public function up(): void
    {
        Schema::table('tamus', function (Blueprint $table) {
            $table->dropUnique('tamus_plat_kendaraan_unique');
            $table->index('plat_kendaraan', 'tamus_plat_kendaraan_index');
        });
    }

    public function down(): void
    {
        Schema::table('tamus', function (Blueprint $table) {
            $table->dropIndex('tamus_plat_kendaraan_index');
            $table->unique('plat_kendaraan', 'tamus_plat_kendaraan_unique');
        });
    }
};
