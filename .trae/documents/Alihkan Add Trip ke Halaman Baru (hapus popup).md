## Ringkasan
- Pindahkan fitur "Tambah Trip" dari modal ke halaman baru.
- Gunakan rute `trips.add` untuk menampilkan form create, submit ke `trips.create`, redirect ke `trips.show`.
- Bersihkan `Trip.jsx` dari kode modal tambah agar tidak ada popup.

## Perubahan Frontend (Trip.jsx)
- Ubah tautan tombol "Trip Baru" menjadi `href={route('trips.add')}` di `resources/js/Pages/Kendaraan/Trip.jsx:1025-1033`.
- Hapus seluruh blok "Modal Tambah Data" dan state/handler terkait:
  - State: `showPopup` dan `useForm` untuk tambah (diinisiasi di `Trip.jsx:56` dan `Trip.jsx:121-134`).
  - Fungsi: `generateRandomCode`, efek update `waktu_keberangkatan`, `handleSubmit`, `handleFileUpload` (khusus tambah), serta `fileInputRef` (khusus tambah).
  - JSX modal: `Trip.jsx:1420-1909`.
- Pertahankan fitur "Close Trip" dan "Export"; pastikan variabel/fungsi yang dipakai close (mis. `fileInputRefClose`, `handleFileUploadClose`, `photos`, `previewPhotos`) tetap ada.
- Ganti aksi tombol "Batal" pada modal close agar tidak bergantung pada `reset()` dari form tambah (sudah ada reset state manual).

## Halaman Baru (TripAdd.jsx)
- Lengkapi `resources/js/Pages/Kendaraan/TripAdd.jsx` menjadi halaman penuh:
  - Impor: `DashboardLayout`, `Head`, `Link`, `useForm`, `router`, `React`, `dateformat`, `react-icons`, `react-toastify`, dan `axios`.
  - State dan form: replikasi logika dari modal tambah di `Trip.jsx` (kode trip acak, `waktu_keberangkatan` auto-update, validasi foto, kompresi/konversi gambar, preview, dan submit multipart).
  - Data pilihan: hitung `kendaraanTersediaStatus` dan `driversAvailable` dari props `kendaraans` dan `drivers`.
  - Submit: `POST` ke `route('trips.create')`, tampilkan toast sukses/gagal; saat sukses redirect ke detail `router.visit(route('trips.show', response.data.trip.code_trip))`.
  - Tombol "Batal": kembali ke daftar dengan `router.visit(route('trips.index'))`.
  - Bungkus dengan `DashboardLayout` dan `Head` agar konsisten UI.

## Backend (Route & Controller)
- Tambahkan method `add()` di `app/Http/Controllers/TripController.php` untuk merender halaman baru:
  - `return Inertia::render('Kendaraan/TripAdd', { kendaraans, drivers });`
  - Pastikan rute `Route::get('/trips/add', [TripController::class, 'add'])->name('trips.add');` di `routes/web.php:54` tetap digunakan oleh tombol.
- Tidak mengubah `create()` karena sudah dipakai untuk menerima `POST` multipart dari form.

## Validasi & Pengujian
- Buka halaman daftar trip, klik "Trip Baru"; pastikan diarahkan ke halaman form baru.
- Isi form, unggah 1–5 foto; submit dan pastikan redirect ke halaman detail trip.
- Verifikasi status kendaraan dan driver berubah sesuai logika backend.
- Pastikan fitur "Close Trip" dan "Export Excel" di daftar tetap berfungsi.

## Catatan Kompatibilitas
- Tidak menghapus modal close dan export yang memakai `ModalNew`.
- Membersihkan dependensi form tambah dari `Trip.jsx` untuk mencegah state tidak terpakai.
- Menghindari hard-coded path `/kendaraan/trip/add`; gunakan `route('trips.add')` agar konsisten dengan backend.