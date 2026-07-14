# Hoodwood

Warehouse administration website built with Next.js App Router, TypeScript, Tailwind CSS, Prisma ORM, and NextAuth credentials authentication.

## Features
- Dashboard with KPI cards, charts, and recent orders
- Supplier, seller, product, order, invoice, stock history, and reports modules
- Protected dashboard routes with NextAuth login
- Prisma database with seed data
- Barcode-enabled printable invoice and order letter views
- Bulk invoice printing workflow

## Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui-style components
- Prisma ORM + PostgreSQL (production) / SQLite (local legacy)
- NextAuth.js credentials provider
- Recharts, react-barcode, react-to-print

## Getting Started

### Windows (Sekali Klik)
1. Klik dua kali file `start-windows.bat` di root project.
2. Script akan otomatis:
	- membuat `.env` dari `.env.example` (jika belum ada),
	- install dependency,
	- generate Prisma client,
	- menjalankan migration,
	- seed database awal (hanya saat `prisma/dev.db` belum ada),
	- menjalankan dev server di `http://localhost:3000`.

Prasyarat:
- Node.js LTS sudah terinstall di Windows.

### Manual (Semua OS)
```bash
npm install
npm run db:setup
npm run db:seed
npm run dev
```

Open http://localhost:3000 and sign in with:
- admin@hoodwood.com / admin123
- staff@hoodwood.com / staff123

## Scripts
- `npm run dev` - start development server
- `npm run build` - production build
- `npm run netlify:build` - build for Netlify (generate Prisma client + migrate + Next.js build)
- `npm run start` - start production server
- `npm run lint` - run ESLint
- `npm run cap:sync` - sync web config/assets to Android project
- `npm run cap:open` - open Android Studio project
- `npm run apk:prepare` - build app and sync to Android project

## Reseller Mobile Order
- Reseller order page: `/reseller/order`
- Route tersebut dilindungi auth (login terlebih dahulu).

## Build APK (Android)
Prasyarat:
- Android Studio terbaru
- JDK 17 atau JDK 21 (hindari JDK 25 karena beberapa plugin Gradle Android belum kompatibel)

1. Install dependency project:
```bash
npm install
```
2. Set URL server aplikasi yang akan dibuka oleh Android WebView:
```bash
export CAP_SERVER_URL="https://your-domain.com"
```
3. Sync project Android:
```bash
npm run cap:sync
```
4. Buka Android Studio:
```bash
npm run cap:open
```
5. Di Android Studio pilih menu `Build > Build Bundle(s) / APK(s) > Build APK(s)`.

## Release Signing (Play Store)
Project ini sudah disiapkan untuk signing release lewat file lokal `android/key.properties`.

Format file:
```properties
STORE_FILE=keystore/hoodwood-upload.jks
STORE_PASSWORD=your_store_password
KEY_ALIAS=hoodwood_upload
KEY_PASSWORD=your_key_password
```

Yang sudah tersedia di repo:
- Template: `android/key.properties.example`
- Konfigurasi Gradle release signing: `android/app/build.gradle`

Untuk build release signed:
```bash
cd android
./gradlew assembleRelease
./gradlew bundleRelease
```

Output Play Store (AAB) ada di:
- `android/app/build/outputs/bundle/release/app-release.aab`

Catatan:
- Folder `android/` sudah disiapkan di repository ini.
- Jika ingin test lokal via HTTP, gunakan URL host yang dapat diakses perangkat Android dan pastikan `CAP_SERVER_URL` memakai `http://...`.

## Environment
Copy `.env.example` to `.env` and adjust values as needed.

## Deploy Gratis ke Internet (Netlify + Neon)

Gunakan kombinasi ini agar website online gratis dan data tetap persisten:
- Hosting: Netlify Free
- Database: Neon Free (PostgreSQL)

### 1) Buat database PostgreSQL gratis
1. Buat akun di Neon dan buat project baru.
2. Salin connection string PostgreSQL (pooled URL disarankan).

### 2) Siapkan environment variables di Netlify
Di Site settings > Environment variables, isi:
- `DATABASE_URL` = connection string Neon
- `NEXTAUTH_SECRET` = string acak panjang (minimal 32 karakter)
- `NEXTAUTH_URL` = URL Netlify kamu (contoh: `https://your-site-name.netlify.app`)

### 3) Connect repo ke Netlify
1. Login Netlify.
2. Pilih Add new site > Import an existing project.
3. Pilih GitHub repo ini.
4. Netlify akan membaca `netlify.toml` otomatis:
	- Build command: `npm run netlify:build`

### 4) Deploy pertama
1. Jalankan deploy.
2. Setelah sukses, buka URL `*.netlify.app`.
3. Jika ingin data contoh, jalankan seed ke database production secara manual dari mesin lokal:
```bash
DATABASE_URL="postgresql://..." npm run db:seed
```

### Catatan penting
- SQLite lokal tidak dipakai untuk deployment Netlify production.
- Untuk custom domain, bisa ditambahkan di Netlify Domain management (tetap bisa di paket gratis).
