# İş Takip

Sade, hızlı ve tek kullanıcılı bir Kanban iş takip uygulaması.

Süreçlerini kendin oluşturabilir, kartları sürükle-bırak ile taşıyabilir ve tamamlanan işleri otomatik olarak arşivleyebilirsin.

## Özellikler

* Dinamik süreç/kolon yönetimi
* Kartları ve kolonları sürükle-bırak ile sıralama
* Tamamlanan kartları belirlenen süre sonunda otomatik arşivleme
* Arşivlenen kartları görüntüleme ve geri yükleme
* Başlık/açıklama araması
* Öncelik filtresi
* JSON yedekleme ve geri yükleme
* Mobil uyumlu sade arayüz

## Teknolojiler

* Next.js App Router
* TypeScript
* Tailwind CSS
* Prisma
* SQLite
* dnd-kit
* React Hook Form
* Zod

## Kurulum

Projeyi indir:

```bash
git clone https://github.com/mkaragoz01/surec_takip.git
cd surec_takip
npm install
```

`.env` dosyası oluştur:

```bash
DATABASE_URL="file:./dev.db"
```

Veritabanını hazırla:

```bash
npx prisma migrate deploy
```

Projeyi çalıştır:

```bash
npm run dev
```

Ardından tarayıcıdan aç:

```bash
http://localhost:3000
```

İlk açılışta varsayılan süreçler ve ayarlar otomatik oluşturulur.

## Komutlar

| Komut               | Açıklama                       |
| ------------------- | ------------------------------ |
| `npm run dev`       | Geliştirme ortamını başlatır   |
| `npm run build`     | Production build alır          |
| `npm run start`     | Production ortamını çalıştırır |
| `npm run lint`      | Kod kontrolü yapar             |
| `npx prisma studio` | Veritabanını görüntüler        |

## Proje Yapısı

```txt
app/          Sayfalar ve layout
components/   Arayüz bileşenleri
actions/      Server Actions
lib/          Yardımcı fonksiyonlar
prisma/       Veritabanı şeması
```

## Veri Modeli

Uygulama temel olarak 3 yapıdan oluşur:

* **Process:** Kanban kolonları
* **Task:** İş kartları
* **Setting:** Uygulama ayarları

Tamamlanan kartlar silinmez. Belirlenen süre sonunda otomatik olarak arşive taşınır.

## Not

Bu proje tek kullanıcılı ve yerel kullanım odaklıdır. Kimlik doğrulama içermez.
