<?php

namespace App\Http\Controllers;

use App\Models\Kendaraan;
use App\Models\Trip;
use App\Models\TripEditRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Events\TripUpdated;
use App\Models\Driver;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;


class TripController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $userLokasi = optional(Auth::user())->lokasi;
        $tripsQuery = Trip::with(['kendaraan', 'driver', 'createdBy'])->latest();
        if (!empty($userLokasi)) {
            $tripsQuery->where('lokasi', $userLokasi);
        }
        return Inertia::render('Kendaraan/Trip', [
            'trips' => $tripsQuery->get(),
            'kendaraans' => Kendaraan::all(),
            'drivers' => Driver::all(),
            'appliedLocation' => $userLokasi ?? ''
        ]);
    }

    public function add()
    {
        return Inertia::render('Kendaraan/TripAdd', [
            'kendaraans' => Kendaraan::all(),
            'drivers' => Driver::all(),
        ]);
    }

    public function closeForm($code_trip)
    {
        $trip = Trip::where('code_trip', $code_trip)
                    ->with(['kendaraan', 'driver'])
                    ->firstOrFail();
        return Inertia::render('Kendaraan/TripClose', [
            'trip' => $trip,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $request->merge([
            'lokasi' => $request->input('lokasi', optional(Auth::user())->lokasi ?? 'Tidak Diketahui'),
        ]);
        // Validate the request
        $validator = Validator::make($request->all(), [
            'code_trip' => 'required|unique:trips,code_trip',
            'kendaraan_id' => 'required|exists:kendaraans,id',
            'driver_id' => 'required|exists:drivers,id',
            'waktu_keberangkatan' => 'required|date_format:Y-m-d\TH:i', // Format dari input datetime-local
            'tujuan' => 'required|string',
            'catatan' => 'nullable|string',
            'km' => 'required|numeric',
            'penumpang' => 'nullable|string',
            'foto_berangkat' => 'required|array',
            'foto_berangkat.*' => 'required|image|max:5120', // 5MB max per image
            'lokasi' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'type' => 'error',
                'message' => 'Gagal menambahkan trip: ' . $validator->errors()->first()
            ], 422);
        }

        $kendaraan = Kendaraan::find($request->kendaraan_id);
        $driver = Driver::find($request->driver_id);

        if (!$kendaraan || !$driver) {
            return response()->json([
                'type' => 'error',
                'message' => 'Kendaraan atau driver tidak ditemukan'
            ], 422);
        }

        // Process photo uploads
        $photos = [];
        if ($request->hasFile('foto_berangkat')) {
            foreach ($request->file('foto_berangkat') as $photo) {
                $path = $photo->store('trip_photos', 'public');
                $photos[] = $path;
            }
        }

        if (empty($photos)) {
            return response()->json([
                'type' => 'error',
                'message' => 'Tidak ada foto yang valid untuk diunggah'
            ], 422);
        }

        

        try {
            $trip = Trip::create([
                'code_trip' => $request->code_trip,
                'kendaraan_id' => $request->kendaraan_id,
                'driver_id' => $request->driver_id,
                'waktu_keberangkatan' => $request->waktu_keberangkatan,
                'tujuan' => $request->tujuan,
                'catatan' => $request->catatan,
                'km_awal' => $request->km,
                'penumpang' => $request->penumpang,
                'status' => 'Sedang Berjalan',
                'lokasi' => $request->lokasi,
                'foto_berangkat' => json_encode($photos),
                'created_by' => Auth::id(),
            ]);

            $kendaraan->update(['status' => 'Digunakan']);
            $driver->update(['status' => 'Sedang Bertugas']);

            return response()->json([
                'type' => 'success',
                'message' => 'Trip berhasil ditambahkan',
                'trip' => $trip
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'type' => 'error',
                'message' => 'Gagal menambahkan trip: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Redirect to create method for consistency
        return $this->create($request);
    }

    /**
     * Display the specified resource.
     */
    public function show($code_trip)
    {
        try {
            $trip = Trip::where('code_trip', $code_trip)
                        ->with(['kendaraan', 'driver', 'createdBy'])
                        ->firstOrFail();

            // Pastikan foto_berangkat dan foto_kembali adalah array
            $trip->foto_berangkat = is_string($trip->foto_berangkat)
                ? json_decode($trip->foto_berangkat, true)
                : $trip->foto_berangkat;

            $trip->foto_kembali = is_string($trip->foto_kembali)
                ? json_decode($trip->foto_kembali, true)
                : $trip->foto_kembali;

            return Inertia::render('Kendaraan/DetailTrip', [
                'trip' => $trip,
                'allVehicles' => Kendaraan::select('id', 'plat_kendaraan', 'merek')->where('status', 'Tersedia')->get(),
                'allDrivers' => Driver::select('id', 'name', 'phone_number')->where('status', 'Tersedia')->get(),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menampilkan detail trip');
        }
    }

    public function requestEdit(Request $request, $codeTrip)
{
    // 1. Validasi Data
    $validated = $request->validate([
        'penumpang' => 'nullable|string|max:255',
        'tujuan' => 'required|string|max:255',
        'waktu_keberangkatan' => 'required|date',
        // Catatan: Pastikan waktu kembali bisa null jika trip belum selesai
        'waktu_kembali' => 'nullable|date|after_or_equal:waktu_keberangkatan',
        'catatan' => 'nullable|string',
        'km_awal' => 'required|numeric|min:0',
        // KM akhir harus lebih besar dari KM awal
        'km_akhir' => 'required|numeric|min:' . $request->km_awal, 
        'kendaraan_id' => 'required|exists:kendaraans,id',
        'driver_id' => 'required|exists:drivers,id',
    ]);

    $trip = Trip::where('code_trip', $codeTrip)->firstOrFail();

    // 2. Siapkan Data Lama (Old Data) dari Trip Saat Ini
    $oldData = [
        'penumpang' => $trip->penumpang,
        'tujuan' => $trip->tujuan,
        'waktu_keberangkatan' => $trip->waktu_keberangkatan,
        'waktu_kembali' => $trip->waktu_kembali,
        'catatan' => $trip->catatan,
        'km_awal' => $trip->km_awal,
        'km_akhir' => $trip->km_akhir,
        'kendaraan_id' => $trip->kendaraan_id,
        'driver_id' => $trip->driver_id,
        'kendaraan_plat' => $trip->kendaraan->plat_kendaraan,
        'driver_name' => $trip->driver->name,
    ];

    // 3. Simpan sebagai Permintaan Edit
    TripEditRequest::create([
        'trip_id' => $trip->id,
        'requested_by_user_id' => Auth::id(),
        'old_data' => json_encode($oldData),
        'new_data' => json_encode($validated), // Hanya simpan data yang sudah divalidasi
        'status' => 'pending',
    ]);

    // 4. Redirect dengan pesan sukses
    return redirect()->back()->with('success', 'Permintaan perubahan trip berhasil diajukan dan menunggu persetujuan Admin.');
}

    // Gunakan Route Model Binding untuk mendapatkan instance TripEditRequest
    public function approveEdit(TripEditRequest $editRequest)
    {
        // 1. Cek Status dan Hak Akses (Opsi: tambahkan middleware admin)
        if ($editRequest->status !== 'pending') {
            return redirect()->back()->with('error', 'Permintaan ini sudah diproses.');
        }
        
        // Pastikan user yang login adalah Admin (Anda mungkin punya middleware admin)
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Akses ditolak.');
        }

        // 2. Ambil dan Decode Data Baru
        $trip = $editRequest->trip;
        $newData = json_decode($editRequest->new_data, true);

        // 3. Hitung Ulang Jarak Tempuh
        $kmAwal = (float) $newData['km_awal'];
        $kmAkhir = (float) $newData['km_akhir'];
        $jarakTempuh = max(0, $kmAkhir - $kmAwal); // Pastikan tidak negatif

        // 4. Update Data Trip Utama
        $trip->update([
            'penumpang' => $newData['penumpang'],
            'tujuan' => $newData['tujuan'],
            'waktu_keberangkatan' => $newData['waktu_keberangkatan'],
            'waktu_kembali' => $newData['waktu_kembali'],
            'catatan' => $newData['catatan'],
            'km_awal' => $kmAwal,
            'km_akhir' => $kmAkhir,
            'jarak' => $jarakTempuh, // Data jarak tempuh yang baru dan benar
            'kendaraan_id' => $newData['kendaraan_id'],
            'driver_id' => $newData['driver_id'],
        ]);

        // 5. Update Status Permintaan
        $editRequest->update([
            'status' => 'approved',
            'approved_by_admin_id' => Auth::user()->id,
        ]);

        return redirect()->back()->with('success', 'Perubahan Trip (termasuk Kilometer) berhasil disetujui!');
    }
    public function showEditRequests()
    {
        // Ambil semua permintaan yang statusnya 'pending', urutkan dari yang terbaru
        $requests = TripEditRequest::with('trip.kendaraan', 'requestedBy')
                                    ->where('status', 'pending')
                                    ->latest()
                                    ->get()
                                    ->map(function ($request) {
                                        // 1. Definisikan variabel lokal (dengan decoding)
                                        $oldData = json_decode($request->old_data, true);
                                        $newData = json_decode($request->new_data, true);

                                        // 2. LOGIC PENAMBAHAN NAMA KENDARAAN/DRIVER BARU

                                        // Memuat Kendaraan dan Driver yang baru/lama berdasarkan ID yang tersimpan
                                        // Kita perlu nama Kendaraan/Driver yang BARU (jika ID-nya berubah)
                                        if (isset($newData['kendaraan_id'])) {
                                            $newVehicle = Kendaraan::find($newData['kendaraan_id']);
                                            // Pastikan kita bisa membaca plat kendaraan
                                            $newData['kendaraan_plat'] = $newVehicle ? $newVehicle->plat_kendaraan : 'Kendaraan Dihapus';
                                        }
                                        if (isset($newData['driver_id'])) {
                                            $newDriver = Driver::find($newData['driver_id']);
                                            // Pastikan kita bisa membaca nama driver
                                            $newData['driver_name'] = $newDriver ? $newDriver->name : 'Driver Dihapus';
                                        }
                                        
                                        // 3. Set ulang data yang sudah di-decode dan ditambahkan
                                        // BARIS INI AKAN MEMPERBAIKI ERROR 'Undefined variable $oldData'
                                        $request->old_data = $oldData;
                                        $request->new_data = $newData;
                                        return $request;
                                    });

        // Kirim data ke komponen React/Inertia baru
        return Inertia::render('Admin/TripEditRequests', [
            'pendingRequests' => $requests,
        ]);
    }
    public function rejectEdit(TripEditRequest $editRequest)
    {
        // Cek hak akses dan status seperti pada approveEdit
        if ($editRequest->status !== 'pending' || Auth::user()->role !== 'admin') {
            return redirect()->back()->with('error', 'Akses ditolak atau permintaan sudah diproses.');
        }

        // Hanya update status menjadi 'rejected'
        $editRequest->update([
            'status' => 'rejected',
            'approved_by_admin_id' => Auth::user()->id, // Mencatat admin yang menolak
        ]);

        return redirect()->back()->with('success', 'Permintaan perubahan berhasil ditolak.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($code_trip)
    {
        $trip = Trip::where('code_trip', $code_trip)
                    ->with(['kendaraan', 'driver', 'photos'])
                    ->firstOrFail();

        return Inertia::render('Kendaraan/EditTrip', [
            'trip' => $trip
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Trip $trip)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Trip $trip)
    {
        //
    }

    public function close(Request $request, Trip $trip)
    {
        try {
            // Validate the request data
            $validated = $request->validate([
                'km_akhir' => 'required|numeric|min:' . $trip->km_awal,
                'waktu_kembali' => 'required|date',
                'jarak' => 'required|numeric',
                'foto_kembali' => 'required|array',
                'foto_kembali.*' => 'required|image|max:5120', // 5MB max per image
            ]);

            // Process photos
            $photos = [];
            if ($request->hasFile('foto_kembali')) {
                foreach ($request->file('foto_kembali') as $photo) {
                    $fileName = uniqid() . '_' . time() . '.' . $photo->getClientOriginalExtension();
                    $path = $photo->storeAs('trip-photos', $fileName, 'public');
                    $photos[] = $path;
                }
            }

            // Update trip with all data using the update method
            $trip->update([
                'waktu_kembali' => $validated['waktu_kembali'],
                'status' => 'Selesai',
                'jarak' => $validated['jarak'],
                'km_akhir' => $validated['km_akhir'],
                'foto_kembali' => !empty($photos) ? json_encode($photos) : null
            ]);

            // Update kendaraan status and km
            $trip->kendaraan->update([
                'km' => $validated['km_akhir'],
                'status' => 'Tersedia'
            ]);

            // Update driver status
            $trip->driver->update([
                'status' => 'Tersedia'
            ]);

            // Try to broadcast the event if it exists
            try {
                if (class_exists('App\Events\TripUpdated')) {
                    broadcast(new \App\Events\TripUpdated($trip))->toOthers();
                }
            } catch (\Exception $broadcastError) {
                // Silently handle broadcasting errors
            }

            return redirect()->route('trips.show', $trip->code_trip)
                ->with('type', 'success')
                ->with('message', 'Trip berhasil ditutup');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('type', 'error')
                ->with('message', 'Gagal menutup trip: ' . $e->getMessage());
        }
    }

    public function updateBbm(Request $request, $code_trip)
    {
        try {
            $trip = Trip::where('code_trip', $code_trip)->firstOrFail();

            $validated = $request->validate([
                'jenis_bbm' => 'required|string',
                'jumlah_liter' => 'required|numeric|min:0',
                'harga_per_liter' => 'required|numeric|min:0',
                'total_harga' => 'required|numeric|min:0',
            ]);

            $trip->update([
                'jenis_bbm' => $validated['jenis_bbm'],
                'jumlah_liter' => $validated['jumlah_liter'],
                'harga_per_liter' => $validated['harga_per_liter'],
                'total_harga_bbm' => $validated['total_harga'],
            ]);

            return redirect()->back()->with([
                'type' => 'success',
                'message' => 'Data BBM berhasil disimpan'
            ]);

        } catch (\Exception $e) {
            return redirect()->back()->with([
                'type' => 'error',
                'message' => 'Gagal menyimpan data BBM: ' . $e->getMessage()
            ]);
        }
    }
}
