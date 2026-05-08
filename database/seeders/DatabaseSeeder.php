<?php

namespace Database\Seeders;

use App\Models\Kendaraan;
use App\Models\Tamu;
use App\Models\Trip;
use App\Models\User;
use App\Models\Driver;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call([
           UserSeeder::class,
           DriverSeeder::class,
           KendaraanSeeder::class
        ]);

        Tamu::factory(10)->create();

        Trip::factory(200)->create([
            'kendaraan_id' => function() {
                return Kendaraan::inRandomOrder()->first()->id;
            },
            'driver_id' => function() {
                return Driver::inRandomOrder()->first()->id;
            },
            'lokasi' => function() {
                return User::where('role', 'admin')->whereIn('lokasi', ['Karawang', 'Purwakarta'])->inRandomOrder()->first()->lokasi ?? 'Karawang';
            }
        ]);
        // Kendaraan::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
    }
}
