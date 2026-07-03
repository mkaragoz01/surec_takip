# İş Takip

Sade, hızlı ve tek kullanıcılı bir Kanban iş takip uygulaması. Süreçlerini (kolonları) kendin tanımla, kartları sürükle-bırak ile taşı, tamamlanan işler otomatik olarak arşivlensin.

Next.js App Router, TypeScript, Tailwind CSS, Prisma + SQLite ve `dnd-kit` ile geliştirildi.

## Özellikler

- **Dinamik süreç yönetimi** — sınırsız sayıda süreç (kolon) oluştur, adını ve rengini düzenle, sil
- **Sürükle-bırak** — kartları aynı kolon içinde sırala veya farklı kolonlara taşı; kolonları da sürükleyerek yeniden sırala; akıcı animasyonlu `DragOverlay` ile
- **Otomatik arşivleme** — bir kart "tamamlandı" tipi bir sürece taşınınca `completedAt` atanır; ayarlanabilir bir süre (varsayılan 3 gün) sonra kart otomatik arşivlenir ve ana tahtadan kaybolur, silinmez
- **Arşiv ekranı** — arşivlenen kartları görüntüle, istediğin sürece geri yükle
- **Arama ve öncelik filtresi** — başlık/açıklamada anlık arama, düşük/normal/yüksek önceliğe göre filtreleme
- **JSON yedekleme** — tüm süreçleri, kartları ve ayarları tek dosyaya dışa aktar; aynı formatta geri yükle (Zod ile doğrulanır)
- **Sade, duyarlı (responsive) tasarım** — pastel renkli, içeriğe göre boy veren kolonlar; mobilde yatay kaydırma

## Teknoloji

| Katman | Kullanılan |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions) |
| Dil | TypeScript |
| Stil | Tailwind CSS v4 |
| Veritabanı | SQLite + Prisma ORM |
| Sürükle-bırak | `@dnd-kit` |
| Form & doğrulama | React Hook Form + Zod |
| İkonlar | Lucide React |

## Başlarken

### Gereksinimler

- Node.js 20+
- npm

### Kurulum

```bash
git clone https://github.com/mkaragoz01/surec_takip.git
cd surec_takip
npm install
```

`npm install` sonrasında Prisma Client otomatik üretilir (`postinstall` script'i). Veritabanını oluşturmak için:

```bash
npx prisma migrate deploy
```

Ardından geliştirme sunucusunu başlat:

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresini aç. Uygulama ilk açılışta varsayılan 5 süreci (Yeni, Sorulacak, Haber Bekliyor, Devam Ediyor, Tamamlandı) ve varsayılan ayarları otomatik oluşturur.

### Ortam değişkenleri

`.env` dosyası repoya dahil değildir (bkz. `.gitignore`). Kendi `.env` dosyanı oluştur:

```bash
DATABASE_URL="file:./dev.db"
```

## Kullanılabilir komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusunu başlatır (Turbopack) |
| `npm run build` | Production build alır |
| `npm run start` | Production build'i çalıştırır |
| `npm run lint` | ESLint kontrolü yapar |
| `npx prisma migrate dev` | Şema değişikliği sonrası yeni migration oluşturur |
| `npx prisma studio` | Veritabanını tarayıcıda görüntülemek için |

## Proje yapısı

```
app/
  page.tsx              Ana Kanban ekranı
  archive/page.tsx       Arşiv ekranı
  settings/page.tsx      Ayarlar (arşiv süresi, JSON yedekleme)
  layout.tsx             Kök layout + üst başlık
  globals.css            Global stiller

components/
  kanban-board.tsx        Sürükle-bırak mantığı (dnd-kit), arama/filtre, dialoglar
  kanban-column.tsx        Tek bir süreç kolonu
  task-card.tsx            Kart görünümü
  process-dialog.tsx       Süreç ekle/düzenle formu (renk seçici dahil)
  task-dialog.tsx          Kart ekle/düzenle formu
  archive-list.tsx         Arşiv tablosu + geri yükleme
  settings-form.tsx        Arşiv süresi ayarı
  import-export-panel.tsx  JSON dışa/içe aktarma
  app-header.tsx           Üst navigasyon
  search-filter.tsx        Arama + öncelik filtresi
  color-picker.tsx         Süreç rengi seçici (preset + özel renk)

actions/                  Next.js Server Actions (process/task/settings/import-export CRUD)

lib/
  prisma.ts               Prisma client singleton
  seed.ts                 Varsayılan süreç/ayar oluşturma
  archive.ts              Süresi dolan kartları arşivleme mantığı
  export-import.ts         JSON yedekleme okuma/yazma
  validations.ts           Zod şemaları
  types.ts                 Paylaşılan tipler
  utils.ts                 Genel yardımcı fonksiyonlar

prisma/schema.prisma      Veritabanı şeması (Process, Task, Setting)
```

## Veri modeli

- **Process** — bir kolon: ad, kolon/rozet rengi, sıra, `isCompletedProcess` bayrağı
- **Task** — bir kart: başlık, açıklama, öncelik, sıra, bağlı olduğu `Process`, `completedAt` / `archiveAt` / `archivedAt` zaman damgaları
- **Setting** — tekil ayar kaydı: `completedTaskRetentionDays` (tamamlanan kartın kaç gün sonra arşivleneceği)

Arşivleme mantığı her sayfa yüklemesinde çalışır: `archiveAt` zamanı geçmiş ve henüz arşivlenmemiş kartlar otomatik olarak arşivlenir; veri silinmez, sadece ana tahtadan gizlenir.

## Notlar

- Tek kullanıcılı, kimlik doğrulama (authentication) içermeyen yerel bir proje olarak tasarlanmıştır.
- Prisma bilinçli olarak `6.x` sürümüne sabitlenmiştir (Prisma 7, `datasource` yapılandırmasını driver adaptörlerine taşıdığı için bu basit SQLite kurulumuyla uyumlu değildir).
