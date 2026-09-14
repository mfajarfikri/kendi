<?php

use App\Models\Trip;
use App\Models\User;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->userKarawang = User::factory()->karawang()->create();
    $this->userPurwakarta = User::factory()->purwakarta()->create();
    $this->userNoLocation = User::factory()->create(['role' => 'user', 'lokasi' => null]);

    $this->tripKrwAktif1 = Trip::factory()->karawang()->sedangBerjalan()->create();
    $this->tripKrwAktif2 = Trip::factory()->karawang()->sedangBerjalan()->create();
    $this->tripKrwSelesai = Trip::factory()->karawang()->selesai()->create();
    $this->tripPwkAktif1 = Trip::factory()->purwakarta()->sedangBerjalan()->create();
    $this->tripPwkAktif2 = Trip::factory()->purwakarta()->sedangBerjalan()->create();
    $this->tripPwkSelesai = Trip::factory()->purwakarta()->selesai()->create();
});

// ============================================================
// 1. TEST AKSES DASHBOARD (DATA YANG DITAMPILKAN BERDASARKAN ROLE)
// ============================================================

it('admin sees all active trips (karawang + purwakarta) on dashboard recentTrips', function () {
    actingAs($this->admin)
        ->get(route('dashboard.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Dashboard/Dashboard')
            ->has('recentTrips', 4)
            ->where('recentTrips.0.lokasi', fn ($lokasi) => in_array($lokasi, ['Karawang', 'Purwakarta']))
            // recentTrips difilter backend hanya status "Sedang Berjalan"
            ->where('recentTrips.*.status', collect()->times(4, fn () => 'Sedang Berjalan')->toArray())
        );
});

it('admin sees combined stats count (karawang + purwakarta trips)', function () {
    // Total trips all = 6
    // Active trips all (status "Sedang Berjalan") = 4
    actingAs($this->admin)
        ->get(route('dashboard.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('tripStats.totalTrips', 6)
            ->where('tripStats.activeTrips', 4)
        );
});

it('user karawang only sees karawang active trips on dashboard recentTrips', function () {
    actingAs($this->userKarawang)
        ->get(route('dashboard.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Dashboard/Dashboard')
            ->has('recentTrips', 2)
            ->where('recentTrips.0.lokasi', 'Karawang')
            ->where('recentTrips.1.lokasi', 'Karawang')
            ->where('recentTrips.*.status', ['Sedang Berjalan', 'Sedang Berjalan'])
        );
});

it('user karawang sees only karawang stats (not purwakarta)', function () {
    // Karawang trips: 3 total (2 aktif, 1 selesai)
    actingAs($this->userKarawang)
        ->get(route('dashboard.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('tripStats.totalTrips', 3)
            ->where('tripStats.activeTrips', 2)
        );
});

it('user purwakarta only sees purwakarta active trips on dashboard recentTrips', function () {
    actingAs($this->userPurwakarta)
        ->get(route('dashboard.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Dashboard/Dashboard')
            ->has('recentTrips', 2)
            ->where('recentTrips.0.lokasi', 'Purwakarta')
            ->where('recentTrips.1.lokasi', 'Purwakarta')
        );
});

it('user purwakarta sees only purwakarta stats (not karawang)', function () {
    // Purwakarta trips: 3 total (2 aktif, 1 selesai)
    actingAs($this->userPurwakarta)
        ->get(route('dashboard.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('tripStats.totalTrips', 3)
            ->where('tripStats.activeTrips', 2)
        );
});

it('user with no location sees zero trips and empty stats (security safeguard)', function () {
    actingAs($this->userNoLocation)
        ->get(route('dashboard.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('recentTrips', 0)
            ->where('tripStats.totalTrips', 0)
            ->where('tripStats.activeTrips', 0)
            ->where('tripStats.totalKilometers', 0)
        );
});

// ============================================================
// 2. TEST AKSES TRIP INDEX LISTING (FILTER LOKASI)
// ============================================================

it('admin sees all trips (karawang + purwakarta) on trip listing', function () {
    actingAs($this->admin)
        ->get(route('trips.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('trips', 6)
            ->has('appliedLocation', fn ($value) => $value === '')
        );
});

it('user karawang only sees karawang trips on listing (no purwakarta)', function () {
    actingAs($this->userKarawang)
        ->get(route('trips.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('trips', 3)
            ->where('appliedLocation', 'Karawang')
            ->where('trips.*.lokasi', ['Karawang', 'Karawang', 'Karawang'])
        );
});

it('user purwakarta only sees purwakarta trips on listing (no karawang)', function () {
    actingAs($this->userPurwakarta)
        ->get(route('trips.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('trips', 3)
            ->where('appliedLocation', 'Purwakarta')
            ->where('trips.*.lokasi', ['Purwakarta', 'Purwakarta', 'Purwakarta'])
        );
});

it('user with no location sees zero trips on listing', function () {
    actingAs($this->userNoLocation)
        ->get(route('trips.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('trips', 0));
});

// ============================================================
// 3. TEST VALIDASI KEAMANAN: CEGAH AKSES DATA LINTAS LOKASI VIA URL
// ============================================================

it('prevents user karawang from viewing a purwakarta trip detail via URL manipulation -> 403', function () {
    actingAs($this->userKarawang)
        ->get(route('trips.show', $this->tripPwkAktif1->code_trip))
        ->assertForbidden();
});

it('prevents user purwakarta from viewing a karawang trip detail via URL manipulation -> 403', function () {
    actingAs($this->userPurwakarta)
        ->get(route('trips.show', $this->tripKrwAktif1->code_trip))
        ->assertForbidden();
});

it('allows user karawang to view own-location trip detail', function () {
    actingAs($this->userKarawang)
        ->get(route('trips.show', $this->tripKrwAktif1->code_trip))
        ->assertOk();
});

it('allows user purwakarta to view own-location trip detail', function () {
    actingAs($this->userPurwakarta)
        ->get(route('trips.show', $this->tripPwkAktif1->code_trip))
        ->assertOk();
});

it('allows admin to view any trip detail regardless of location', function () {
    actingAs($this->admin)
        ->get(route('trips.show', $this->tripKrwAktif1->code_trip))
        ->assertOk();

    actingAs($this->admin)
        ->get(route('trips.show', $this->tripPwkAktif1->code_trip))
        ->assertOk();
});

it('prevents user karawang from accessing trip close form for purwakarta trip -> 403', function () {
    actingAs($this->userKarawang)
        ->get(route('trips.close.form', $this->tripPwkAktif1->code_trip))
        ->assertForbidden();
});

it('prevents user purwakarta from accessing trip edit for karawang trip -> 403', function () {
    actingAs($this->userPurwakarta)
        ->get(route('trips.edit', $this->tripKrwAktif1->code_trip))
        ->assertForbidden();
});

it('prevents user with no location from viewing any trip detail -> 403', function () {
    actingAs($this->userNoLocation)
        ->get(route('trips.show', $this->tripKrwAktif1->code_trip))
        ->assertForbidden();

    actingAs($this->userNoLocation)
        ->get(route('trips.show', $this->tripPwkAktif1->code_trip))
        ->assertForbidden();
});

// ============================================================
// 4. TEST SHARED AUTH (INERTIA SHARE) -> isAdmin & lokasi tersedia
// ============================================================

it('inertia share exposes isAdmin correctly for admin', function () {
    actingAs($this->admin)
        ->get(route('dashboard.index'))
        ->assertInertia(fn ($page) => $page
            ->where('auth.user.isAdmin', true)
            ->where('auth.user.role', 'admin')
        );
});

it('inertia share exposes isAdmin=false & lokasi=Karawang for user karawang', function () {
    actingAs($this->userKarawang)
        ->get(route('dashboard.index'))
        ->assertInertia(fn ($page) => $page
            ->where('auth.user.isAdmin', false)
            ->where('auth.user.lokasi', 'Karawang')
            ->where('auth.user.role', 'user')
        );
});
