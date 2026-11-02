# راهنمای اتصال به گیت‌هاب و ساخت خروجی APK 🚀

پروژه **My Love Razma ❤️** کاملاً با گیت مقداردهی شده و گردش‌کار خودکار (GitHub Actions Workflow) برای تولید فایل APK اندروید در مسیر `.github/workflows/build-apk.yml` آماده است.

---

### مراحل سریع اتصال به حساب GitHub شما:

#### ۱. ساخت مخزن جدید در گیت‌هاب:
1. وارد سایت [GitHub.com](https://github.com) شوید.
2. روی دکمه **New repository** کلیک کنید.
3. یک نام مانند `my-love-razma` وارد کنید.
4. مخزن را روی حالت **Private** (خصوصی) یا **Public** قرار دهید و دکمه **Create repository** را بزنید (گزینه‌های Add README یا .gitignore را علامت نزنید).

#### ۲. ارسال کدها به گیت‌هاب (در ترمینال):
دستورات زیر را با جایگزینی آدرس مخزن خود اجرا کنید:

```bash
# اضافه کردن آدرس مخزن گیت‌هاب شما
git remote add origin https://github.com/USERNAME/my-love-razma.git

# ارسال تمامی فایل‌ها و شاخه اصلی
git push -u origin main
```

*(نکته: به‌جای `USERNAME/my-love-razma`، نام کاربری و نام مخزن گیت‌هاب خود را بگذارید)*

---

### دریافت خودکار فایل APK اندروید:
پس از انجام دستور `git push`:
1. به تب **Actions** در صفحه مخزن گیت‌هاب خود بروید.
2. مشاهده خواهید کرد که گردش‌کار **Build My Love Razma Android APK** شروع به اجرا کرده است.
3. پس از پایان بیلد (حدود ۳ الی ۵ دقیقه)، در بخش پایین صفحه (بخش **Artifacts**) فایل خروجی **`MyLoveRazma-Debug-APK`** برای دانلود مستقیم روی موبایل آماده است.

---

### اطلاعات حساب‌های مجاز برنامه:
- **مدیر برنامه (حمید)**:
  - ایمیل: `hamid@gmail.com`
  - کد عبور: `afghan`
- **حساب رزما**:
  - ایمیل: `razma@gmail.com`
  - کد عبور: `afghan`
- **پایگاه داده متصل**: Cloud Firestore پروژه `gen-lang-client-0758025551` با شناسه دیتابیس `ai-studio-myloverazma-a086e9f8-ab1c-4694-874c-b98bd1d02483`.
