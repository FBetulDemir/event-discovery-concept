# Gänget: durum ve sayfa sayfa inceleme

Eralp'in incelemesi için Türkçe yazıldı (repo dokümanlarının geri kalanı İngilizce). Güncelleme: 2026-10-18, ikinci tur. Branch: `feat/design-system` (PR1 `feat/backend-foundation` üzerine yığılı; ikisi de push'lanmadı).

Ekran görüntüleri gerçek tarayıcıda, gerçek Supabase veritabanı ve gerçek Ticketmaster verisiyle, **arkadaşları olan bir senaryoda** alındı. Test kullanıcıları ve planları silindi.

## 1. Hüküm

Önceki turdaki hüküm "bitmedi, çekirdek döngü çalışıyor ama sosyal katman yok" idi. Bu turda sosyal katmanın büyük kısmı geldi: davetli akışı, zengin plan odası, yorum thread'i + tepkiler, hesap (e-posta ile giriş). **Hâlâ bitmedi**: e-posta ile girişin gerçek kullanıcıya ulaşması için sizin yapacağınız panel ayarları var, arkadaş listesi ve bildirimler yok, İngilizce yok, ikinci etkinlik kaynağı yok. Aşağıda her şey ayrıntılı.

## 2. Ne yapıldı, ne kaldı

| Alan | Durum | Not |
|---|---|---|
| Marka, tasarım sistemi, `/design` galerisi, koyu/açık tema + **tema düğmesi** | ✅ | |
| Ön sayfa | ✅ | Birincil eylem artık **iki tane**: "Hitta kvällen" ve **"Samla gänget"** (plan kur). Ruh hali seçilince buton "Visa dansa-kvällar" olur ve **doğrudan sonuçlara** götürür. |
| Match (3 adım + sonuç) | ⚠️ | Çalışıyor; bütçe adımı fiyat verisi olmadığı için hâlâ anlamsız. |
| Etkinlik sayfası | ✅ | **Fler tillfällen** (aynı gösterinin diğer tarihleri) ve **yorumlar** eklendi. |
| **Davetli akışı** | ✅ | Davetli planın adını, tarihini, kimlerin olduğunu ve **seçenekleri** görür; favorisini seçip adını yazınca katılır ve **oyu atılır**. |
| **Plan odası** | ✅ | Üyeler ve **kimin oy verdiği**, kartlarda "Röstat av …", plan **tarihi**, odadan **etkinlik ekleme**, plan adı/tarihi düzenleme, karar sonrası "Så röstade ni", **gruba kopyalanabilir mesaj**. |
| **Yorumlar** (FB tarzı) | ✅ | Plan ve etkinlik thread'i, **iki seviye cevap**, 5 tepki (ikonlarla), silme (yazar/organizatör), raporlama, hız sınırı, canlı güncelleme. |
| **Giriş / hesap** | ⚠️ | `/konto` sayfası ve header'da "Logga in" var; e-postayla şifresiz giriş ve **misafiri hesaba yükseltme** (planlar ve oylar kalır) kodlandı. **E-postanın size ulaşması için Supabase panelinde 2 ayar gerekiyor** (aşağıda). Uçtan uca denenmedi. |
| Planlar listesi | ✅ | Küçük resim, tarih, kişi sayısı, "Du har röstat / Din röst saknas", oy sayısı. |
| Katalog kalitesi | ✅ | Tekrar eden gösteriler tek kart (`+N datum`), 20 km dışı elendi, açıklamalardan URL temizlendi, uzak tarihler "31 dec" diye yazılır. |
| Arkadaş listesi | ❌ | Yok. |
| Bildirimler (oy verdi, plan kapandı) | ❌ | Yok (canlı güncelleme sadece sayfa açıkken). |
| İngilizce + dil düğmesi | ❌ | Sıranın sonunda. |
| Harici etkinlikler | ⚠️ | Sadece Ticketmaster; Göteborg & Co yok (anahtar yok). Fiyat yok. |
| Güvenlik (RLS, RPC'ler) | ✅ | İki SQL testi geçti (plan kuralları + yorumlar). Anonim giriş açık, CAPTCHA yok. |
| Erişilebilirlik / çeviri / performans denetimi | ⚠️ | Skill lint 0 hata; gerçek klavye/ekran okuyucu denemesi yapılmadı. |

### Sizin yapmanız gerekenler (kodla çözülemez)

Supabase panelinde (`docs/BACKEND.md` → "Sign-in (email) setup"):
1. **Authentication → URL Configuration:** Site URL ve Redirect URL'lere `http://localhost:3000/konto`, canlı adres `/konto` ekleyin.
2. **Authentication → SMTP Settings:** kendi SMTP'nizi bağlayın. Varsayılan Supabase posta servisi **sadece proje ekibindeki adreslere** gönderir ve saatte birkaç e-postayla sınırlıdır; arkadaşlarınız bağlantıyı alamaz. Sadece siz test edecekseniz bu adım zorunlu değil.

## 3. Bu turda bulunan ve düzeltilen hatalar

1. **Yorumlar hiç görünmüyordu** (ilişki belirsizliği; hata sessizce "yorum yok" gibi görünüyordu). Düzeltildi, artık hata olursa kullanıcıya söyleniyor.
2. **Plan listesi boş geliyordu** aynı türden hatayla. Düzeltildi.
3. **"torsdag" yazıyordu, oysa tarih 31 aralık:** 6 günden uzak etkinliklerde artık tarih yazıyor.
4. Lint: tepkilerde emoji vardı (tasarım kuralı yasaklıyor). Sistem ikonlarına çevrildi.
5. Önceki tur: Ä noktaları, plan kartı etiketi, stilsiz 404, tema düğmesi.

Açık kalan küçük şeyler:
- `Skicka`/`Gå med` gibi düğmeler boşken soluk (devre dışı hali). Kullanılabilir ama bozuk gibi durabilir.
- Etkinlik açıklamaları satıcının dilinde (çoğu İngilizce).
- Katalog: Kungsbacka gibi yerler elendi; bu bilinçli (20 km), ama "Göteborg" tanımını sizin onaylamanız gerekir.

## 4. Dürüst değerlendirme (güncel)

**Amacı taşıyor mu?** Daha iyi. Ön sayfada artık "Samla gänget" eylemi var ve plan odası bir grup aracı gibi davranıyor: kim oy verdi, ne zaman, ne konuşuyorlar. Hâlâ eksik: ilk ekran hâlâ keşif ağırlıklı, grup fikrini anlatan bir örnek yok.

**İçerik yeterli mi?** Düşündüğümden iyi çıktı ama hâlâ sınırlı. "Dansa" seçince **gerçek kulüp geceleri** geliyor (Push, BARDOT, Köket yılbaşı geceleri), yani katalogda kulüp var; sadece ilk 90 günün başında değiller. Zayıf yanlar: tek kaynak, fiyat yok, çoğu etkinlik arena konseri.

**Geri dönüş sebebi var mı?** Bir kısmı: yorumlar ve canlı oylama bir grubu plan sürecinde tutar. Eksik: bildirim (oyu kim verdi, plan kapandı), arkadaş listesi ve e-posta ile hesap bağlantısı gerçek kullanıcıya ulaşmadıkça misafirlik riski sürer.

## 5. Sıradaki plan

| Sıra | İş | Durum |
|---|---|---|
| 1 | Davetli akışı, ön sayfada plan eylemi | ✅ |
| 2 | Plan odası zenginliği | ✅ |
| 3 | Hesap | ⚠️ kod hazır, panel ayarları sizde |
| 4 | İçerik kalitesi | ✅ ilk tur; ikinci kaynak ve fiyat dürüstlüğü açık |
| 5 | Yorumlar | ✅; **bildirimler** açık |
| 6 | Arkadaşlar | ❌ |
| 7 | İngilizce + dil düğmesi | ❌ |

## 6. Senaryo

Pazar akşamı, bir arkadaş grubu cuma için plan yapıyor:
- **Elif** (organizatör), **Mert**, **Selin**, **Can** arkadaşları, **Deniz** sonradan link alan davetli.
- **"Fredag kväll"** (fredag 23 oktober): AMON AMARTH, EUROPE, GLAMORAMA; Elif ve Mert Amon Amarth'a, Selin Europe'a oy verdi; yorumlar ve tepkiler var. Deniz linke tıklıyor, favorisini (EUROPE) seçip katılıyor; sonra bir yorum yazıp **odadan** "WINTHER COUNTRY FESTIVAL" ekliyor.
- **"Lördag på Park Lane"**: kapanmış, kazanan GLAMORAMA.
- **"Stand-up och öl"**: 1–1 beraberlik.

## 7. Sayfa sayfa

Masaüstü 1280 px, çoğunda mobil 390 px. Uzun sayfalar tam sayfa.

### 01. Ön sayfa
Masaüstü: ![](review/01-startsida-desktop.jpg)
Mobil: ![](review/01-startsida-mobil.jpg)
Açık tema ilk ekran: ![](review/01-startsida-ljust-forsta-skarmen.jpg)
Ruh hali seçilmiş (buton "Visa dansa-kvällar", yanında **Samla gänget**): ![](review/01-startsida-hero-humor-vald.jpg)

Elif bir ruh hali seçer, hero'daki etkinlik değişir, tek tuşla o ruh haline uyan üç öneriye gider, ya da "Samla gänget" ile plan kurar. Sorun: sayfa çok uzun (8.500 px masaüstü).

### 02. Match
Adım 1: ![](review/02-match-steg1-datum-desktop.jpg) mobil: ![](review/02-match-steg1-datum-mobil.jpg)
Adım 2: ![](review/02-match-steg2-kansla-desktop.jpg)
Adım 3: ![](review/02-match-steg3-budget-desktop.jpg)

Sorunlar: üç adım ve takvim hızlı karar vaadine ters; bütçe adımı fiyat olmadığı için anlamsız.

### 03. Match sonucu
![](review/03-match-resultat-desktop.jpg) mobil: ![](review/03-match-resultat-mobil.jpg)

Üç öneri, neden eşleştiğini söyler. Aynı gösterinin tekrarları artık tek kart.

### 04. Etkinlik sayfası (yorumlarla)
![](review/04-event-desktop.jpg) mobil: ![](review/04-event-mobil.jpg)

Elif "Visa kommentarer" ile herkese açık thread'i açar (hesap gerekir), yorumunu görür. Gösterinin başka tarihleri varsa "Fler tillfällen" listesi çıkar. Mobil görüntü önceki turdan (yorum bölümü yok).

### 05. Yeni plan
![](review/05-ny-plan-desktop.jpg) mobil: ![](review/05-ny-plan-mobil.jpg)

Hâlâ iki alan (ad, senin adın). Tarih odada sonradan eklenir.

### 06. Planlarım (Elif)
![](review/06-planer-lista-desktop.jpg) mobil: ![](review/06-planer-lista-mobil.jpg)

Küçük resim, "fre 23 okt, 5 personer, 4 alternativ", "Du har röstat", "4 röster hittills". Mobil görüntü önceki turdan.

### 07. Plan odası: oylama sürüyor
![](review/07-plan-oppen-arrangor-desktop.jpg) mobil: ![](review/07-plan-oppen-arrangor-mobil.jpg)

Başlık, tarih ("fredag 23 oktober, 5 personer, 1 har inte röstat"), üye çipleri (oy verenin avatarı turuncu), davet linki, kartlar ("Röstat av Elif, Mert"), **Lägg till event**, **Snacka ihop er** thread'i (iki seviye, tepkiler, Svara/Ta bort/Rapportera). Elif'te ayrıca "Ändra namn och datum". Mobil görüntü önceki turdan.

### 08. Plan odası: arkadaş olarak (Deniz katıldıktan sonra)
![](review/08-plan-oppen-van-har-inte-rostat-desktop.jpg)

### 09. Beraberlik
![](review/09-plan-lika-roster-desktop.jpg)

### 10. Karar verilmiş plan
![](review/10-plan-avgjord-vinnare-desktop.jpg) mobil: ![](review/10-plan-avgjord-vinnare-mobil.jpg)

Kazanan kâğıt bilet, altında "Så röstade ni" (kim neye oy verdi), **Kopiera meddelande till gänget**, yorumlar. Oy kartları artık yok. Mobil önceki turdan.

### 11. Davetli (Deniz, üye değil)
Masaüstü: ![](review/11-inbjudan-gast-desktop.jpg) Mobil (avgjord plan): ![](review/11-inbjudan-gast-mobil.jpg)

Plan adı, "Elif har bjudit in dig till fredag 23 oktober. Med: Elif, Mert, Selin, Can.", seçenek kartları (favori seç), ad alanı, **Gå med och rösta**, "Inget konto behövs". Bu tur en çok değişen ekran.

### 12. Planı olmayan kullanıcı
![](review/12-planer-tom-desktop.jpg)

### 13. 404
![](review/13-404-desktop.jpg)

### 14. Tasarım sistemi
Koyu: ![](review/14-designsystem-morkt-desktop.jpg) Açık: ![](review/14-designsystem-ljust-desktop.jpg)

### 15. Hesap (`/konto`)
Giriş yapmış: ![](review/15-konto-inloggad-desktop.jpg)
Giriş yapmamış: ![](review/15-konto-logga-in-desktop.jpg)

Giriş yapmamışsa "Logga in" + e-posta alanı; misafirse "Spara dina planer"; hesap varsa e-posta ve "Logga ut". Header'da "Logga in" bağlantısı, girişten sonra baş harfin.

## 8. Doğrulanmayan şeyler

- **E-postanın gerçekten gelmesi** ve bağlantıyla dönüş (panel ayarları gerekiyor). Misafiri hesaba çevirme akışı kodlandı ama uçtan uca denenmedi.
- Gerçek ikinci cihaz/tarayıcıda canlı güncelleme (aynı tarayıcıda farklı oturumlarla denendi).
- Klavye ve ekran okuyucu ile uçtan uca gezinme.
- Üretim ortamı (Vercel): ortam değişkenleri Vercel'de tanımlı değil.
- Yorum/tepki arayüzü mobilde (sadece masaüstünde gözle bakıldı).
