# Monolithic Kopi

Website statis untuk menu, informasi kedai, lokasi, dan cerita pelanggan. Tidak memerlukan proses build.

## Menjalankan lokal

Jalankan `python -m http.server 8000` dari direktori proyek, lalu buka http://localhost:8000. Gunakan server HTTP; membuka index.html langsung lewat file:// dapat menggagalkan pemuatan JSON.

## Alur pengunjung

- Pilih kategori menu dengan klik atau tombol panah, Home, dan End.
- Pesanan, pertanyaan harga, dan reservasi diteruskan ke WhatsApp. Tidak ada pembayaran atau konfirmasi reservasi otomatis.
- Formulir memvalidasi cerita 20–500 karakter, kemudian membuka pesan WhatsApp. Pengunjung masih perlu menekan Kirim di WhatsApp. Website tidak dapat memeriksa apakah pesan sudah terkirim dan tidak menghapus isian otomatis.
- Pilihan sembunyikan nama berlaku untuk publikasi website; nomor pengirim tetap terlihat di WhatsApp.
- Tim meninjau cerita secara manual, lalu menambahkan cerita yang disetujui ke `data/stories.json` dan menerbitkan ulang website. Tidak ada backend atau panel admin.

## Mengubah konten

Menu, lokasi, jam buka, dan tautan kontak berada di `index.html`. Nomor WhatsApp formulir juga ada di `script.js`. Data cerita berupa array objek dengan `name`, `text`, dan `date` (string). Gunakan `[]` jika belum ada cerita yang disetujui. Pastikan informasi kedai dan izin publikasi cerita sesuai sebelum penerbitan.

## Verifikasi

`node --check script.js` memeriksa sintaks JavaScript.

`test-flows.cjs` menguji alur menggunakan Playwright dan Edge headless. Instal Playwright di lingkungan pengujian atau set `PLAYWRIGHT_PATH` ke modul yang tersedia, lalu jalankan `node test-flows.cjs`. Opsional: set `BROWSER_PATH` untuk executable Chromium lain. Pengujian memakai server lokal sementara, tidak mengirim pesan WhatsApp, dan menghasilkan screenshot desktop/mobile.
