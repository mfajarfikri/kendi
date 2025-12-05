# UX Enhancement Guide

## Alur Pengguna
- Tambah Trip: pilih kendaraan, isi detail, unggah foto, simpan → toast sukses → navigasi otomatis 3 detik atau manual "Lanjutkan"
- Tutup Trip: isi km akhir, unggah foto kembali, simpan → toast sukses → detail

## Navigasi
- Aksi inti melalui tombol jelas; dropdown pada tabel untuk aksi per baris

## Feedback
- Toast interaktif (tema colored, top-center, 4 detik), status loading, fokus ring saat input aktif

## Kinerja
- Headless UI untuk aksesibilitas, transisi ringan, minim repaint

## Aksesibilitas
- ARIA label pada komponen interaktif, keyboard navigation, kontras warna, ukuran font minimal text-base

## I18n
- Teks UI konsisten bahasa Indonesia, siap diekstrak ke file i18n
