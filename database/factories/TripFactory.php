<?php

namespace Database\Factories;

use App\Models\Driver;
use App\Models\Kendaraan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Trip>
 */
class TripFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $waktu_keberangkatan = fake()->dateTimeBetween('-1 month', 'now');
        $waktu_kembali = fake()->dateTimeBetween($waktu_keberangkatan, '+2 days');
        
        
        return [
            'code_trip' => fake()->unique()->regexify('[A-Za-z0-9]{10}'),
            'kendaraan_id' => Kendaraan::factory(),
            'driver_id' => Driver::factory(),
            'waktu_keberangkatan' => $waktu_keberangkatan,
            'waktu_kembali' => $waktu_kembali,
            'km_awal' => fake()->numberBetween(1000, 50000),
            'km_akhir' => function (array $attributes) {
                return $attributes['km_awal'] + fake()->numberBetween(10, 500);
            },
            'jarak' => function (array $attributes) {
                return $attributes['km_akhir'] - $attributes['km_awal'];
            },
            'tujuan' => fake()->city(),
            'status' => 'Selesai',
            'catatan' => fake()->optional()->text(200),
            'foto_berangkat' => "",
            'penumpang' => fake()->name(),
            'jenis_bbm' => fake()->randomElement(['Pertalite', 'Pertamax', 'Pertamina Dex', 'Dexlite']),
            'jumlah_liter' => fake()->randomFloat(2, 5, 60),
            'harga_per_liter' => fake()->randomElement([10000, 12950, 13700, 14500]),
            'total_harga_bbm' => function (array $attributes) {
                return $attributes['jumlah_liter'] * $attributes['harga_per_liter'];
            },
        ];
    }
}
