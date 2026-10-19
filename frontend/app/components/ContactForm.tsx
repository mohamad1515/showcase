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
      className="glass space-y-5 rounded-md p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-foreground grid gap-2 text-sm font-bold">
          نام و نام خانوادگی
          <input
            type="text"
            name="name"
            required
            className="glass-input h-11 w-full rounded-md px-3 text-sm font-normal transition-colors focus:border-accent"
          />
        </label>
        <label className="text-foreground grid gap-2 text-sm font-bold">
          ایمیل
          <input
            type="email"
            name="email"
            required
            className="glass-input h-11 w-full rounded-md px-3 text-sm font-normal transition-colors focus:border-accent"
          />
        </label>
        <label className="text-foreground grid gap-2 text-sm font-bold">
          شماره تماس
          <input
            type="text"
            name="phone"
            required
            className="glass-input h-11 w-full rounded-md px-3 text-sm font-normal transition-colors focus:border-accent"
          />
        </label>
        <label className="text-foreground grid gap-2 text-sm font-bold">
          موضوع
          <select
            name="subject"
            defaultValue=""
            required
            className="glass-input h-11 w-full rounded-md px-3 text-sm font-normal transition-colors focus:border-accent"
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
          className="glass-input w-full rounded-md px-3 py-2 text-sm font-normal transition-colors focus:border-accent"
        />
      </label>

      <button
        type="submit"
        className="bg-accent text-black hover:bg-accent-strong active:scale-[0.97] h-11 w-full rounded-md text-sm font-black transition-[background-color,transform] duration-150 ease-out sm:w-auto sm:px-8"
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
