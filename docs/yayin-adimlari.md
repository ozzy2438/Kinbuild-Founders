# StartBeside — yayına geçiş

Geçici iletişim adresi: **osmanorka@gmail.com**. Site StartBeside’ın amacını anlatıyor; kişisel fotoğraf, ad soyad ve biyografi gerekmiyor.

## Hazır dosyalar

- `artifacts/StartBeside-Netlify.zip`: Netlify’a yüklemek için hazırlanmış site. ZIP açıldığında `index.html`, `assets`, `images` ve `media` aynı klasörde bulunur. Gerçek kayıt modu bu pakette açıktır; Netlify Forms’un etkinleştirilmesi gerekir.
- `artifacts/StartBeside.html`: bilgisayarda açılabilen tek dosyalık gösterim. Formu önizlemedir; bunu yayın paketi olarak yüklemeyin.
- `artifacts/StartBeside-film.mp4`: LinkedIn duyurusuna eklenebilecek 20 saniyelik film.
- `docs/launch-copy.md`: İngilizce LinkedIn paylaşımı, kayıt sonrası cevap ve kısa görüşme soruları. Henüz paylaşılmadı veya gönderilmedi.

## Netlify üzerinden yayın

1. Mevcut Netlify hesabındaki **Free** takımı kullanın. Ücretli yükseltme veya ek hizmet seçmeyin; başlangıç için verilen `netlify.app` adresi yeterli.
2. Doğrudan bağlantı kurulursa yüklemeyi asistan sürdürebilir. Elle yükleme için [Netlify Drop](https://app.netlify.com/drop) sayfasında oturum açın. `StartBeside-Netlify.zip` dosyasını açıp içindeki `index.html` dosyasını barındıran klasörü yükleyin.
3. Projenin **Forms → Enable form detection** ayarını açın. Sonra aynı klasörü projenin **Deploys** sayfasından yeniden yükleyin. Form algılama, etkinleştirmeden sonraki yüklemede çalışır.
4. **Forms** altında `startbeside-interest` göründüğünü doğrulayın. Proje özel görünürlükle oluşturulduysa yayın sırasında herkese açık yapın. Verilen adresi gizli bir tarayıcı penceresinde açın.
5. Telefonda, kendi e-postanızla ve “StartBeside Test” adıyla bir deneme kaydı yapın. Sayfadaki alındı mesajını ve Netlify Forms içindeki kaydı birlikte kontrol edin; ardından bu test kaydını silin. Film açılmadan form kullanılabilir olmalı.
6. Yeni kayıtlar için bildirim isterseniz Netlify Forms bildirimlerinden `osmanorka@gmail.com` adresini seçin. Formdaki iletişim adresini eklemek, e-posta bildirimini kendiliğinden açmaz. Katılımcıya otomatik e-posta henüz yapılandırılmadı.
7. Gerçek kayıt doğrulandıktan sonra `launch-copy.md` içindeki `[LIVE_URL]` yerini site adresiyle değiştirin ve LinkedIn duyurusunu filmle birlikte yayımlayın.

## Sonraki güncellemeler

İletişim adresini değiştirmek için `.env` ve `netlify.toml` içindeki `VITE_CONTACT_EMAIL` değerini güncelleyin; `npm run build:netlify` ile yeni dosyaları üretip aynı projeye yükleyin. Tek dosyalık gösterim için `npm run build:standalone` kullanılır. Git bağlantısı üzerinden Netlify’da üretim derlemesi yapılırsa `netlify.toml` üretim ayarları devreye girer.

Yeni domain satın almaya gerek yok. Kullanıcı Free plana geçtiğini bildirdi; gerçek hesap planı ve etkin ayarları, hesap bağlantısı veya panel üzerinden doğrulanmalıdır. Bu belge hazırlanırken henüz dağıtım yapılmadı.

## Tasarım güncellemesi (Ekim 2026)

- **Pilot sözü:** `docs/pilot-01.md` sitedeki sözün kaynağıdır; önce orayı, sonra siteyi değiştirin.
- **Yeni form alanları:** `looking_for` (kimi arıyor), `working_style` (çalışma tarzı), `weekly_hours` (haftalık saat) ve `availability` (uygun zamanlar, isteğe bağlı). Yayından sonra Netlify’ın bu alanları tanıması için form algılama açıkken bir kez yeniden yükleyin ve **Forms** altında iki yeni sütunu kontrol edin.
- **Paylaşım görseli:** LinkedIn ve WhatsApp önizlemesi için `public/og/startbeside-share.jpg` eklendi. Önizlemenin görünmesi için görsel adresinin tam (mutlak) olması gerekir. Git bağlantılı Netlify derlemesinde bu otomatik ayarlanır. `npm run build:netlify` ile elle paket üretiyorsanız önce site adresini verin, örneğin `VITE_SITE_URL=https://startbeside.netlify.app npm run build:netlify`. Yayından sonra [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) ile kontrol edin.
- **Kurucu notu (isteğe bağlı):** `src/content/organiser.ts` içine ad ve iki cümlelik bir not yazılınca “Why StartBeside exists” bölümünde görünür. Fotoğraf (`public/images/` altına kare bir görsel) ve LinkedIn adresi isteğe bağlıdır. Boş bırakılırsa bölüm görünmez.
- **Topluluk sayacı (isteğe bağlı, varsayılan kapalı):** Kayıt sayısını ve beceri dağılımını anonim olarak gösterir. Bir Netlify Function gerektirir. Netlify Drop ile yüklenen pakette çalışmaz ve plan kullanımına sayılır. Açma adımları `docs/netlify-registration.md` içinde.
- `artifacts/` içindeki ZIP ve tek dosyalık HTML eski sürümdür. Yeniden üretmek için `npm run build:netlify` ve `npm run build:standalone` komutlarını çalıştırın.
