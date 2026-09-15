<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TamuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('tamus')->delete();

        DB::table('tamus')->insert(array(
            0 =>
            array(
                'id' => 1,
                'plat_kendaraan' => 'T 1765 KI',
                'waktu_kedatangan' => now(),
                'waktu_kepergian' => null,
                'foto_kedatangan' => '[]',
                'foto_kepergian' => null,
                'status' => 'New',
                'created_by' => null,
                'lokasi' => 'Karawang',
                'created_at' => now(),
                'updated_at' => now()
            ),
        ));
    }
}
