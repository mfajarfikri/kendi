<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Tamu;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer as XlsxWriter;

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
     * Display a listing of the resource.
     */
    public function index()
    {
        $perPage = request()->integer('per_page', 8);
        $allowedPerPage = [8, 16, 32, 50];
        $perPage = in_array($perPage, $allowedPerPage, true) ? $perPage : 8;

        $query = $this->buildFilteredQuery(request())->latest();
        $search = trim((string) request('search', ''));
        $startDate = request('start_date');
        $endDate = request('end_date');
        $statsQuery = clone $query;

        return Inertia::render('Kendaraan/Tamu', [
            'tamus' => $query
                ->paginate($perPage)
                ->withQueryString(),
            'stats' => [
                'total' => (clone $statsQuery)->count(),
                'masuk' => (clone $statsQuery)->where('status', 'New')->count(),
                'keluar' => (clone $statsQuery)->where('status', '!=', 'New')->count(),
            ],
            'filters' => [
                'search' => $search,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function export(Request $request)
    {
        $exportType = $request->input('export_type', 'all');
        $month = trim((string) $request->input('month', ''));

        $query = $this->buildFilteredQuery($request)
            ->select([
                'id',
                'plat_kendaraan',
                'waktu_kedatangan',
                'waktu_kepergian',
                'status',
                'lokasi',
            ])
            ->orderBy('id');

        $filename = 'data_kendaraan_tamu_' . now()->format('Y-m-d_His') . '.xlsx';

        if ($exportType === 'month' && preg_match('/^\d{4}-\d{2}$/', $month)) {
            $filename = 'data_kendaraan_tamu_' . $month . '.xlsx';
        }

        $temporaryFile = tempnam(sys_get_temp_dir(), 'tamu-export-');

        if ($temporaryFile === false) {
            abort(500, 'Gagal menyiapkan file export.');
        }

        $writer = new XlsxWriter();
        $writer->openToFile($temporaryFile);

        $writer->addRow(Row::fromValues([
            'No',
            'No Polisi',
            'Waktu Kedatangan',
            'Waktu Kepergian',
            'Status',
            'Lokasi',
        ]));

        $number = 1;

        foreach ($query->cursor() as $tamu) {
            $writer->addRow(Row::fromValues([
                $number++,
                $tamu->plat_kendaraan,
                optional($tamu->waktu_kedatangan)->format('d/m/Y H:i:s') ?? '-',
                optional($tamu->waktu_kepergian)->format('d/m/Y H:i:s') ?? '-',
                $tamu->status === 'New' ? 'Masuk' : 'Keluar',
                $tamu->lokasi ?? '-',
            ]));
        }

        $writer->close();

        return response()->download(
            $temporaryFile,
            $filename,
            [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ]
        )->deleteFileAfterSend(true);
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

        $request->merge(['lokasi' => $forcedLokasi]);

        $request->validate([
            'plat_kendaraan' => 'required|string|max:20',
            'waktu_kedatangan' => 'required|date',
            'foto_kendaraan' => 'required|array',
            'foto_kendaraan.*' => 'required|image|max:5120',
            'lokasi' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            $tamu = new Tamu();
            $tamu->plat_kendaraan = strtoupper($request->plat_kendaraan);
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
                'message' => 'Kendaraan tamu berhasil ditutup'
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

    private function buildFilteredQuery(Request $request): Builder
    {
        $query = Tamu::query();
        $user = $request->user();

        if (!empty($user?->lokasi)) {
            $query->where('lokasi', $user->lokasi);
        }

        $search = trim((string) $request->input('search', ''));
        if ($search !== '') {
            $query->where('plat_kendaraan', 'like', '%' . $search . '%');
        }

        $month = trim((string) $request->input('month', ''));
        if (preg_match('/^\d{4}-\d{2}$/', $month)) {
            $monthDate = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
            $query->whereBetween('waktu_kedatangan', [
                $monthDate->copy()->startOfMonth(),
                $monthDate->copy()->endOfMonth(),
            ]);

            return $query;
        }

        $startDate = $request->input('start_date');
        if (!empty($startDate)) {
            $query->whereDate('waktu_kedatangan', '>=', $startDate);
        }

        $endDate = $request->input('end_date');
        if (!empty($endDate)) {
            $query->whereDate('waktu_kedatangan', '<=', $endDate);
        }

        return $query;
    }
}
