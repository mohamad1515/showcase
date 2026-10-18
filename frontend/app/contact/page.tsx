import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import ContactForm from '../components/ContactForm';

export const metadata = {
  title: 'تماس با ما | فیت مکمل',
  description: 'سوال، درخواست یا بازخورد خود را برای تیم فیت مکمل ارسال کنید.',
};

const offices = [
  {
    name: 'دفتر مرکزی',
    tagline: 'پاسخگویی روزهای کاری',
    phone: '۰۲۱-۱۲۳۴۵۶۷۸',
    email: 'info@fitmokamel.ir',
    address: 'تهران، خیابان ورزش، پلاک ۲۴',
  },
  {
    name: 'پشتیبانی فروش',
    tagline: 'پیش و پس از خرید',
    phone: '۰۲۱-۸۷۶۵۴۳۲۱',
    email: 'sales@fitmokamel.ir',
    address: 'تهران، خیابان ورزش، پلاک ۲۴',
  },
];

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-5 sm:py-14 lg:px-6" dir="rtl">
      <header className="border-border mb-10 border-b pb-6">
        <p className="text-muted text-sm font-bold">فیت مکمل</p>
        <h1 className="text-foreground mt-2 text-3xl font-black">تماس با ما</h1>
        <p className="text-muted mt-4 max-w-2xl text-sm leading-8">
          سوال، درخواست همکاری یا بازخوردی دارید؟ فرم زیر را پر کنید تا تیم ما در اسرع وقت با شما
          تماس بگیرد.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <ContactForm />

        <div className="space-y-5">
          {offices.map((office) => (
            <div key={office.name} className="border-border bg-card rounded-md border p-6">
              <h2 className="text-foreground text-base font-black">{office.name}</h2>
              <p className="text-muted mt-1 text-xs font-bold">{office.tagline}</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="text-foreground flex items-center gap-3">
                  <FiPhone className="text-accent-strong" aria-hidden />
                  {office.phone}
                </li>
                <li className="text-foreground flex items-center gap-3">
                  <FiMail className="text-accent-strong" aria-hidden />
                  {office.email}
                </li>
                <li className="text-foreground flex items-center gap-3">
                  <FiMapPin className="text-accent-strong" aria-hidden />
                  {office.address}
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface-1 mt-10 overflow-hidden rounded-md">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d186767.6!2d51.237!3d35.715!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!5e0!3m2!1sfa!2sir!4v0000000000000!5m2!1sfa!2sir"
          className="h-80 w-full border-0"
          loading="lazy"
          title="موقعیت فیت مکمل روی نقشه"
        />
      </div>
    </main>
  );
}
