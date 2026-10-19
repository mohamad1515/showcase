'use client';

import { useState } from 'react';

const subjects = [
  'تحویل و سفارشات',
  'رژیم غذایی و ورزش',
  'بازاریابی و رسانه',
  'تجربه موفق شما',
  'عمده‌فروشی و بازگشت کالا',
];

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
        event.currentTarget.reset();
      }}
      className="border-border bg-card space-y-5 rounded-md border p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-foreground grid gap-2 text-sm font-bold">
          نام و نام خانوادگی
          <input
            type="text"
            name="name"
            required
            className="border-border bg-surface h-11 w-full rounded-md border px-3 text-sm font-normal"
          />
        </label>
        <label className="text-foreground grid gap-2 text-sm font-bold">
          ایمیل
          <input
            type="email"
            name="email"
            required
            className="border-border bg-surface h-11 w-full rounded-md border px-3 text-sm font-normal"
          />
        </label>
        <label className="text-foreground grid gap-2 text-sm font-bold">
          شماره تماس
          <input
            type="text"
            name="phone"
            required
            className="border-border bg-surface h-11 w-full rounded-md border px-3 text-sm font-normal"
          />
        </label>
        <label className="text-foreground grid gap-2 text-sm font-bold">
          موضوع
          <select
            name="subject"
            defaultValue=""
            required
            className="border-border bg-surface h-11 w-full rounded-md border px-3 text-sm font-normal"
          >
            <option value="" disabled>
              انتخاب موضوع
            </option>
            {subjects.map((subject) => (
              <option key={subject}>{subject}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="text-foreground grid gap-2 text-sm font-bold">
        پیام
        <textarea
          name="message"
          required
          rows={6}
          className="border-border bg-surface w-full rounded-md border px-3 py-2 text-sm font-normal"
        />
      </label>

      <button
        type="submit"
        className="bg-accent text-black hover:bg-accent-strong h-11 w-full rounded-md text-sm font-black transition-colors sm:w-auto sm:px-8"
      >
        ارسال درخواست
      </button>

      {submitted && (
        <p className="bg-success-soft text-success rounded-md px-4 py-3 text-sm font-bold">
          متشکریم — پیام شما دریافت شد.
        </p>
      )}
    </form>
  );
}
