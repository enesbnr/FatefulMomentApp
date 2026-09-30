# Fateful Moment

Fateful Moment, kullanıcının tarihsel senaryoları deneyimlediği, video sırasında süreli kararlar verdiği ve seçimlerinin sonucunda bir DNA profili oluşturduğu React Native uygulamasıdır.

Proje React Native CLI ile geliştirilir ve iOS ile Android platformlarını destekler.

## Uygulama akışı

```text
Auth → Home → Simulation Briefing → Scenario Video → DNA Result
                                      └─ Süreli kararlar
```

- **Auth:** Giriş ve kayıt akışlarını yönetir.
- **Home:** Senaryoları yatay ve sanallaştırılmış bir listede gösterir.
- **Simulation Briefing:** Seçilen senaryonun başlığını, açıklamasını ve başlangıç aksiyonunu sunar.
- **Scenario Video:** Videoyu oynatır ve senaryo verisinde belirtilen zamanlarda karar katmanını açar.
- **DNA Result:** Kullanıcının kararlarından oluşan sonucu gösterir.

## Mimari yaklaşım

Kod tabanı feature-first yapıda düzenlenmiştir. Bir kullanıcı davranışına ait ekranlar, hook'lar, bileşenler ve testler aynı feature altında tutulur. Ortak domain modelleri `entities`, uygulama seviyesindeki provider'lar `app`, genel tema değerleri `theme`, navigasyon yapısı ise `navigation` altında bulunur.

```text
src/
├── app/                 # Uygulama seviyesindeki provider'lar
├── entities/            # Scenario ve scenario progress domain modelleri
├── features/
│   ├── auth/
│   ├── home/
│   ├── simulation/
│   └── dna-result/
├── navigation/          # Typed route ve drawer/stack navigasyonu
├── shared/              # Feature bağımsız ortak bileşenler
└── theme/               # Renk, ölçü ve tipografi sabitleri
```

Bu düzen, bir özelliğin ilgili parçalarını birbirine yakın tutar. Ortak kod yalnızca gerçekten birden fazla feature tarafından kullanıldığında `shared` veya `entities` katmanına taşınır.

## Senaryo verisi

Senaryo ekranlarının kullandığı içerik tek bir scenario modeli üzerinden taşınır. Home kartı, briefing ekranı, video kaynağı, karar zamanları ve DNA sonucu aynı `scenarioId` ile ilişkilendirilir.

Route parametreleri typed olarak tanımlanmıştır. Yeni bir route parametresi eklendiğinde TypeScript, güncellenmesi gereken kullanım noktalarını derleme aşamasında gösterir.

## Video karar sistemi

Kararlar scenario verisinde tanımlanan zamanlara göre açılır. Her karar şunları içerir:

- videoda açılacağı zaman,
- karar verme süresi,
- acil durum görünümünün başlayacağı eşik,
- seçenekler ve seçeneklerin DNA etkileri.

Karar katmanı video ekranının üzerinde gösterilir. Karar açıldığında video durur; seçim tamamlandıktan sonra aynı video devam eder. Kullanıcı süre içinde seçim yapmazsa karar sıfır DNA etkisiyle cevapsız kaydedilir, tarihsel gerçek seçenek kısa süre gösterilir ve video otomatik devam eder. Böylece video ayrı ekranlara bölünmeden tek playback oturumu korunur.

## Video resume ve ilerleme kaydı

Video ilerlemesi `scenarioId` bazında cihazda saklanır. Kayıt şu bilgileri içerir:

- videoda kalınan saniye,
- video süresi,
- tamamlanan kararlar,
- verilen cevaplar,
- senaryonun devam ediyor veya tamamlanmış olma durumu.

Uygulama aynı senaryoya tekrar girdiğinde video kaydedilen konuma gider. Tamamlanmış kararlar yeniden gösterilmez. Kullanıcı aktif bir karar sırasında çıkmışsa ilgili karar tekrar açılır ve karar süresi baştan başlar. Video tamamlandığında kayıt `completed` olarak işaretlenir ve DNA sonucuna geçilir.

İlerleme verisi doğrudan ekran bileşeninden AsyncStorage'a yazılmaz. Erişim aşağıdaki repository sözleşmesi üzerinden yapılır:

```text
ScenarioVideoScreen
  → useScenarioResume
    → ScenarioProgressRepository
      → AsyncStorageScenarioProgressRepository
```

Bu sınır sayesinde ileride API eklendiğinde ekran ve playback mantığını değiştirmeden yeni bir repository implementasyonu kullanılabilir. Testlerde aynı sözleşmenin bellek içi implementasyonu kullanılır.

Otomatik ilerleme kayıtları gereksiz disk yazımını azaltmak için aralıklı yapılır. Uygulama arka plana geçtiğinde, kullanıcı geri çıktığında ve cevap değiştiğinde bekleyen veri ayrıca kaydedilir.

## Platform ve lifecycle kararları

- **Cevapsız karar:** Karar süresi seçim yapılmadan biterse cevap `optionId: null` olarak kaydedilir. Bu kayıt sıfır DNA etkisini temsil eder. Tarihsel gerçek seçenek kısa süre gösterildikten sonra video devam eder ve resume sırasında aynı karar yeniden açılmaz.
- **iOS gizlilik anahtarları:** Uygulamanın kullanmadığı izin anahtarları `Info.plist` içinde tutulmaz. Konum servisi kullanılmadığı için boş `NSLocationWhenInUseUsageDescription` kaydı kaldırılmıştır.
- **Android ekran yönü:** `MainActivity`, manifest seviyesinde belirli bir yöne kilitlenmez. `screenOrientation="unspecified"` kullanılır; Auth için portrait, gameplay için landscape yönü navigation boundary'leri üzerinden runtime'da yönetilir.
- **Navigation component kimliği:** Stack ekranları, Home route’u ve drawer content modül seviyesindeki sabit component referanslarıyla tanımlanır. Değişken auth verisi Context üzerinden aktarılır. Böylece üst state güncellemeleri alt navigatörleri gereksiz yere unmount etmez.

## Medya yönetimi

Home carousel'i yatay `FlatList` kullanır. Uzakta kalan kartlar sanallaştırılır. Aynı anda bütün senaryolar için video player oluşturulmaz; yalnızca aktif kart video bileşenini bağlayabilir, diğer kartlar poster görseli gösterir.

Senaryo videosu için `react-native-video`, yerel ilerleme kaydı için `@react-native-async-storage/async-storage` kullanılır.

## Kurulum

Gereksinimler:

- Node.js
- npm
- iOS için Xcode ve CocoaPods
- Android için Android Studio ve Android SDK

Bağımlılıkları yükleyin:

```sh
npm install
```

iOS podlarını yükleyin:

```sh
cd ios
pod install
cd ..
```

Native bir bağımlılık eklendiğinde yalnızca Metro reload yeterli değildir; uygulama yeniden build edilmelidir.

## Çalıştırma

Metro:

```sh
npm start
```

iOS:

```sh
npm run ios
```

Android:

```sh
npm run android
```

Metro'nun `8081` portu zaten kullanılıyorsa ikinci bir Metro başlatmak yerine çalışan süreci kullanın.

## Doğrulama

```sh
npx tsc --noEmit
npm run lint
npm test -- --runInBand
```

Native build doğrulaması:

```sh
cd android
./gradlew assembleDebug
```

```sh
cd ios
xcodebuild \
  -workspace FatefulMomentApp.xcworkspace \
  -scheme FatefulMomentApp \
  -configuration Debug \
  -sdk iphonesimulator \
  CODE_SIGNING_ALLOWED=NO \
  build
```

## Test hesabı

Yerel geliştirme akışında kullanılabilen test hesabı:

```text
E-posta: test@test.com
Şifre:   ABcd1234
```
