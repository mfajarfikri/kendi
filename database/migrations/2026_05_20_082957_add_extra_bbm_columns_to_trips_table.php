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
        Schema::table('trips', function (Blueprint $table) {
            $table->dateTime('tanggal_pembelian_bbm')->nullable()->after('total_harga_bbm');
            $table->text('keterangan_bbm')->nullable()->after('tanggal_pembelian_bbm');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->dropColumn(['tanggal_pembelian_bbm', 'keterangan_bbm']);
        });
    }
};
