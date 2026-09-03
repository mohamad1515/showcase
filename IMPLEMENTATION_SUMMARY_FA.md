# پیاده‌سازی تکمیل تقاضاهای محصول

## خلاصه تغییرات

تمام تقاضاهای شما برای بهبود سیستم مدیریت محصولات پیاده‌سازی شده‌اند:

---

## 1. ✅ اصلاح خطای Slug (URL-Encoded)

### مسئله اصلی:

- Slug‌های فارسی باعث خطای "Product with slug ... was not found" می‌شدند
- Slug‌ها URL-encoded می‌شدند و دوباره decode نمی‌شدند

### راه‌حل:

- Slug اکنون **خودکار** در سمت سرور تولید می‌شود
- Format: `product-{timestamp}-{random-id}`, مثال: `product-1a2b3c-8d9e0f1g`
- **کاربر ادمین نمی‌تواند** Slug را وارد کند
- Slug در صفحه نمایش محصول نمایش داده **نمی‌شود**

**فایل‌های تغییر یافته:**

- Backend: `src/products/products.service.ts` - بخش `generateSlug()`
- Frontend: `components/admin/ProductForm.tsx` - فیلد slug حذف شد
- Frontend: `app/products/[slug]/page.tsx` - Slug از نمایش حذف شد

---

## 2. ✅ قالب‌بندی قیمت با جداکننده هزار‌ها

### ویژگی‌ها:

- هنگام وارد کردن قیمت: `100000` → `100,000`
- نمایش: `100,000 تومان` (برچسب تومان اضافه شد)
- پشتیبانی اعداد فارسی و انگلیسی
- حذف خودکار کاراکترهای غیر عددی

**فایل‌های تغییر یافته:**

- Frontend: `components/admin/ProductForm.tsx`
  - تابع جدید: `formatPrice()`
  - Input برای قیمت با برچسب تومان
  - Placeholder نمونه: "مثال: 100000"

---

## 3. ✅ انتخاب نوع محصول

### گزینه‌های دسترس‌پذیر:

- **پودر** (Powder)
- **مایع** (Liquid)
- **قرص** (Tablet)
- **کپسول** (Capsule)

### نحوه کار:

- Dropdown منو برای انتخاب نوع
- Placeholder‌های دینامیکی برای weight/quantity بر اساس نوع
- ذخیره و نمایش نوع محصول

**فایل‌های تغییر یافته:**

- Frontend: `components/admin/ProductForm.tsx`
  - آرایه جدید: `productTypes`
  - Select dropdown برای نوع محصول
  - Placeholder‌های شرطی

---

## 4. ✅ قوانین واحد (Unit) بر اساس نوع محصول

### پودر (Powder):

```
- اگر ≤ 3: واحد = گرم (g)
- اگر ≥ 4: واحد = کیلوگرم (kg)
- اگر "/" یا ".": واحد = کیلوگرم
```

مثال‌ها:

- Input: 500 → نتیجه: "500 گرم"
- Input: 1500 → نتیجه: "1.5 کیلوگرم"
- Input: 1.5 → نتیجه: "1.5 کیلوگرم"

### قرص (Tablet):

```
- مقدار: گرم
- تعداد: ضروری (نمایش شامل "عددی")
```

مثال: 40 → "40 عددی"

### مایع (Liquid):

```
- مقدار: میلی‌گرم
- تعداد: ضروری (تعداد بطری)
```

**فایل‌های تغییر یافته:**

- Backend: `src/products/products.service.ts`
  - بخش `formatMeasurement()`
  - بخش `formatQuantity()`

---

## 5. ✅ تصاویر متعدد برای هر محصول

### ویژگی‌ها:

- هر محصول می‌تواند **چندین تصویر** داشته باشد
- آپلود همزمان چندین تصویر با FilePond
- نمایش تصاویر در صفحه محصول

**فایل‌های تغییر یافته:**

- Frontend: `components/admin/ProductForm.tsx`
  - بهبود `onprocessfile` برای افزودن تصاویر متعدد
  - آرایه images مدیریت شود (push به جای replace)

---

## 6. ✅ نمایش Lightbox برای تصاویر

### کامپوننت جدید: `ProductImageGallery`

#### ویژگی‌ها:

- **نمایش‌کننده تصاویر اصلی**: تصویر بزرگ فعلی
- **نواری تصاویر کوچک**: ناوبری بین تصاویر
- **شمارنده**: نمایش "1 / 5" (مثال)
- **Lightbox Modal**:
  - کلیک روی تصویر = باز شدن حالت بزرگ‌نمایی
  - دکمه‌های ناوبری قبلی/بعدی
  - دکمه بستن (X)
  - کسری تصاویر در lightbox

#### استفاده:

```tsx
<ProductImageGallery images={product.images} productName={product.name} />
```

**فایل‌های جدید:**

- Frontend: `components/ProductImageGallery.tsx`

**فایل‌های تغییر یافته:**

- Frontend: `app/products/[slug]/page.tsx` - استفاده از کامپوننت جدید

---

## 7. ✅ برچسب‌ها (Tags) برای SEO

### ویژگی‌ها:

- هر محصول می‌تواند **یک یا چند برچسب** داشته باشد
- ورودی انتخابی در فرم (جدا کردن با کاما)
- نمایش برچسب‌ها در صفحه محصول
- برچسب‌ها قابل کلیک (لینک فیلتری)

### نمونه‌های SEO‌شده:

- کاهش وزن
- آنتی‌اکسیدان
- ارگانیک
- تقویت ایمنی
- مکمل ورزشی

**فایل‌های تغییر یافته:**

- Frontend: `components/admin/ProductForm.tsx`
  - تابع جدید: `toTags()`
  - Input فیلد برای برچسب‌ها
- Frontend: `app/products/[slug]/page.tsx`
  - نمایش برچسب‌ها با استایل
  - لینک‌های قابل کلیک

---

## 8. ✅ نمایش نوع محصول

### در صفحه محصول:

- قسمت جدید نمایش نوع محصول
- ترجمه‌های فارسی:
  - powder → پودر
  - liquid → مایع
  - tablet → قرص
  - capsule → کپسول

**فایل‌های تغییر یافته:**

- Frontend: `app/products/[slug]/page.tsx`
  - بخش Display Product Type

---

## خلاصه فایل‌های تغییر یافته

### Frontend:

1. ✅ `app/components/admin/ProductForm.tsx` - فرم محصول آپ‌دیت
2. ✅ `app/components/ProductImageGallery.tsx` - کامپوننت گالری جدید
3. ✅ `app/products/[slug]/page.tsx` - صفحه نمایش محصول بهبود‌یافته
4. ✅ `app/lib/products.ts` - تایپ‌های TypeScript آپ‌دیت شدند

### Backend:

1. ✅ `src/products/products.service.ts` - منطق تولید slug و قالب‌بندی
2. ✅ `src/db/schema.ts` - طرح‌ریزی دیتابیس (قبلاً تکمیل)
3. ✅ `src/products/product.input.ts` - ورودی GraphQL
4. ✅ `src/products/product.model.ts` - مدل GraphQL

---

## برگزاری تست

### برای تست کردن:

#### 1. ایجاد محصول جدید:

```bash
cd /path/to/project/frontend
# یا backend
npm run dev
```

#### 2. مسیرهای مختلف:

- افزودن محصول: `http://localhost:3000/admin/products/new`
- نمایش محصول: `http://localhost:3000/products/[slug]`

#### 3. نکات کلیدی برای تست:

- ✅ Slug خودکار تولید می‌شود (نه دستی)
- ✅ قیمت برای تومان قالب‌بندی می‌شود
- ✅ نوع محصول نمایش داده می‌شود
- ✅ تصاویر متعدد آپلود می‌شوند
- ✅ برچسب‌ها نمایش داده می‌شوند
- ✅ Lightbox برای تصاویر کار می‌کند

---

## نکات مهم

1. **Slug خودکار**: کاربر نمی‌تواند Slug را وارد کند
2. **قیمت مجدد**: هر بار input تغییر کند قالب‌بندی شود
3. **تصاویر متعدد**: استفاده از `push()` به جای `replace()`
4. **واحدها**: هر نوع محصول منطق واحد خاصی دارد
5. **SEO Tags**: برچسب‌ها برای ترافیک جستجو بهینه می‌شوند

---

## مراجع

- GraphQL Queries: `app/lib/graphql.ts`
- Product Types: `app/lib/products.ts`
- Backend Service: `src/products/products.service.ts`
- Database Schema: `src/db/schema.ts`

---

✨ **همه ویژگی‌ها اکنون آماده استفاده هستند!**
