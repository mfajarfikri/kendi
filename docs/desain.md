# Proposal Aplikasi Monitoring Kendaraan Dinas — PLN UPT Karawang

## 1. Latar Belakang

Pengelolaan kendaraan dinas di lingkungan PLN UPT Karawang saat ini masih dilakukan secara manual, seperti pencatatan penggunaan kendaraan di buku log fisik, estimasi jarak tempuh yang tidak akurat, serta kesulitan dalam memantau efisiensi penggunaan armada untuk mendukung kegiatan operasional (survei gardu induk, pemeliharaan jaringan, dan kegiatan dinas lainnya di wilayah kerja Karawang). Hal ini menyebabkan beberapa permasalahan, di antaranya:

- Sulit memverifikasi jarak tempuh (km) setiap perjalanan (trip) secara akurat.
- Tidak ada data historis yang terpusat untuk analisis penggunaan kendaraan.
- Potensi penyalahgunaan kendaraan dinas di luar keperluan kerja.
- Perencanaan perawatan kendaraan berdasarkan jarak tempuh menjadi tidak optimal.

Untuk mengatasi permasalahan tersebut, diusulkan pengembangan **Aplikasi Monitoring Kendaraan Dinas PLN UPT Karawang** yang mampu mencatat dan menghitung jarak tempuh setiap trip secara otomatis melalui pos keamanan.

## 2. Tujuan

1. Menyediakan sistem pencatatan perjalanan kendaraan dinas secara digital dan otomatis.
2. Menghitung jarak tempuh (km) setiap trip secara akurat berdasarkan input odometer oleh satpam.
3. Memberikan visibilitas penggunaan kendaraan kepada bagian terkait (fasilitas umum/GA, admin, atau manajemen).
4. Menjadi dasar data untuk perencanaan perawatan kendaraan (servis berkala berdasarkan km).
5. Meningkatkan akuntabilitas penggunaan aset perusahaan.

## 3. Ruang Lingkup

Aplikasi ini mencakup:

- Pendaftaran data kendaraan dinas (jenis, plat nomor, tahun, driver yang ditugaskan).
- Pencatatan mulai (start trip) dan selesai (end trip) perjalanan.
- Perhitungan otomatis jarak tempuh per trip berdasarkan selisih odometer keluar dan masuk.
- Riwayat perjalanan per kendaraan dan per pengemudi.
- Dashboard monitoring untuk admin/manajemen.
- Laporan periodik (harian, mingguan, bulanan).

## 4. Target Pengguna

| Peran | Deskripsi |
|---|---|
| Satpam/Petugas Pos Keamanan | Input data km (odometer) kendaraan saat keluar dan masuk area |
| Admin/GA | Mengelola data kendaraan, memantau seluruh aktivitas trip |
| Manajemen | Melihat laporan dan ringkasan penggunaan kendaraan |

## 5. Fitur Utama

### 5.1 Manajemen Data Kendaraan
- Input data kendaraan (nama, plat nomor, jenis, tahun pembuatan, status aktif).
- Assign kendaraan ke driver/peminjam tertentu.

### 5.2 Pencatatan Trip oleh Satpam
- Satpam mencatat kendaraan **keluar**: input plat nomor/pilih kendaraan, nama driver/peminjam, tujuan, angka odometer awal, waktu keluar.
- Satpam mencatat kendaraan **masuk**: pilih kendaraan yang sedang keluar (status "di luar"), input angka odometer akhir, waktu masuk.
- Sistem otomatis memasangkan (matching) data keluar dan masuk menjadi satu trip.
- Input dilakukan melalui aplikasi di pos keamanan (tablet/PC/mobile).

### 5.3 Perhitungan Jarak Tempuh (KM per Trip)
- Jarak tempuh dihitung otomatis dari selisih odometer akhir (saat masuk) dikurangi odometer awal (saat keluar).
- Validasi input: odometer masuk harus lebih besar dari odometer keluar; sistem memberi peringatan jika terjadi input yang tidak wajar (misalnya selisih negatif atau terlalu ekstrem).
- Riwayat odometer per kendaraan tersimpan berurutan sehingga bisa dicek konsistensinya antar trip.

### 5.4 Riwayat & Laporan
- Riwayat seluruh trip per kendaraan dan per driver.
- Total km per kendaraan (harian/mingguan/bulanan).
- Ekspor laporan ke Excel/PDF.

### 5.5 Dashboard Monitoring
- Ringkasan status seluruh kendaraan (tersedia / sedang di luar) secara real-time.
- Statistik penggunaan armada (total trip, total km, rata-rata km per trip).
- Notifikasi jika kendaraan belum kembali melewati durasi wajar (opsional).

### 5.6 Notifikasi Perawatan Kendaraan
- Peringatan otomatis saat kendaraan mendekati batas km servis berkala.

## 6. Alur Proses (Flow) Trip

1. Kendaraan hendak keluar area → satpam membuka aplikasi di pos keamanan.
2. Satpam memilih kendaraan, mengisi nama driver/peminjam, tujuan, dan angka odometer saat itu → simpan sebagai **data keluar**. Status kendaraan berubah menjadi "di luar".
3. Kendaraan melakukan perjalanan dinas.
4. Saat kendaraan kembali, satpam memilih kendaraan yang berstatus "di luar", lalu input angka odometer saat masuk → simpan sebagai **data masuk**. Status kendaraan kembali menjadi "tersedia".
5. Sistem otomatis menghitung jarak tempuh (km) trip tersebut dari selisih odometer masuk dan keluar.
6. Data trip tersimpan dan dapat dilihat oleh admin/manajemen melalui dashboard.

## 7. Arsitektur Teknologi (Usulan)

| Komponen | Teknologi yang Diusulkan |
|---|---|
| Aplikasi Input Pos Satpam | Aplikasi web/mobile ringan, dioptimalkan untuk tablet atau PC di pos keamanan |
| Dashboard Admin | Aplikasi web berbasis browser |
| Backend/API | REST API |
| Database | Relasional (menyimpan data kendaraan, trip, user, odometer) |
| Perhitungan Jarak | Selisih odometer (masuk - keluar), tanpa ketergantungan pada GPS |
| Autentikasi | Login berbasis akun (role: satpam, admin, manajemen) |

## 8. Manfaat

- **Akurasi data**: jarak tempuh dihitung otomatis dari selisih odometer, mengurangi kesalahan hitung manual.
- **Kontrol terpusat**: pencatatan dilakukan di satu titik (pos keamanan) sehingga lebih mudah diawasi dan konsisten.
- **Transparansi**: seluruh aktivitas kendaraan dinas dapat dipantau.
- **Efisiensi**: mempermudah proses pelaporan dan audit penggunaan kendaraan.
- **Perawatan tepat waktu**: servis kendaraan dapat direncanakan berdasarkan data km aktual.
- **Akuntabilitas**: mendukung pengawasan penggunaan aset perusahaan.

## 9. Rencana Tahapan Pengembangan (Usulan)

| Tahap | Kegiatan | Estimasi Waktu |
|---|---|---|
| 1 | Analisis kebutuhan & desain sistem | 1-2 minggu |
| 2 | Pengembangan backend & database | 2-3 minggu |
| 3 | Pengembangan aplikasi mobile driver | 2-3 minggu |
| 4 | Pengembangan dashboard admin | 2-3 minggu |
| 5 | Testing & uji coba lapangan | 1-2 minggu |
| 6 | Pelatihan pengguna & go-live | 1 minggu |

## 10. Penutup

Dengan adanya Aplikasi Monitoring Kendaraan Dinas ini, diharapkan pengelolaan kendaraan operasional di PLN UPT Karawang menjadi lebih tertib, transparan, dan berbasis data, sehingga dapat mendukung efisiensi operasional serta pengambilan keputusan terkait pengelolaan armada kendaraan dinas.
