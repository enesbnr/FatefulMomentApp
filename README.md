# Fateful Moment

Fateful Moment, kullanıcının tarihsel senaryoları video üzerinden deneyimlediği, süreli kararlar verdiği ve seçimlerinin sonucunda bir DNA profili gördüğü React Native uygulamasıdır.

```text
Auth → Home → Briefing → Scenario Video → DNA Result
```

Proje React Native CLI ile geliştirilmiştir ve iOS ile Android'i destekler.

## Kurulum

### Android APK kurulumu

Teslim edilen `FatefulMoment-v1.0-release.apk` dosyasını Android cihaza aktarın. Dosyayı cihazın dosya yöneticisinden açın ve kurulum adımlarını izleyin. Android isterse dosyayı açtığınız uygulama için **Bilinmeyen uygulamaları yükleme** iznini etkinleştirin; kurulum tamamlandıktan sonra bu izni tekrar kapatabilirsiniz.

ADB kurulu bir bilgisayardan yüklemek için cihazda USB hata ayıklamayı etkinleştirip şu komutu çalıştırabilirsiniz:

```sh
adb install -r FatefulMoment-v1.0-release.apk
```

`-r`, cihazda uygulamanın önceki bir sürümü varsa kullanıcı verisini koruyarak günceller. İmza uyuşmazlığı nedeniyle kurulum reddedilirse eski sürümü cihazdan kaldırıp APK'yı yeniden kurun.

APK bağımsız bir release build'dir; çalışması için Metro'nun açık olması gerekmez.

### Kaynak koddan çalıştırma

#### Gereksinimler

- Node.js `22.11.0` veya üzeri
- npm
- iOS için Xcode ve CocoaPods
- Android için Android Studio ve Android SDK

Bağımlılıkları yükleyin:

```sh
npm install
```

`npm install` sonrasında `postinstall`, projede kullanılan orientation ve Android video düzeltmelerini otomatik uygular.

iOS bağımlılıklarını yükleyin:

```sh
cd ios
pod install
cd ..
```

Metro'yu başlatın:

```sh
npm start
```

Başka bir terminalde uygulamayı çalıştırın:

```sh
npm run ios
```

veya:

```sh
npm run android
```

Native bir bağımlılık ya da native patch değiştiğinde Metro reload yeterli değildir; uygulamanın yeniden build edilmesi gerekir.

### Test hesabı

```text
E-posta: test@test.com
Şifre:   ABcd1234
```

### Kontroller

```sh
npx tsc --noEmit
npm run lint
npm test -- --runInBand
```

## Yaklaşım

Kod tabanı feature-first yapıda düzenlenmiştir. Auth, Home, Simulation ve DNA Result akışlarının ekranları, hook'ları, bileşenleri ve testleri kendi feature klasörlerinde tutulur. Ortak domain modelleri `entities`, uygulama seviyesindeki provider'lar `app`, ortak arayüz parçaları `shared`, tema değerleri `theme` ve route tanımları `navigation` altında bulunur.

Senaryo içeriği tek bir model üzerinden Home kartına, briefing ekranına, ana videoya, karar zamanlarına ve DNA sonucuna taşınır. Navigation parametreleri TypeScript ile tiplenmiştir.

Video sırasında karar açıldığında oynatma durur. Seçim yapıldığında veya süre dolduğunda karar kaydedilir ve video devam eder. İlerleme `ScenarioProgressRepository` sözleşmesi üzerinden AsyncStorage'da tutulur. Kullanıcı senaryoya döndüğünde video, son tamamlanan kararın ardından güvenli bir checkpoint'ten devam eder. Geçici okuma hatası ile bozuk kayıt birbirinden ayrılır; bozuk kayıt temizlenirken geçici hatada kullanıcıya yeniden deneme sunulur.

Home carousel'i sanallaştırılmış yatay `FlatList` kullanır. Yerel demoda ilk 15 kart preview gösterebilir; görünür kartlar arasından en fazla beş native video player oluşturulur, diğer kartlar poster olarak kalır. Bir kart player sınırından çıktığında preview konumu `scenarioId` üzerinden bellekte tutulur ve kart yeniden aktif olduğunda kaldığı yerden devam eder. Bu geçici durum senaryo ilerlemesine yazılmaz ve uygulama kapanınca silinir. Home focus kaybettiğinde veya uygulama arka plana geçtiğinde preview player'ları kaldırılır. Seçilen görünür kartın sesi açılır. Başlangıçta yalnızca ilk senaryo açıktır; tamamlanan kart yerinde kalır, tekrar oynanabilir ve sıradaki senaryo açılır. Henüz açılmamış kartların karartılmış preview'ları oynayabilir ancak kartlar başlatılamaz.

Beş eşzamanlı native video player, özellikle düşük donanımlı cihazlarda bellek tüketimi, ısınma, kare düşmesi veya uygulamanın kapanması gibi performans sorunlarına yol açabilir. Bu değer yerel demo ve teslim cihazındaki görsel deneyim için seçilmiştir. Gerçek API entegrasyonunda carousel için ana videodan ayrı, kısa süreli, düşük çözünürlüklü ve düşük bitrate'li preview dosyaları sağlanmalıdır. Eşzamanlı player sınırı da gerçek cihaz ölçümlerine göre düşürülebilmeli; aktif sınırın dışındaki kartlar poster göstermeye devam etmelidir.

Responsive yerleşimde ortak safe-area verisi kullanılır; her ekran bu veriyi kendi Figma ölçülerine göre uygular. Böylece landscape görünümde çentik veya Dynamic Island korunurken ekranların tasarımı tek bir genel wrapper tarafından değiştirilmez.

## Geliştirilebilecekler

- **Medya optimizasyonu:** Demo için aynı anda en fazla beş preview oynatılır. Düşük donanımlı cihazlarda oluşabilecek performans sorunları, API'den kısa, düşük çözünürlüklü ve düşük bitrate'li preview dosyaları alınarak azaltılabilir. Player sınırı gerçek cihaz ölçümlerine göre ayarlanabilir.
- **Medya cache:** API'den uzak medya gelmeye başladığında görünür ve yakındaki preview dosyaları TTL/LRU politikalarıyla sınırlı bir disk cache içinde tutulabilir.
- **Oynatma geçmişi:** Tamamlanan senaryolar tekrar oynanabilir. Tekrar oynatma yarıda bırakılırsa önceki tamamlanmış sonuç korunur; yeniden tamamlanırsa sonuç güncellenir. Birden fazla sonucu ayrı ayrı göstermek istenirse her oynatma ileride ayrı bir `attemptId` ile saklanabilir.
- **Responsive ve erişilebilirlik:** Uzun API metinleri, büyük yazı ayarları, dar landscape ekranlar ve farklı çentik yapıları daha geniş bir cihaz grubunda test edilebilir. İçerik sığmadığında scroll açılıp sığdığında Figma görünümü korunabilir.
- **Performans takibi:** Video, buffering, resume, cache ve API hataları ölçülebilir. Player, buffer ve cache ayarları gerçek cihaz verilerine göre belirlenebilir.

## Kullanılan AI araçları

Geliştirme sürecinde **OpenAI Codex**, **Antigravity** ve **Claude** yardımcı araç olarak kullanıldı. İlk aşamada aynı Figma auth ekranı Codex ve Antigravity'ye verilerek oluşturdukları yaklaşımlar karşılaştırıldı ve tasarıma daha yakın sonuç veren çözüm üzerinden geliştirmeye devam edildi.

Codex daha sonra şu işler için kullanıldı:

- mevcut kodu ve hata akışlarını incelemek,
- olası edge case'leri ve test senaryolarını belirlemek,
- React Native video lifecycle, AsyncStorage ve responsive yerleşim çözümlerini tartışmak,
- unit ve integration testleri hazırlamak,
- alternatif çözüm yollarını karşılaştırmak ve uygulanan teknik kararları doğrulamak.

Geliştirmenin son aşamasında test kapsamı ve olası eksikler Antigravity, Claude ve Codex ile ayrı ayrı kontrol edildi. Ortaya çıkan öneriler karşılaştırıldı; projeyle doğrulanan maddeler uygulanırken kapsam veya tasarım gereksinimleriyle uyuşmayan öneriler alınmadı.

AI çıktıları doğrudan kabul edilmedi. Öneriler proje gereksinimleri ve Figma tasarımlarıyla karşılaştırıldı; kod değişiklikleri TypeScript, ESLint, Jest ve gerçek cihaz/emülatör kontrolleriyle doğrulandı. Android video taşması gibi platforma özel sorunlarda davranış önce cihazda yeniden üretildi, ardından uygulanan native düzeltme ayrıca build edilerek kontrol edildi.

## Notlar

- Auth akışı demo amaçlıdır. Başarılı giriş yalnızca çalışan uygulama oturumu boyunca geçerlidir; uygulama yeniden başlatıldığında Auth ekranı açılır. Tasarımda logout veya hesap yönetimi bulunmadığı için dummy session kalıcı olarak saklanmaz.
- Şifre sıfırlama ekranındaki buton Figma'da `Sign In` olarak verilmişti. Ekranın gerçek eylemini doğru anlatması için metin `Send Reset Link` olarak düzeltildi; tasarım kapsamını korumak amacıyla geri sayım veya ek bir resend arayüzü eklenmedi.
- Senaryo verileri ve medya dosyaları yereldir. İlk 15 kart, preview lifecycle ve liste performansını göstermek için aynı paketlenmiş videoyu farklı senaryo kayıtları üzerinden kullanır.
- Level açılma kuralı, Figma'daki düşük opacity durumunun kilitli içerik olarak yorumlanmasıyla demoda sıralı modellenmiştir. Gerçek API entegrasyonunda kilit durumu ve ön koşullar sunucudan gelen ürün kurallarıyla belirlenmelidir.
- DNA radar grafiği ve altı trait skoru kayıtlı cevaplardan hesaplanır. Archetype, pattern ve blind-spot metinleri API veya yorumlama kuralları sağlanmadığı için Figma'dan alınan sabit demo içeriğidir.
- Tamamlanan senaryolar tekrar oynanabilir. Tekrar oynatma sırasında geçici ilerleme eski tamamlanmış sonucu ezmez; sonuç yalnızca yeni oynatma tamamlandığında güncellenir. Ayrı bir attempt geçmişi tutulmaz.
- Uzak medya cache/prefetch sistemi henüz uygulanmamıştır. Gerçek API'nin URL, format, CDN ve medya sürümleme sözleşmesi belli olduktan sonra gerçek cihaz ölçümlerine göre tasarlanmalıdır.
- `react-native-video@6.19.2` sürümündeki Android `TextureView` problemi `scripts/patch-react-native-video.js` ile `postinstall` sırasında düzeltilir. Paket sürümü değiştirilirse patch yeniden değerlendirilmelidir.

Daha ayrıntılı dosya ve sorumluluk açıklamaları için [`docs/code-review-guide.md`](docs/code-review-guide.md) kullanılabilir.
