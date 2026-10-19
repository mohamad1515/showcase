import Accordion from './ui/Accordion';

const faqItems = [
  {
    question: 'چطور محصول مناسب خودم را پیدا کنم؟',
    answer:
      'در صفحهٔ هر محصول، ترکیبات، نوع و مشخصات کامل درج شده است. می‌توانید از فیلتر دسته‌بندی و قیمت در صفحهٔ محصولات هم استفاده کنید.',
  },
  {
    question: 'ارسال سفارش چقدر طول می‌کشد؟',
    answer:
      'سفارش‌ها معمولاً در کوتاه‌ترین زمان ممکن پس از ثبت، پردازش و ارسال می‌شوند. وضعیت سفارش را از صفحهٔ «سفارش‌های من» پیگیری کنید.',
  },
  {
    question: 'آیا می‌توانم سفارش را مرجوع کنم؟',
    answer: 'برای اطلاع از شرایط بازگشت کالا با تیم پشتیبانی از طریق صفحهٔ تماس با ما در ارتباط باشید.',
  },
  {
    question: 'آیا نظرهای ثبت‌شده واقعی‌اند؟',
    answer:
      'نظرها توسط کاربران واقعی و پس از ورود به حساب کاربری ثبت می‌شوند و امکان رای‌دهی به نظرهای دیگران هم وجود دارد.',
  },
];

export default function FaqSection() {
  return (
    <section id="faq" className="glass-strong grid gap-8 rounded-lg p-6 sm:p-10 lg:grid-cols-2 lg:items-start">
      <div>
        <p className="text-muted text-sm font-bold">سوالات متداول</p>
        <h2 className="text-foreground mt-2 text-2xl leading-tight font-black sm:text-3xl">
          پاسخ هر سوالی را اینجا پیدا کنید
        </h2>
        <p className="text-muted mt-4 max-w-md text-sm leading-7">
          اگر پاسخ سوالتان را پیدا نکردید، از صفحهٔ تماس با ما برایمان پیام بگذارید.
        </p>
      </div>
      <Accordion items={faqItems} defaultOpenIndex={0} />
    </section>
  );
}
