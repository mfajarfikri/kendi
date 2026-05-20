<?php

namespace App\Models;
use App\Models\BbmEditLog;
use App\Models\User;
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
        'km_awal',
        'km_akhir',
        'tujuan',
        'status',
        'jarak',
        'catatan',
        'penumpang',
        'foto_berangkat',
        'foto_kembali',
        'created_by',
        'jenis_bbm',
        'jumlah_liter',
        'harga_per_liter',
        'total_harga_bbm',
        'tanggal_pembelian_bbm',
        'keterangan_bbm',
        'lokasi'
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

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function bbmLogs()
    {
        return $this->hasMany(BbmEditLog::class)->orderBy('created_at', 'desc');
    }
}
