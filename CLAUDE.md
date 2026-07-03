# CLAUDE.md - Is Takip Kanban Projesi

Bu dokuman, Claude Code veya benzeri AI destekli gelistirme aracinin projeyi dogru sekilde uretmesi icin hazirlanmistir.

## 1. Proje Ozeti

Proje adi: **Is Takip**

Amac: Kullanicinin islerini, notlarini ve projelerini surecler arasinda yonetebilecegi sade, responsive ve kullanimi kolay bir Kanban tabanli web uygulamasi gelistirmek.

Uygulama, kullanicinin kendi sureclerini olusturmasina, surec renklerini secmesine, kartlari surecler arasinda surukle-birak ile tasimasina ve tamamlanan kartlari belirli bir sure sonra otomatik arsivlemesine izin vermelidir.

Referans tasarim mantigi: Gonderilen ekran goruntusundeki gibi sade, yatay kolonlu, yumusak renkli, kart tabanli bir is takip ekrani.

## 2. Teknoloji Stack

Projeyi asagidaki teknolojilerle gelistir:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite
- dnd-kit
- Zod
- React Hook Form
- Lucide React ikonlari

Opsiyonel UI yaklasimi:

- shadcn/ui kullanilabilir.
- Ancak tasarim fazla agir olmamali. Basit, sade ve hizli bir arayuz tercih edilmeli.

## 3. Genel Tasarim Yaklasimi

Arayuz, kullanicinin paylastigi ekran goruntusune benzer olmali:

- Acik renkli arka plan
- Yumusak pastel kolon renkleri
- Yuvarlatilmis kartlar
- Ince border kullanimi
- Minimal ikonlar
- Fazla kalabalik olmayan sade layout
- Kolon basliklarinda durum adi, kart sayisi ve aksiyon butonlari
- Kartlarda baslik, kisa aciklama ve durum bilgisi
- Mobilde yatay kaydirilabilir Kanban alani
- Desktopta genis yatay Kanban gorunumu

Tasarim cok kurumsal veya karmasik olmamali. Basit, temiz, hizli ve kullanisli olmali.

## 4. Ana Ozellikler

### 4.1 Surec Yonetimi

Kullanici surec ekleyebilmeli, duzenleyebilmeli ve silebilmelidir.

Her surec icin asagidaki alanlar olmali:

- Surec adi
- Arka plan rengi
- Baslik/etiket rengi
- Siralama degeri
- Tamamlandi sureci olup olmadigi

Kullanici yeni bir surec olustururken renk secebilmelidir. Renk secimi basit bir renk paleti veya color input ile yapilabilir.

Varsayilan surecler:

1. Yeni
2. Sorulacak
3. Haber Bekliyor
4. Devam Ediyor
5. Tamamlandi

Varsayilan renkler pastel tonlarda olmali.

### 4.2 Kart / Not Yonetimi

Kullanici her surecin icine kart ekleyebilmelidir.

Kart alanlari:

- Baslik
- Aciklama
- Surec
- Sira
- Oncelik: dusuk, normal, yuksek
- Olusturulma tarihi
- Guncellenme tarihi
- Tamamlanma tarihi
- Arsivlenme tarihi

Kartlar ayni surec icinde siralanabilmeli ve farkli surecler arasinda surukle-birak ile tasinabilmelidir.

Kart bir tamamlandi surecine tasindiginda `completedAt` otomatik atanmalidir.

Kart tamamlandi surecinden baska bir surece geri tasinirsa `completedAt` ve `archiveAt` temizlenmelidir.

### 4.3 Tamamlanan Kartlari Arsivleme

Tamamlanan kartlar silinmemelidir. Kart gorunmez hale gelmeli ama veritabaninda tutulmalidir.

Varsayilan ayar:

- Tamamlanan kartlar 3 gun sonra otomatik arsivlenir.

Mantik:

- Kart tamamlandi surecine tasininca `completedAt` atanir.
- `archiveAt = completedAt + completedTaskRetentionDays` olarak hesaplanir.
- Uygulama acildiginda veya server action/API cagrilarinda suresi gecen kartlar kontrol edilir.
- `archiveAt <= now` olan ve henuz arsivlenmemis kartlara `archivedAt` atanir.
- Arsivlenmis kartlar ana Kanban ekraninda gorunmez.
- Arsiv ekraninda gorunebilir.

Kullanici ayarlardan bekleme suresini degistirebilmelidir.

### 4.4 Arsiv Ekrani

Arsivlenmis kartlar icin basit bir ekran olustur:

- Arsivlenen kartlari listele
- Kart basligi, eski sureci, tamamlanma tarihi ve arsivlenme tarihi gorunsun
- Kart geri yuklenebilsin
- Geri yuklenen kart varsayilan olarak `Yeni` surecine alinsin veya kullanici surec secebilsin

### 4.5 Ice Aktar / Disa Aktar

Veri aktarimi icin en sorunsuz ve stabil secenek **JSON** olarak uygulanmalidir.

Excel destegi ileride eklenebilir, ancak ilk surumda JSON tercih edilmelidir. JSON daha az hata riski tasir, veri tiplerini daha temiz korur ve uygulama yedekleme/geri yukleme icin daha uygundur.

Disa aktar:

- Tum surecler
- Tum kartlar
- Ayarlar
- Arsivlenmis kartlar dahil

Ice aktar:

- JSON dosyasi yuklenir
- Zod ile dogrulanir
- Gecerli veri ise ice aktarilir
- Ice aktarimdan once kullaniciya uyari gosterilir
- Var olan verilerin uzerine yazma veya verileri birlestirme secenegi sunulabilir

Ilk MVP icin:

- Disa aktar: `backup.json`
- Ice aktar: Mevcut verilerin uzerine yazma secenegi

Excel destegi eklenirse daha sonra sadece disa aktarim icin eklenebilir.

### 4.6 Arama ve Filtreleme

Ana ekranda basit arama olmali:

- Kart basliginda ara
- Kart aciklamasinda ara

Filtreler:

- Oncelik filtresi
- Arsivlenmisleri gosterme/gizleme sadece Arsiv ekraninda

### 4.7 Ayarlar

Ayarlar ekraninda sunlar olmali:

- Tamamlanan kartlar kac gun sonra arsivlensin?
- Varsayilan: 3 gun
- Minimum: 1 gun
- Maksimum: 365 gun
- JSON disa aktar
- JSON ice aktar

## 5. Sayfa Yapisi

Asagidaki route yapisini kullan:

```txt
/
/settings
/archive
```

### `/`

Ana Kanban ekrani.

Icerik:

- Ust baslik: Is Takip
- Kisa aciklama: Islerini surecler arasinda takip et.
- Sekme veya linkler: Kanban, Arsiv, Ayarlar
- Arama alani
- Surec ekleme butonu
- Yatay Kanban alani

### `/settings`

Ayarlar ve ice/disa aktar ekrani.

### `/archive`

Arsivlenmis kartlarin listelendigi ekran.

## 6. Veritabani Semasi

Prisma ve SQLite kullan.

Onerilen schema:

```prisma
model Process {
  id                 String   @id @default(cuid())
  name               String
  columnColor         String   @default("#F8FAFC")
  badgeColor          String   @default("#E2E8F0")
  order              Int
  isCompletedProcess Boolean  @default(false)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  tasks              Task[]
}

model Task {
  id          String    @id @default(cuid())
  title       String
  description String?
  priority    Priority  @default(NORMAL)
  order       Int

  processId   String
  process     Process   @relation(fields: [processId], references: [id], onDelete: Cascade)

  completedAt DateTime?
  archiveAt   DateTime?
  archivedAt  DateTime?

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum Priority {
  LOW
  NORMAL
  HIGH
}

model Setting {
  id                         String   @id @default("default")
  completedTaskRetentionDays Int      @default(3)
  createdAt                  DateTime @default(now())
  updatedAt                  DateTime @updatedAt
}
```

## 7. API / Server Action Mantigi

Next.js Server Actions veya Route Handlers kullanilabilir. Kod temizligi icin server actions tercih edilebilir.

Gerekli islemler:

### Process islemleri

- Listele
- Olustur
- Duzenle
- Sil
- Sirala

### Task islemleri

- Listele
- Olustur
- Duzenle
- Sil
- Surec degistir
- Sira degistir
- Arsivden geri al

### Settings islemleri

- Ayarlari getir
- Ayarlari guncelle

### Import / Export islemleri

- JSON export
- JSON import

## 8. Surukle-Birak Kurallari

`dnd-kit` kullan.

Desteklenecek islemler:

- Karti ayni kolon icinde siralama
- Karti farkli kolona tasima
- Tasima sonrasi order degerlerini yeniden hesaplama
- Kart tamamlandi kolonuna tasindiginda completedAt ve archiveAt alanlarini set etme
- Kart tamamlandi kolonundan cikarildiginda completedAt ve archiveAt alanlarini temizleme

Surukle-birak tamamlandiktan sonra veritabani guncellenmelidir.

## 9. Otomatik Arsivleme Mantigi

`lib/archive.ts` icinde yardimci fonksiyon olustur:

```ts
export async function archiveExpiredCompletedTasks() {
  // archiveAt zamani gecmis ve archivedAt null olan kartlari bul
  // archivedAt alanini now olarak guncelle
}
```

Bu fonksiyon:

- Ana sayfa yuklenirken
- Task islemlerinden once veya sonra
- Ayarlar degistiginde

calistirilabilir.

Cron gerekli degil. MVP icin uygulama kullanildiginda kontrol edilmesi yeterlidir.

## 10. JSON Export Formati

Disa aktarilan JSON su yapida olmali:

```json
{
  "version": 1,
  "exportedAt": "2026-01-01T00:00:00.000Z",
  "settings": {
    "completedTaskRetentionDays": 3
  },
  "processes": [],
  "tasks": []
}
```

Import yaparken:

- `version` kontrol et
- settings dogrula
- processes dogrula
- tasks dogrula
- Hata varsa kullaniciya anlasilir mesaj goster

## 11. Responsive Kurallar

Desktop:

- Kolonlar yatay dizilmeli
- Kanban alani yatay scroll desteklemeli
- Kartlar kolon genisligine sigmali

Tablet:

- Kolon genislikleri korunmali
- Yatay scroll aktif olmali

Mobil:

- Ust alan sade olmali
- Kolonlar yatay kaydirilabilir olmali
- Kart ekleme ve surec ekleme butonlari kolay erisilebilir olmali
- Modal/drawer ekran genisligine uygun acilmali

## 12. Component Onerisi

```txt
components/
  app-header.tsx
  kanban-board.tsx
  kanban-column.tsx
  task-card.tsx
  task-dialog.tsx
  process-dialog.tsx
  color-picker.tsx
  search-filter.tsx
  settings-form.tsx
  import-export-panel.tsx
  archive-list.tsx

lib/
  prisma.ts
  archive.ts
  export-import.ts
  validations.ts
  utils.ts

actions/
  process-actions.ts
  task-actions.ts
  settings-actions.ts
  import-export-actions.ts
```

## 13. UI Detaylari

Kolon gorunumu:

- Kolon basligi renkli badge gibi gorunmeli
- Kart sayisi baslik yaninda olmali
- Kolon arka plani kullanicinin sectigi renge gore belirlenmeli
- Kolon altinda `+ Yeni kart` butonu olmali

Kart gorunumu:

- Beyaz veya cok acik arka plan
- Hafif border
- 12-16px border radius
- Hover durumunda hafif golge
- Baslik kalin olmali
- Aciklama varsa 2 satira kadar gorunmeli
- Oncelik icin kucuk etiket kullanilabilir

## 14. Baslangic Verileri

Ilk kurulumda veritabani bos ise varsayilan surecleri ve ayarlari otomatik olustur.

Varsayilan surecler:

```txt
Yeni - #F3F4F6
Sorulacak - #FFF7ED
Haber Bekliyor - #FEFCE8
Devam Ediyor - #EFF6FF
Tamamlandi - #ECFDF5
```

## 15. AI Kalite Kontrol ve Test Talimatlari

Her ozellik tamamlandiktan sonra AI asagidaki kontrolleri yapmadan isi tamamlandi saymamalidir.

### Zorunlu kontroller

```bash
npm run lint
npm run build
```

Varsa test komutu:

```bash
npm run test
```

### Manuel kontrol listesi

- Ana sayfa aciliyor mu?
- Varsayilan surecler olusuyor mu?
- Yeni surec ekleniyor mu?
- Surec rengi secilebiliyor mu?
- Kart ekleniyor mu?
- Kart duzenleniyor mu?
- Kart siliniyor mu?
- Kart surecler arasinda tasiniyor mu?
- Kart ayni surec icinde siralaniyor mu?
- Tamamlandi surecine tasinan kart icin completedAt ve archiveAt set ediliyor mu?
- Tamamlandi surecinden cikarilan kart icin completedAt ve archiveAt temizleniyor mu?
- Arsiv suresi dolan kart ana ekrandan gizleniyor mu?
- Arsiv ekraninda kart gorunuyor mu?
- Arsivden geri alma calisiyor mu?
- JSON disa aktar calisiyor mu?
- JSON ice aktar dogru calisiyor mu?
- Responsive mobil gorunum bozuluyor mu?
- Build hatasiz tamamlandi mi?

### AI davranis kurali

AI, kod yazdiktan sonra kendi urettigi dosyalari gozden gecirmeli ve potansiyel hatalari duzeltmelidir. Lint veya build hatasi varken gorevi tamamlandi olarak raporlamamalidir.

## 16. Kabul Kriterleri

Proje tamamlanmis sayilmasi icin:

- Next.js uygulamasi calisir durumda olmali
- SQLite veritabani calismali
- Surecler dinamik olarak yonetilebilmeli
- Surec rengi secilebilmeli
- Kartlar eklenebilmeli, duzenlenebilmeli, silinebilmeli
- Kartlar surukle-birak ile surecler arasinda tasinabilmeli
- Tamamlanan kartlar varsayilan 3 gun sonra otomatik arsivlenmeli
- Arsivlenen kartlar ana ekranda gorunmemeli
- Arsiv ekraninda gorunmeli ve geri alinabilmeli
- JSON export/import calismali
- Tasarim sade, responsive ve referans goruntuye benzer olmali
- `npm run lint` ve `npm run build` hatasiz calismali

## 17. Gelistirme Sirasi

1. Next.js projesini kur
2. Tailwind CSS ve temel layoutu ayarla
3. Prisma + SQLite kurulumunu yap
4. Schema dosyasini olustur
5. Varsayilan seed mantigini ekle
6. Ana Kanban UI componentlerini olustur
7. Process CRUD islemlerini ekle
8. Task CRUD islemlerini ekle
9. dnd-kit ile surukle-birak ekle
10. Tamamlandi ve arsivleme mantigini ekle
11. Arsiv ekranini ekle
12. Ayarlar ekranini ekle
13. JSON export/import ozelligini ekle
14. Responsive duzenlemeleri yap
15. Lint, build ve AI kalite kontrol listesini calistir

## 18. Notlar

- Uygulama tek kullanicili yerel proje olarak dusunulmelidir.
- Authentication ilk surumda gerekli degildir.
- JSON veri aktarimi ilk surum icin yeterlidir.
- Excel daha sonra opsiyonel olarak eklenebilir.
- Veri silmek yerine arsivlemek ana davranis olmalidir.
- UI, referans goruntudeki gibi sade ve is odakli olmalidir.
