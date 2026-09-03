"use client";

import { FiCheck } from "react-icons/fi";

interface AuthVisualProps {
  mode: "login" | "register";
}

const loginBenefits = [
  "دسترسی به سفارشات قبلی",
  "ذخیره آدرس‌های ارسال",
  "مشاهده تاریخچه سفاریش",
  "پیشنهادات شخصی‌شده",
];

const registerBenefits = [
  "برنامه تمرینی شخصی‌شده",
  "توصیه‌های غذایی خاص",
  "پیگیری پیشرفت و نتایج",
  "دسترسی به جامعه اعضا",
];

export default function AuthVisual({ mode }: AuthVisualProps) {
  const title = mode === "login" ? "دوباره به مسیرت برگرد" : "شروع مسیر جدید";
  const subtitle =
    mode === "login"
      ? "به حساب کاربری خود وارد شوید و خرید و برنامه تمرینی خود را ادامه دهید."
      : "حساب کاربری خودتو بساز و قدم بعدی برای رسیدن به اهداف ورزشی‌ات را بردار.";

  const benefits = mode === "login" ? loginBenefits : registerBenefits;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Visual Section */}
      <div className="relative h-60 w-full overflow-hidden rounded-lg sm:h-80 lg:h-96">
        {/* Background Gradient */}
        <div
          className="absolute inset-0 bg-gradient-to-br"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(75, 156, 245, 0.15), rgba(235, 16, 0, 0.1))`,
          }}
        />

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating shapes */}
          <div
            className="absolute -right-20 -top-20 h-96 w-96 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(235, 16, 0, 0.08) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(75, 156, 245, 0.08) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative flex h-full flex-col items-center justify-center gap-4 px-4 py-6 text-center sm:gap-6 sm:px-6 sm:py-8">
          {/* Icon / Badge */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[rgba(235,16,0,0.15)] to-[rgba(75,156,245,0.15)] backdrop-blur-sm sm:h-20 sm:w-20">
            <svg
              className="h-8 w-8 sm:h-10 sm:w-10 text-[var(--brand)]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              {mode === "login" ? (
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              ) : (
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.3 10.3l-4.3 4.29-4.29-4.29 1.41-1.41L12 13.17l2.88-2.88 1.41 1.41z" />
              )}
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-xl font-black text-foreground sm:text-2xl lg:text-3xl">
            {title}
          </h2>

          {/* Subtitle */}
          <p className="max-w-sm text-xs leading-relaxed text-muted sm:text-sm md:text-base">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Benefits List */}
      <div className="space-y-2 sm:space-y-3">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-center gap-2 sm:gap-3">
            <div className="flex-shrink-0 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--accent)]">
              <FiCheck
                className="h-3 w-3 sm:h-4 sm:w-4 text-white"
                aria-hidden
              />
            </div>
            <p className="text-xs sm:text-sm font-medium text-foreground">
              {benefit}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
