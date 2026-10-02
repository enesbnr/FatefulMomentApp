# Fateful Moment Code Review Rehberi

Bu belge projedeki dosyaların sorumluluklarını ve birbirleriyle ilişkilerini açıklar. `node_modules`, CocoaPods içeriği ve derleme çıktıları kaynak kod olmadığı için dosya dosya listelenmemiştir.

## Büyük resim

Uygulama iki ana akıştan oluşur:

1. **Auth:** Portre modunda demo hesap oluşturma ve giriş ekranları.
2. **Gameplay:** Landscape modunda senaryo seçimi, briefing, video içindeki kararlar ve DNA sonucu.

Temel veri akışı şöyledir:

```text
scenario/data
  -> Home kartları
  -> Briefing
  -> Ana video + karar tanımları
  -> ScenarioProgressRepository (oynatma konumu + cevaplar)
  -> DNA skor hesaplama
  -> DNA sonucu
```

`Scenario`, içerik sağlayıcısından gelecek katalog verisidir: başlık, açıklama, medya ve kararlar. `ScenarioProgress`, kullanıcıya ait veridir: kaldığı saniye, verdiği cevaplar ve tamamlanma durumu. API geldiğinde bu iki veri türü ayrı tutulmalıdır.

## Uygulama başlangıcı ve yapılandırma

- `index.js`: React Native uygulamasını native runtime'a kaydeden giriş dosyasıdır.
- `App.tsx`: En üst bileşendir. Gesture, safe area, Android keyboard ve scenario progress provider'larını kurar; sonra navigation'ı açar.
- `app.json`: Native uygulamanın kayıt adı ve görünen adını taşır.
- `package.json`: Bağımlılıkları ve `android`, `ios`, `start`, `test`, `lint` scriptlerini tanımlar.
- `package-lock.json`: Kurulacak npm paketlerinin kesin sürümlerini kilitler.
- `babel.config.js`: TypeScript/JSX kodunun React Native için dönüştürülmesini ayarlar.
- `metro.config.js`: Metro bundler'ı ve SVG dosyalarının component olarak import edilmesini ayarlar.
- `tsconfig.json`: TypeScript derleme ve tip kontrol kurallarını belirler.
- `jest.config.js`: Jest'in React Native test ortamını ve setup dosyasını seçer.
- `Gemfile`: iOS araç zincirindeki Ruby bağımlılıklarını sabitler.
- `scripts/patch-orientation-locker.js`: Kurulum sonrasında orientation paketine proje için gereken native patch'i uygular.

## Provider katmanı

- `src/app/providers/ScenarioProgressProvider.tsx`: Progress repository'yi React context üzerinden ekranlara verir. Üretimde AsyncStorage, testte memory repository enjekte edilebilir.
- `src/app/providers/GameplaySafeAreaProvider.tsx`: Landscape safe area bilgisini tek yerde toplar; fiziksel engelin solda mı sağda mı olduğunu ve kullanılacak inset değerlerini üretir.
- `src/app/providers/__tests__/ScenarioProgressProvider.test.tsx`: Repository'nin context üzerinden doğru sağlandığını ve provider dışındaki hatayı doğrular.

## Navigation

- `src/navigation/RootNavigator.tsx`: Auth ile Gameplay arasındaki kök geçişi yönetir. Auth'u portreye, gameplay'i landscape'e kilitler. Demo hesabı yalnızca çalışma belleğinde tutar; uygulama yeniden açılınca oturum hatırlanmaz.
- `src/navigation/AuthNavigator.tsx`: Landing, e-posta girişi, hesap oluşturma, şifre sıfırlama ve e-posta kontrol ekranlarını bağlar.
- `src/navigation/GameplayNavigator.tsx`: Drawer ile Scenarios/DNA bölümlerini, nested stack ile Home/Briefing/Video akışını kurar. Home odağını kaybedince preview oynatmayı kapatır.
- `src/navigation/components/AppDrawerContent.tsx`: Özel drawer görünümüdür. Scenarios ve DNA geçişlerini yapar; Settings şu anda pasiftir. DNA'ya giderken senaryo stack'ini Home'a döndürür.
- `src/navigation/types.ts`: Bütün route adlarını, parametrelerini ve typed screen prop'larını merkezi olarak tanımlar.
- `src/navigation/__tests__/AppNavigation.test.tsx`: Temel auth-to-gameplay uygulama geçişini doğrular.
- `src/navigation/__tests__/AuthNavigation.test.tsx`: Auth ekranları arasındaki ileri/geri akışları doğrular.
- `src/navigation/__tests__/GameplayNavigationLifecycle.test.tsx`: Home, briefing, video ve DNA geçişlerinde lifecycle davranışını test eder.
- `src/navigation/__tests__/OrientationSafeArea.test.tsx`: Orientation ve landscape safe area ilişkisinin beklendiği gibi çalıştığını kontrol eder.
- `src/navigation/__tests__/RootNavigatorLifecycle.test.tsx`: Kök navigator'ın orientation kilitlerini ve mount/unmount davranışını test eder.

## Scenario domain'i

- `src/entities/scenario/model/types.ts`: `Scenario`, preview media ve simulation media sözleşmelerini tanımlar.
- `src/entities/scenario/model/decisionTypes.ts`: Karar, seçenek, süre, DNA etkisi ve altı DNA boyutunun tiplerini tanımlar.
- `src/entities/scenario/data/scenarioAssets.ts`: Yerel poster, placeholder, briefing arka planı ve MP4 referanslarını tek yerde toplar.
- `src/entities/scenario/data/iraqWarDecisions.ts`: Üç demo kararın timestamp, süre, seçenek ve DNA etkilerini tanımlar.
- `src/entities/scenario/data/scenarios.ts`: 30 kartlık mock katalogdur. İlk 15 senaryo preview ve karar verisine sahiptir; şu anda ortak yerel medya kullanırlar.
- `src/entities/scenario/selectors/scenarioSelectors.ts`: Tüm senaryoları veya ID'ye göre tek senaryoyu okuyan basit erişim fonksiyonlarını sağlar. API repository geldiğinde ekranların veri kaynağına doğrudan bağlanmaması için bu sınır geliştirilebilir.

## Scenario progress domain'i

- `src/entities/scenario-progress/model/types.ts`: Kullanıcının video konumu, cevapları, durum bilgisi ve storage şema sürümünü tanımlar.
- `src/entities/scenario-progress/repository/ScenarioProgressRepository.ts`: `get`, `save`, `remove` metotlarından oluşan storage bağımsız sözleşmedir.
- `src/entities/scenario-progress/data/scenarioProgressStorageKeys.ts`: Her senaryo için güvenli ve tutarlı AsyncStorage anahtarı üretir.
- `src/entities/scenario-progress/data/AsyncStorageScenarioProgressRepository.ts`: Progress'i cihazda saklar; JSON doğrulaması yapar, V1 veriyi V2'ye migrate eder ve bozuk/yanlış senaryo verisini siler.
- `src/entities/scenario-progress/testing/MemoryScenarioProgressRepository.ts`: Testlerde cihaz storage'ına ihtiyaç duymadan aynı repository sözleşmesini bellekte uygular.
- `src/entities/scenario-progress/data/__tests__/AsyncStorageScenarioProgressRepository.test.ts`: Okuma/yazma/silme, bozuk JSON temizliği, doğrulama ve migration akışlarını test eder.
- `src/entities/scenario-progress/testing/__tests__/MemoryScenarioProgressRepository.test.ts`: Memory repository'nin kopyalama ve CRUD davranışını doğrular.

## Auth özelliği

- `src/features/auth/AuthLandingScreen.tsx`: Logo, e-posta ile devam, sosyal giriş demo butonları ve yasal metni gösteren ilk ekrandır.
- `src/features/auth/EmailSignInScreen.tsx`: E-posta/şifre alanlarını doğrular, demo hesapla eşleştirir, yükleme ve hata durumunu yönetir.
- `src/features/auth/CreateAccountScreen.tsx`: Demo hesap oluşturur; alan doğrulaması, parola gereksinimleri ve iOS/Android keyboard davranışını yönetir.
- `src/features/auth/ResetPasswordScreen.tsx`: E-posta doğrulaması yapıp Check Email ekranına geçiş için veri üretir.
- `src/features/auth/CheckYourEmailScreen.tsx`: Şifre sıfırlama isteğinin gönderildiğini ve hedef e-postayı gösterir.
- `src/features/auth/components/AuthHeader.tsx`: Auth ekranlarında aynı logo, başlık ve alt başlık hizasını tekrar kullanır.
- `src/features/auth/components/AuthButton.tsx`: Primary glass ve social buton varyantlarını ortaklaştırır.
- `src/features/auth/components/BackButton.tsx`: Auth ekranlarının ortak geri butonudur.
- `src/features/auth/components/FormField.tsx`: Label, input, focus, hata, helper ve trailing ikon davranışını tek bileşende toplar.
- `src/features/auth/data/demoAccount.ts`: Gerçek backend gelene kadar girişte kullanılan varsayılan demo hesabıdır.
- `src/features/auth/model/types.ts`: `DummyAccount` tipini ekranlardan bağımsız biçimde tanımlar.
- `src/features/auth/validation/authValidation.ts`: E-posta, ad, parola gereksinimi, form gönderilebilirliği ve credential eşleştirme kurallarını içerir.
- `src/features/auth/testing/fixtures.ts`: Auth testlerinde tekrar kullanılan prop ve veri örneklerini sağlar.
- `src/features/auth/__tests__/AuthScreens.test.tsx`: Auth ekranlarının temel render ve etkileşim akışlarını test eder.
- `src/features/auth/__tests__/AuthValidation.test.ts`: Saf validation fonksiyonlarını sınar.
- `src/features/auth/__tests__/AuthResponsiveLayout.test.tsx`: Safe area, uzun metin, büyük font ve dar ekran gibi responsive durumları doğrular.

## Home özelliği

- `src/features/home/HomeScreen.tsx`: Header, müzik player, açıklama ve carousel'i birleştirir. Dikey kaydırmayı kapatır; boş alana dokununca seçili/sesli kartı temizler.
- `src/features/home/components/HomeIntroduction.tsx`: “Scenarios”, açıklama ve senaryo sayısı metinlerini gösterir.
- `src/features/home/components/ScenarioCarousel.tsx`: Horizontal `FlatList` sanallaştırmasını kurar. Görünürlük eşiğine göre en fazla beş aktif native preview player'ını kartlar arasında devreder; preview konumlarını `scenarioId` ile bellekte tutar, seçilen görünür karta öncelik verir ve ilk batch, pencere boyutu, kart aralığı, seçim ile dim durumunu yönetir.
- `src/features/home/components/ScenarioCard.tsx`: Tek kartın poster/video katmanı, gradient, süre, başlık, açıklama ve Start butonunu çizer. Seçili kartın sesini açar; yalnızca henüz açılmamış kartların dokunma hedefini kaldırır.
- `src/features/home/components/ScenarioCardMedia.tsx`: Poster/fallback'i her zaman korur; aktifken Video'yu mount eder. App background olduğunda kapatır, hata halinde postere döner ve carousel'in verdiği bellek içi konuma seek eder.
- `src/features/home/data/createScenarios.ts`: Domain senaryolarını Home görünüm modeline çevirir. Tamamlanan senaryoları tekrar oynanabilir bırakır, ilk tamamlanmamış senaryoyu açar ve sonrakileri kilitler. Kartların sırası değişmez; ilk 15 kart preview gösterebilir.
- `src/features/home/types.ts`: Home'a özel `completed`, `locked`, `disabled`, `dimmed`, `previewEnabled` ve `previewStartAtSeconds` alanlarını tanımlar.
- `src/features/home/scenarioCard.constants.ts`: Kart genişliği, yüksekliği, radius ve carousel aralığı gibi ortak ölçüleri tutar.
- `src/features/home/testing/fixtures.ts`: Home media testlerinin örnek verisidir.
- `src/features/home/__tests__/Home.test.tsx`: 15 preview destekli kartı, beş native player sınırını ve görünür kartlara devrini, ses seçimini, Start davranışını ve dikey scroll kilidini test eder.
- `src/features/home/__tests__/ScenarioCardMedia.test.tsx`: Video mount/unmount, sessiz/sesli durum, hazır olma ve hata fallback davranışını test eder.

## Simulation özelliği

- `src/features/simulation/screens/ScenarioBriefingScreen.tsx`: Seçilen scenario ID'sini katalogdan çözer; safe area içinde header, player ve briefing stage'i gösterir.
- `src/features/simulation/screens/ScenarioVideoScreen.tsx`: Ana video oturumunun koordinatörüdür. Son cevap checkpoint'ine resume/retry, progress kaydı, app/focus pause, karar overlay'i, video hatası, completion save ve DNA navigation burada birleşir. Tamamlanmış bir senaryo yeniden oynatılırken eski sonuç, yarım kalan replay ilerlemesine karşı korunur.
- `src/features/simulation/components/SimulationStage.tsx`: Briefing arka planı, karartma gradient'i, border ve içerik alanını çizer.
- `src/features/simulation/components/SimulationBriefing.tsx`: Başlık, açıklama ve “Start Simulation” çağrısını gösterir.
- `src/features/simulation/hooks/useScenarioResume.ts`: Progress'i yükler, geçici okuma hatasını eksik kayıttan ayırıp retry sunar, iki saniyede bir throttle ederek kaydeder, çıkışta flush eder ve completion kaydını iki kez deneyebilir.
- `src/features/simulation/hooks/useDecisionPlayback.ts`: Video zamanı ile karar tetiklerini eşler; choosing, locked ve revealed fazlarını, monoton countdown'u, urgency'yi ve cevap listesini yönetir.
- `src/features/simulation/domain/resolveScenarioResumePosition.ts`: Son tamamlanan cevabı scenario kararlarıyla eşleyerek güvenli resume checkpoint'ini hesaplar.
- `src/features/simulation/model/decisionSessionTypes.ts`: Karar oturum fazlarını tanımlar ve progress katmanındaki cevap tipini yeniden dışa aktarır.
- `src/features/simulation/components/decision/DecisionOverlay.tsx`: Karar anındaki scrim, urgency, seçenek grid'i ve countdown'u bir araya getirir.
- `src/features/simulation/components/decision/DecisionOptionGrid.tsx`: Seçenekleri ikili satırlara dizer ve faza göre her kartın görsel durumunu hesaplar.
- `src/features/simulation/components/decision/DecisionOptionCard.tsx`: Normal, seçili, kilitli, revealed ve “Your Choice” görünümlerini; gradient ve geçiş animasyonlarını çizer.
- `src/features/simulation/components/decision/DecisionCountdown.tsx`: Kalan süreyi yatay progress bar olarak animasyonlu gösterir.
- `src/features/simulation/components/decision/DecisionUrgencyOverlay.tsx`: Acil eşikte kırmızı radial kenar vurgusunu gösterir.
- `src/features/simulation/components/decision/decision.constants.ts`: Figma referans ölçüleri, renk türevleri, gradient koordinatları ve animasyon sürelerini tutar.
- `src/features/simulation/testing/decisionFixtures.ts`: Karar bileşeni ve hook testlerinin kontrollü demo kararlarını sağlar.
- `src/features/simulation/__tests__/DecisionOverlay.test.tsx`: Seçeneklerin fazlara göre görünümünü ve countdown/urgency katmanlarını test eder.
- `src/features/simulation/__tests__/useDecisionPlayback.test.tsx`: Timer, seçim, timeout, arka plan pause/resume ve cevap üretimini test eder.
- `src/features/simulation/__tests__/useScenarioResume.test.tsx`: Yükleme, periyodik kayıt, write queue, çıkış flush'ı, completion retry ve başarısızlık davranışını test eder.
- `src/features/simulation/domain/__tests__/resolveScenarioResumePosition.test.ts`: Boş cevap, son tamamlanan karar, bilinmeyen cevap ve video süresine clamp kurallarını test eder.

## DNA sonucu özelliği

- `src/features/dna-result/screens/DNAResultScreen.tsx`: Progress cevaplarını repository'den yükler, skorları hesaplar ve obstruction tarafına göre Figma canvas'ını yerleştirir. Narrative metinler hâlâ demo veridir.
- `src/features/dna-result/domain/calculateDnaTraitScores.ts`: Her DNA boyutunu 50'den başlatır, seçilen seçeneklerin etkilerini ekler ve sonucu 0–100 arasında sınırlar.
- `src/features/dna-result/data/demoDnaResult.ts`: API/yorumlama motoru gelene kadar archetype, pattern ve blind spot metinlerini sağlar. Trait skorları gerçek cevaplardan değişebilir.
- `src/features/dna-result/model/types.ts`: DNA sonucu, archetype, trait skorları, pattern ve blind spot sözleşmelerini tanımlar.
- `src/features/dna-result/components/DNAResultContent.tsx`: Sonucu iki sütuna yerleştirir; metin uzadığında kartların referans minimum yüksekliğin üzerinde büyümesine izin verir.
- `src/features/dna-result/components/ArchetypeCard.tsx`: Portre, archetype adı ve özetini gösterir.
- `src/features/dna-result/components/PsychologicalMatrixCard.tsx`: Radar ve altı trait skor kartını aynı panelde toplar.
- `src/features/dna-result/components/TraitRadarChart.tsx`: Altı boyutlu SVG radar grafiğini çizer.
- `src/features/dna-result/components/TraitScoreGrid.tsx`: Altı trait'in ikon, sayı ve progress bar görünümünü çizer.
- `src/features/dna-result/components/PatternDetectionCard.tsx`: En fazla üç pattern metnini numaralı gösterir.
- `src/features/dna-result/components/BlindSpotCard.tsx`: En düşük/önemli alan için soru ve açıklama panelini gösterir.
- `src/features/dna-result/components/SectionLabel.tsx`: DNA panellerinin ikonlu ortak küçük başlığıdır.
- `src/features/dna-result/components/dnaResult.constants.ts`: Referans canvas ölçülerini, safe-edge değerlerini, trait sırasını, label'ları ve tema türevlerini tutar.
- `src/features/dna-result/domain/__tests__/calculateDnaTraitScores.test.ts`: Cevap etkileri, bilinmeyen/boş cevaplar ve 0–100 clamp davranışını test eder.
- `src/features/dna-result/__tests__/DNAResultScreen.test.tsx`: Demo sonuç, progress'ten hesaplanan sonuç, loading ve responsive yerleşimi test eder.

## Ortak UI, hook ve tema

- `src/shared/components/app-header/AppHeader.tsx`: Gameplay ekranlarının 48 px ortak üst çizgisini ve sağ içeriğini taşır.
- `src/shared/components/music-player/MusicPlayer.tsx`: Figma'daki standby mini-player görünümüdür; şu anda gerçek müzik kontrolü yapmaz.
- `src/shared/hooks/useLandscapeObstructionSide.ts`: Landscape interface orientation ile safe-area insetlerini birleştirip notch/dynamic island tarafını çözer; geçici `UNKNOWN/FACE-UP/FACE-DOWN` değerlerinde son landscape yönünü korur.
- `src/shared/hooks/__tests__/useLandscapeObstructionSide.test.ts`: Obstruction çözümünü ve geçici orientation değerlerini test eder.
- `src/theme/colors.ts`: Uygulamanın solid renk tokenlarını ve hex renginden kontrollü `rgba` üreten `withAlpha` fonksiyonunu içerir.
- `src/theme/typography.ts`: Inter, Nunito ve mono font ailelerinin tek kaynak noktasıdır.
- `src/theme/authLanding.ts`: Auth landing renk, ölçü, spacing, efekt ve typography tokenlarını taşır.
- `src/theme/emailSignIn.ts`: E-posta tabanlı auth ekranlarının input, back button, footer ve spacing tokenlarını taşır.
- `src/types/assets.d.ts`: TypeScript'e PNG/JPG/MP4/SVG importlarının geçerli olduğunu öğretir.

## Test altyapısı

- `test-support/setupTests.js`: Jest başlamadan native modülleri ve ortak test davranışlarını mock'lar.
- `test-support/svgMock.js`: SVG importlarını Jest'in anlayacağı sahte React componentlerine dönüştürür.

## Asset klasörleri

- `assets/auth/`: Auth logosu, sosyal giriş, geri, parola görünürlüğü ve requirement ikonları.
- `assets/fonts/`: Inter/Nunito font dosyaları, lisansları ve kaynak bilgisi.
- `assets/navigation/sidebar/`: Drawer'ın aktif/pasif ikonları.
- `assets/scenarios/home/`: Süre ve mini-player ikonları.
- `assets/scenarios/iraq-war/`: Demo poster, briefing arka planı ve ortak MP4.
- `assets/scenarios/shared/`: Video bulunamazken gösterilen genel placeholder.
- `assets/simulation/video/`: Ana video ekranı kontrol ikonları.
- `assets/dna-result/`: DNA panel ikonları ve demo archetype portresi.

## Figma referansları ve proje belgeleri

- `README.md`: Kurulum, demo davranışları, mimari kararlar, test komutları ve ilerideki API/cache yaklaşımını anlatır.
- `docs/auth-landing-implementation.md`: Auth landing uygulamasının Figma ölçüleri ve alınan kararlarını belgeler.
- `docs/ui-polish-backlog.md`: Görsel iyileştirme ve sonraki iş listesidir.
- `skills.md`: Proje çalışması sırasında kullanılan yerel rehber/not dosyasıdır; runtime parçası değildir.

## Native Android dosyaları

- `android/settings.gradle`, `android/build.gradle`, `android/gradle.properties`: Android proje, plugin ve Gradle ayarları.
- `android/app/build.gradle`: Uygulama ID'si, SDK, build type, signing ve React Native Android yapılandırması.
- `android/app/src/main/AndroidManifest.xml`: Activity, izin ve uygulama manifest tanımları.
- `android/app/src/main/java/.../MainActivity.kt`: React Native ekranını barındıran Android Activity.
- `android/app/src/main/java/.../MainApplication.kt`: React Native host ve native paket başlangıcı.
- `android/app/src/main/assets/fonts/`: Android'in runtime'da kaydettiği font kopyaları.
- `android/app/src/main/res/`: Launcher ikonları, uygulama adı, tema ve native drawable kaynakları.
- `android/app/proguard-rules.pro`: Release küçültme/obfuscation kuralları.
- `android/app/debug.keystore`: Yerel debug build imzalama anahtarıdır; production anahtarı değildir.
- `android/gradlew`, `android/gradlew.bat`, `android/gradle/wrapper/*`: Aynı Gradle sürümünün makineler arasında çalışmasını sağlayan wrapper dosyaları.

## Native iOS dosyaları

- `ios/Podfile`, `ios/Podfile.lock`: Native iOS bağımlılıklarını ve kesin sürümlerini tanımlar.
- `ios/FatefulMomentApp/AppDelegate.swift`: React Native bridge/runtime ve iOS uygulama başlangıcını kurar.
- `ios/FatefulMomentApp/Info.plist`: Bundle ve iOS uygulama davranışı ayarlarıdır.
- `ios/FatefulMomentApp/LaunchScreen.storyboard`: Native açılış ekranıdır.
- `ios/FatefulMomentApp/PrivacyInfo.xcprivacy`: Apple privacy manifest bildirimlerini taşır.
- `ios/FatefulMomentApp/FatefulMomentApp-Bridging-Header.h`: Swift ile gereken Objective-C başlıkları arasında köprüdür.
- `ios/FatefulMomentApp/Images.xcassets/`: App icon ve iOS görsel kataloğudur.
- `ios/FatefulMomentApp.xcodeproj/`: Xcode proje, target ve build ayarlarıdır.
- `ios/FatefulMomentApp.xcworkspace/`: CocoaPods ile birlikte açılması gereken workspace tanımıdır.

## API geldiğinde değişecek sınır

API entegrasyonunda Home, briefing, video veya DNA görsel bileşenlerini yeniden yazmak gerekmemelidir. Yeni katman kabaca şöyle olur:

```text
ScenarioApiDto
  -> ScenarioApiClient
  -> ScenarioRepository
  -> mapScenarioDtoToScenario
  -> mevcut Scenario modeli
  -> mevcut ekranlar
```

API'den `id`, `title`, `description`, `duration`, poster URL, preview video URL, simulation video URL ve kararlar gelir. Yerel mock kartlar aynı MP4'ü paylaşsa da her kart kendi preview konumunu bellekte tutar. Gerçek farklı preview URL'leri geldiğinde aynı lifecycle davranışı korunur.

Auth tarafındaki mevcut hesap ve credential kontrolü demo davranışıdır. Gerçek auth geldiğinde token/session güvenli storage'da yönetilmeli; kullanıcıyı hatırlama davranışı ürünün logout/session tasarımıyla birlikte eklenmelidir.
