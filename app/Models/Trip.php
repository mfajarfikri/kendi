<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Trip extends Model
{
    

    /** @use HasFactory<\Database\Factories\TripFactory> */
    use HasFactory;

    protected $fillable = [
        'code_trip',
        'kendaraan_id',
        'driver_id',
        'waktu_keberangkatan',
        'waktu_kembali',
        'km_akhir',
        'tujuan',
        'status',
        'jarak',
        'catatan',
        'penumpang',
        'foto_berangkat',
        'foto_kembali',
    ];

    protected $casts = [
        'foto_berangkat' => 'array',
        'foto_kembali' => 'array',
        'waktu_keberangkatan' => 'datetime',
        'waktu_kembali' => 'datetime',
    ];

    public function kendaraan()
    {
        return $this->belongsTo(Kendaraan::class);
    }

    public function driver() {
        return $this->belongsTo(Driver::class);
    }
}
