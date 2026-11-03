# راهنمای امضای امن نسخه Release اپلیکیشن My Love Razma ❤️

برای نصب مستقیم و بدون اخطار نسخه نهایی (Release) روی گوشی‌های اندروید، اپلیکیشن باید با یک کلید اختصاصی امضا شود. برای رعایت کامل اصول امنیت، کلید امضا هرگز نباید در کد یا مخزن عمومی گیت‌هاب قرار گیرد.

---

### مرحله ۱: ایجاد کلید اختصاصی (Keystore)

دستور زیر را در ترمینال کامپیوتر خود اجرا کنید:

```bash
keytool -genkey -v -keystore myloverazma-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias myloverazma
```

در طول فرآیند، رمز عبور و اطلاعات دلخواه را وارد کنید. فایل `myloverazma-release-key.jks` در پوشه جاری ایجاد می‌شود. این فایل را در جای بسیار امن نگه دارید و در گیت‌هاب کامیت نکنید.

---

### مرحله ۲: امضای APK با apksigner یا Android Studio

روش اول (ساده‌ترین روش):
1. پروژه را با دستور `npx cap open android` در نرم‌افزار Android Studio باز کنید.
2. از منوی بالا گزینه **Build > Generate Signed Bundle / APK** را انتخاب کنید.
3. گزینه **APK** را انتخاب کرده و آدرس فایل `myloverazma-release-key.jks` و رمز آن را وارد کنید.
4. دکمه **Create** را بزنید تا فایل نهایی `app-release.apk` امضا و تولید شود.

روش دوم (خط فرمان):
```bash
zipalign -v -p 4 app-release-unsigned.apk app-release-aligned.apk
apksigner sign --ks myloverazma-release-key.jks --out MyLoveRazma-Release-Signed.apk app-release-aligned.apk
```

---

### مرحله ۳: امضای خودکار در GitHub Actions (اختیاری)

اگر می‌خواهید گیت‌هاب به‌طور خودکار فایل امضاشده تولید کند:
1. فایل JKS را با دستور `base64 -w 0 myloverazma-release-key.jks` به متن تبدیل کنید.
2. در گیت‌هاب به مسیر **Settings > Secrets and variables > Actions** بروید.
3. متغیرهای محرمانه زیر را اضافه کنید:
   - `SIGNING_KEY`
   - `KEY_ALIAS`
   - `KEYSTORE_PASSWORD`
   - `KEY_PASSWORD`
