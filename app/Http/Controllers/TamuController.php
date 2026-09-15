<?php

namespace App\Http\Controllers;

use App\Models\Tamu;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\Rule;

class TamuController extends Controller
{
    /**
     * Authorize access to a single Tamu record based on user role + location.
     */
    private function authorizeTamuAccess(Tamu $tamu): void
    {
        $user = Auth::user();

        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        if ($user->isAdmin) {
            return;
        }

        $userLokasi = trim((string) $user->lokasi);
        $tamuLokasi = trim((string) $tamu->lokasi);

        if ($userLokasi === '' || $tamuLokasi === '' || strcasecmp($userLokasi, $tamuLokasi) !== 0) {
            Log::warning('Unauthorized tamu location access attempt', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_lokasi' => $userLokasi,
                'tamu_id' => $tamu->id,
                'tamu_lokasi' => $tamuLokasi,
                'ip' => request()->ip(),
            ]);
            abort(403, 'Anda tidak memiliki izin untuk mengakses data tamu di lokasi ini.');
        }
    }

    /**
     * Apply location filter to Tamu listing query.
     */
    private function applyTamuLocationFilter(Builder $query, ?User $user): void
    {
        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        if ($user->isAdmin) {
            return;
        }

        $lokasi = trim((string) $user->lokasi);

        if ($lokasi === '') {
            $query->whereRaw('1 = 0');
            return;
        }

        $query->where('lokasi', $lokasi);
    }

    /**
     * Bangun query listing tamu yang sudah menerapkan filter lokasi (role-based),
     * pencarian plat kendaraan, dan rentang waktu kedatangan.
     */
    private function filteredTamuQuery(Request $request, ?User $user): Builder
    {
        $query = Tamu::query();
        $this->applyTamuLocationFilter($query, $user);

        $search = trim((string) $request->input('search', ''));
        if ($search !== '') {
            $query->where('plat_kendaraan', 'like', '%' . $search . '%');
        }

        $startDate = $request->date('start_date');
        if ($startDate) {
            $query->where('waktu_kedatangan', '>=', $startDate->copy()->startOfDay());
        }

        $endDate = $request->date('end_date');
        if ($endDate) {
            $query->where('waktu_kedatangan', '<=', $endDate->copy()->endOfDay());
        }

        return $query;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        $perPage = (int) $request->input('per_page', 8);
        if (!in_array($perPage, [8, 16, 32, 50], true)) {
            $perPage = 8;
        }

        // Statistik ringkas mengikuti filter yang sedang aktif
        $stats = [
            'total' => $this->filteredTamuQuery($request, $user)->count(),
            'masuk' => $this->filteredTamuQuery($request, $user)->where('status', 'New')->count(),
            'keluar' => $this->filteredTamuQuery($request, $user)->where('status', 'Close')->count(),
        ];

        $tamus = $this->filteredTamuQuery($request, $user)
            ->orderByDesc('waktu_kedatangan')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Kendaraan/Tamu', [
            'tamus' => $tamus,
            'filters' => [
                'search' => trim((string) $request->input('search', '')),
                'start_date' => $request->date('start_date')?->toDateString() ?? '',
                'end_date' => $request->date('end_date')?->toDateString() ?? '',
                'per_page' => $perPage,
            ],
            'stats' => $stats,
            'appliedLocation' => $user->isAdmin ? '' : trim((string) $user->lokasi),
            'isAdmin' => $user->isAdmin,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        $forcedLokasi = null;

        if (!$user->isAdmin) {
            $userLokasi = trim((string) $user->lokasi);
            if ($userLokasi === '') {
                return redirect()->back()->with([
                    'success' => false,
                    'message' => 'Akun Anda belum memiliki lokasi yang terdaftar. Hubungi admin.',
                ]);
            }
            $forcedLokasi = $userLokasi;
        } else {
            $forcedLokasi = trim((string) $request->input('lokasi'));
            if ($forcedLokasi === '') {
                $forcedLokasi = 'Tidak Diketahui';
            }
        }

        $platKendaraan = strtoupper(trim((string) $request->input('plat_kendaraan')));

        $request->merge([
            'lokasi' => $forcedLokasi,
            'plat_kendaraan' => $platKendaraan,
        ]);

        $request->validate([
            'plat_kendaraan' => [
                'required',
                'string',
                'max:20',
                // Tamu boleh datang kembali dengan plat yang sama, tetapi tidak boleh
                // didaftarkan masuk lagi selama kepergian sebelumnya belum ditutup.
                Rule::unique('tamus', 'plat_kendaraan')
                    ->where(fn ($query) => $query->where('status', 'New')),
            ],
            'waktu_kedatangan' => 'required|date',
            'foto_kendaraan' => 'required|array',
            'foto_kendaraan.*' => 'required|image|max:5120',
            'lokasi' => 'required|string',
        ], [
            'plat_kendaraan.unique' => 'Kendaraan dengan plat ini masih tercatat di dalam. Tutup dulu kepergiannya sebelum mendaftarkan masuk kembali.',
        ]);

        try {
            DB::beginTransaction();

            $tamu = new Tamu();
            $tamu->plat_kendaraan = $platKendaraan;
            $tamu->waktu_kedatangan = $request->waktu_kedatangan;
            $tamu->status = 'New';
            $tamu->lokasi = $request->lokasi;
            $tamu->foto_kedatangan = '[]';
            $tamu->created_by = Auth::id();
            $tamu->save();

            // Proses upload foto
            $photos = [];
            if ($request->hasFile('foto_kendaraan')) {
                foreach ($request->file('foto_kendaraan') as $photo) {
                    $path = $photo->store('tamu-photos', 'public');
                    $photos[] = $path;
                }
            }

            // Update foto
            $tamu->foto_kedatangan = json_encode($photos);
            $tamu->save();

            DB::commit();

            // Return dengan data terbaru
            return redirect()->back()->with([
                'success' => true,
                'message' => 'Data kendaraan berhasil ditambahkan'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error in TamuController@store: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Close the specified tamu.
     */
    public function close(Request $request, Tamu $tamu)
    {
        $this->authorizeTamuAccess($tamu);

        $request->validate([
            'waktu_kepergian' => 'required|date',
            'foto_kepergian' => 'required|array',
            'foto_kepergian.*' => 'required|image|max:5120',
        ]);

        try {
            DB::beginTransaction();

            $photos = [];
            if ($request->hasFile('foto_kepergian')) {
                foreach ($request->file('foto_kepergian') as $photo) {
                    $path = $photo->store('tamu-photos', 'public');
                    $photos[] = $path;
                }
            }

            $tamu->waktu_kepergian = $request->waktu_kepergian;
            $tamu->status = 'Close';
            $tamu->foto_kepergian = json_encode($photos);
            $tamu->save();

            DB::commit();

            return redirect()->back()->with([
                'success' => true,
                'message' => 'Kendaraan tamu berhasil ditutup',
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error in TamuController@close: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }
}
