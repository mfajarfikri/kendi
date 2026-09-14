<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Dashboard;
use Illuminate\Http\Request;
use App\Models\Trip;
use App\Models\Kendaraan;
use App\Models\Driver;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();

        $tripStats = $this->getTripStats($user);

        $vehicleStats = $this->getVehicleStats($user);

        $driverStats = $this->getDriverStats($user);

        $recentTripsQuery = Trip::with(['kendaraan', 'driver'])
            ->where('status', 'Sedang Berjalan')
            ->orderBy('waktu_keberangkatan', 'desc');

        $this->applyLocationFilter($recentTripsQuery, $user);

        $recentTrips = $recentTripsQuery->get();

        return Inertia::render('Dashboard/Dashboard', [
            'tripStats' => $tripStats,
            'vehicleStats' => $vehicleStats,
            'driverStats' => $driverStats,
            'recentTrips' => $recentTrips,
        ]);
    }

    /**
     * Terapkan filter lokasi ke query builder berdasarkan user.
     * - Admin: tidak ada filter
     * - User biasa + punya lokasi: filter where('lokasi', user.lokasi)
     * - User biasa tanpa lokasi: return kosong (1=0)
     */
    private function applyLocationFilter(Builder $query, ?User $user): void
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Dashboard $dashboard)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Dashboard $dashboard)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Dashboard $dashboard)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Dashboard $dashboard)
    {
        //
    }

    private function getTripStats(?User $user)
    {
        $totalTripsQuery = Trip::query();
        $this->applyLocationFilter($totalTripsQuery, $user);
        $totalTrips = $totalTripsQuery->count();

        $activeTripsQuery = Trip::where('status', 'Sedang Berjalan');
        $this->applyLocationFilter($activeTripsQuery, $user);
        $activeTrips = $activeTripsQuery->count();

        $totalKmQuery = Trip::whereNotNull('jarak');
        $this->applyLocationFilter($totalKmQuery, $user);
        $totalKilometers = $totalKmQuery->sum('jarak');

        $startDate = Carbon::now()->subDays(6)->startOfDay();
        $endDate = Carbon::now()->endOfDay();

        $dailyTripsQuery = Trip::select(
            DB::raw('DATE(waktu_keberangkatan) as date'),
            DB::raw('COUNT(*) as count'),
            DB::raw('SUM(CASE WHEN jarak IS NOT NULL THEN jarak ELSE 0 END) as kilometers')
        )
            ->whereBetween('waktu_keberangkatan', [$startDate, $endDate])
            ->groupBy(DB::raw('DATE(waktu_keberangkatan)'))
            ->orderBy('date');
        $this->applyLocationFilter($dailyTripsQuery, $user);
        $dailyTrips = $dailyTripsQuery->get();

        $dailyLabels = [];
        $dailyCounts = [];
        $dailyKilometers = [];

        $dateRange = [];
        for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {
            $dateKey = $date->format('Y-m-d');
            $dateRange[$dateKey] = [
                'count' => 0,
                'kilometers' => 0,
                'label' => $date->format('D'),
            ];
        }

        foreach ($dailyTrips as $day) {
            $dateKey = Carbon::parse($day->date)->format('Y-m-d');
            if (isset($dateRange[$dateKey])) {
                $dateRange[$dateKey]['count'] = $day->count;
                $dateRange[$dateKey]['kilometers'] = $day->kilometers;
            }
        }

        foreach ($dateRange as $data) {
            $dailyLabels[] = $data['label'];
            $dailyCounts[] = $data['count'];
            $dailyKilometers[] = $data['kilometers'];
        }

        $weeklyKmQuery = Trip::whereBetween('waktu_keberangkatan', [$startDate, $endDate])
            ->whereNotNull('jarak');
        $this->applyLocationFilter($weeklyKmQuery, $user);
        $weeklyKilometers = $weeklyKmQuery->sum('jarak');

        $monthlyStats = $this->getMonthlyStats($user);

        return [
            'totalTrips' => $totalTrips,
            'activeTrips' => $activeTrips,
            'totalKilometers' => $totalKilometers,
            'weeklyKilometers' => $weeklyKilometers,
            'dailyLabels' => $dailyLabels,
            'dailyCounts' => $dailyCounts,
            'dailyKilometers' => $dailyKilometers,
            'monthlyTrips' => $monthlyStats['monthlyTrips'],
            'monthlyTripGrowth' => $monthlyStats['monthlyTripGrowth'],
            'monthlyKilometers' => $monthlyStats['monthlyKilometers'],
            'monthlyKilometerGrowth' => $monthlyStats['monthlyKilometerGrowth'],
        ];
    }

    private function getVehicleStats(?User $user)
    {
        $totalVehicles = Kendaraan::count();

        $availableVehicles = Kendaraan::where('status', '!=', 'Digunakan')->count();

        $vehicleUsageQuery = Trip::select(
            'kendaraan_id',
            DB::raw('COUNT(*) as trip_count')
        )
            ->with('kendaraan')
            ->groupBy('kendaraan_id')
            ->orderBy('trip_count', 'desc')
            ->take(5);
        $this->applyLocationFilter($vehicleUsageQuery, $user);
        $vehicleUsage = $vehicleUsageQuery->get();

        $labels = [];
        $tripCounts = [];

        foreach ($vehicleUsage as $vehicle) {
            if ($vehicle->kendaraan) {
                $labels[] = $vehicle->kendaraan->merek;
                $tripCounts[] = $vehicle->trip_count;
            }
        }

        return [
            'totalVehicles' => $totalVehicles,
            'availableVehicles' => $availableVehicles,
            'labels' => $labels,
            'tripCounts' => $tripCounts,
        ];
    }

    private function getDriverStats(?User $user)
    {
        $totalDrivers = Driver::count();

        $availableDrivers = Driver::where('status', '!=', 'Sedang Bertugas')->count();

        $driverPerfQuery = Trip::select(
            'driver_id',
            DB::raw('COUNT(*) as trip_count'),
            DB::raw('SUM(CASE WHEN jarak IS NOT NULL THEN jarak ELSE 0 END) as total_kilometers')
        )
            ->with('driver')
            ->groupBy('driver_id')
            ->orderBy('trip_count', 'desc')
            ->take(8);
        $this->applyLocationFilter($driverPerfQuery, $user);
        $driverPerformance = $driverPerfQuery->get();

        $labels = [];
        $tripCounts = [];
        $totalKilometers = [];

        $allDrivers = Driver::select('id', 'name', 'status', 'created_at')->get();

        $driversByStatus = [
            'Tersedia' => $allDrivers->where('status', 'Tersedia')->count(),
            'Sedang Bertugas' => $allDrivers->where('status', 'Sedang Bertugas')->count(),
            'Cuti' => $allDrivers->where('status', 'Cuti')->count(),
            'Lainnya' => $allDrivers->whereNotIn('status', ['Tersedia', 'Sedang Bertugas', 'Cuti'])->count(),
        ];

        $thirtyDaysAgo = Carbon::now()->subDays(30);
        $newDrivers = $allDrivers->where('created_at', '>=', $thirtyDaysAgo)->count();

        foreach ($driverPerformance as $driver) {
            if ($driver->driver) {
                $labels[] = $driver->driver->nama;
                $tripCounts[] = $driver->trip_count;
                $totalKilometers[] = $driver->total_kilometers;
            }
        }

        $topDriversQuery = Trip::select(
            'driver_id',
            DB::raw('SUM(CASE WHEN jarak IS NOT NULL THEN jarak ELSE 0 END) as total_kilometers')
        )
            ->with('driver')
            ->whereNotNull('jarak')
            ->groupBy('driver_id')
            ->orderBy('total_kilometers', 'desc')
            ->take(5);
        $this->applyLocationFilter($topDriversQuery, $user);
        $topDriversByKm = $topDriversQuery->get()
            ->map(function ($item) {
                return [
                    'name' => $item->driver ? $item->driver->nama : 'Unknown',
                    'kilometers' => $item->total_kilometers,
                ];
            });

        return [
            'totalDrivers' => $totalDrivers,
            'availableDrivers' => $availableDrivers,
            'newDrivers' => $newDrivers,
            'driversByStatus' => $driversByStatus,
            'labels' => $labels,
            'tripCounts' => $tripCounts,
            'totalKilometers' => $totalKilometers,
            'topDriversByKm' => $topDriversByKm,
        ];
    }

    private function getPopularDestinations(?User $user)
    {
        $destinationsQuery = Trip::select(
            'tujuan',
            DB::raw('COUNT(*) as trip_count')
        )
            ->groupBy('tujuan')
            ->orderBy('trip_count', 'desc')
            ->take(5);
        $this->applyLocationFilter($destinationsQuery, $user);
        $destinations = $destinationsQuery->get();

        $maxCount = $destinations->max('trip_count');

        $formattedDestinations = [];
        foreach ($destinations as $destination) {
            $percentage = $maxCount > 0 ? ($destination->trip_count / $maxCount) * 100 : 0;
            $formattedDestinations[] = [
                'destination' => $destination->tujuan,
                'count' => $destination->trip_count,
                'percentage' => round($percentage),
            ];
        }

        return $formattedDestinations;
    }

    private function getMonthlyStats(?User $user)
    {
        $currentMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        $monthlyTripsQuery = Trip::whereBetween('waktu_keberangkatan', [
            $currentMonth,
            Carbon::now()->endOfMonth(),
        ]);
        $this->applyLocationFilter($monthlyTripsQuery, $user);
        $monthlyTrips = $monthlyTripsQuery->count();

        $lastMonthTripsQuery = Trip::whereBetween('waktu_keberangkatan', [
            $lastMonth,
            $lastMonth->copy()->endOfMonth(),
        ]);
        $this->applyLocationFilter($lastMonthTripsQuery, $user);
        $lastMonthTrips = $lastMonthTripsQuery->count();

        $monthlyTripGrowth = $lastMonthTrips > 0
            ? round((($monthlyTrips - $lastMonthTrips) / $lastMonthTrips) * 100)
            : 0;

        $monthlyKmQuery = Trip::whereBetween('waktu_keberangkatan', [
            $currentMonth,
            Carbon::now()->endOfMonth(),
        ])->whereNotNull('jarak');
        $this->applyLocationFilter($monthlyKmQuery, $user);
        $monthlyKilometers = $monthlyKmQuery->sum('jarak');

        $lastMonthKmQuery = Trip::whereBetween('waktu_keberangkatan', [
            $lastMonth,
            $lastMonth->copy()->endOfMonth(),
        ])->whereNotNull('jarak');
        $this->applyLocationFilter($lastMonthKmQuery, $user);
        $lastMonthKilometers = $lastMonthKmQuery->sum('jarak');

        $monthlyKilometerGrowth = $lastMonthKilometers > 0
            ? round((($monthlyKilometers - $lastMonthKilometers) / $lastMonthKilometers) * 100)
            : 0;

        return [
            'monthlyTrips' => $monthlyTrips,
            'monthlyTripGrowth' => $monthlyTripGrowth,
            'monthlyKilometers' => $monthlyKilometers,
            'monthlyKilometerGrowth' => $monthlyKilometerGrowth,
        ];
    }
}
