"use client";

import Image from "next/image";
import { FiArrowLeft, FiCheckCircle, FiShield } from "react-icons/fi";

interface AuthVisualProps {
  mode: "login" | "register";
}

const content = {
  login: {
    image: "/images/auth/login.jfif",
    alt: "ورزشکار در حال آماده‌سازی مکمل قبل از تمرین",
    title: "آماده‌ای دوباره شروع کنی؟",
    description:
      "وارد حساب کاربری خودت شو و سفارش‌ها، محصولات مورد علاقه و اطلاعات حسابت رو مدیریت کن.",
  },
  register: {
    image: "/images/auth/register.jfif",
    alt: "ورزشکار در حال مصرف مکمل پس از تمرین",
    eyebrow: "شروع یک مسیر جدید",
    title: "برای بهترین نسخه خودت آماده شو",
    description:
      "حساب کاربری خودت رو بساز و تجربه‌ای سریع‌تر و حرفه‌ای‌تر برای خرید مکمل داشته باش.",
  },
} as const;

export default function AuthVisual({ mode }: AuthVisualProps) {
  const data = content[mode];

  return (
    <div
      className="
        relative
        hidden
        h-full
        overflow-hidden
        bg-black
        lg:block
        lg:min-h-[654px]
        lg:w-full
      "
    >
      <Image
        src={data.image}
        alt={data.alt}
        fill
        priority
        sizes="50vw"
        className={`
          object-cover
          transition-transform
          duration-700
          hover:scale-[1.02]
          ${mode === "register" ? "object-[15%_center]" : "object-[100%_center]"}
        `}
      />

      {/* Cinematic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />

      {/* Top Badge */}
      <div className="absolute right-5 top-5 z-10 sm:right-7 sm:top-7 lg:right-8 lg:top-8">
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3.5 py-2 text-[11px] font-bold text-white backdrop-blur-md sm:px-4 sm:text-xs">
          <span className="h-2 w-2 rounded-full bg-[var(--brand)] shadow-[0_0_12px_var(--brand)]" />
          تجربه‌ای متفاوت برای ورزشکارها
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7 lg:p-10">
        <div className="max-w-md">
          <h2 className="text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl lg:text-[42px]">
            {data.title}
          </h2>

          <p className="mt-3 max-w-lg text-xs leading-6 text-white/70 sm:mt-4 sm:text-sm sm:leading-7 lg:text-base">
            {data.description}
          </p>

          {/* Benefits */}
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-bold text-white backdrop-blur-md sm:gap-2 sm:px-4 sm:py-2.5 sm:text-xs">
              <FiCheckCircle className="text-[var(--brand)]" size={15} />
              خرید سریع و آسان
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-bold text-white backdrop-blur-md sm:gap-2 sm:px-4 sm:py-2.5 sm:text-xs">
              <FiShield className="text-[var(--brand)]" size={15} />
              حساب کاربری امن
            </div>
          </div>

          {/* Bottom Hint - Desktop */}
          <div className="mt-6 hidden items-center gap-2 text-xs text-white/40 lg:flex">
            <span>مسیرت رو شروع کن</span>
            <FiArrowLeft size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}
