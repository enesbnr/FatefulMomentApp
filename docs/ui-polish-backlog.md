# UI Polish Backlog

Bu dosya, ana iş akışını kesmeden daha sonra tamamlanacak görsel iyileştirmeleri takip eder. Bu maddeler tamamlanmadan önce DNA sonuç ekranının yapısı ve veri akışı kurulabilir.

## Karar ekranı

- Seçili seçenek kartındaki Figma diyagonal desenini yalnızca React Native ve `react-native-svg` çizimleriyle yeniden oluştur.
  - Hazır PNG, ekran görüntüsü veya kart arka planı kullanma.
  - Kartın ölçüsü bütün durumlarda `345x66` kalmalı.
  - Default, selected ve passive durumları arasında yalnızca tasarımda belirtilen görsel özellikler değişmeli; seçim sırasında kart küçülmemeli veya taşmamalı.
- Figma karşılaştırmasına göre seçili kartın gradyan yönünü, diyagonal bant genişliklerini, renk opaklıklarını ve kenarlığını düzelt.
- Default, selected ve passive kartları iOS ve Android üzerinde yan yana görsel olarak doğrula.
- Tek satır ve iki satır seçenek metinlerinin hizasını Figma ile karşılaştır.
- `Your Choice` etiketinin boyut, konum, renk ve görünme zamanını doğrula.
- Süre çubuğunun iki kenardan merkeze doğru azaldığını görsel olarak doğrula.
- Süre çubuğunun renklerini ve parıltısını Figma ile eşleştir.
- Son dört saniyede görünen kırmızı acil durum katmanını Figma ile karşılaştır.

## Animasyon

- Süre çubuğundaki 100 ms aralıklarla oluşan basamaklı hareketi kaldır.
- Animasyonu Reanimated shared value ve lineer `withTiming` ile akıcı çalıştır.
- Uygulama arka plana geçtiğinde animasyon ile karar süresini birlikte durdur; dönüşte kalan süreden devam ettir.
- Süre dolumu, seçim kilitleme ve video devam etme anlarının mevcut karar akışıyla senkron kaldığını test et.

## Platform doğrulaması

- Karar ekranını gerçek veya simüle edilmiş iOS ve Android cihazlarda 812x375 referans kompozisyonuyla karşılaştır.
- Safe area, yatay ekran, video katmanı ve seçenek kartlarının iki platformda aynı yerleşimi koruduğunu doğrula.
- TypeScript, ESLint, ilgili testler, iOS build ve Android build kontrollerini polish tamamlandıktan sonra yeniden çalıştır.

