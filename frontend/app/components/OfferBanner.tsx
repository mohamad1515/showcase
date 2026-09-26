'use client';
import Image from 'next/image';
import React from 'react';
import productImage from '@/public/images/products/img-6.png';

export default function OfferBanner() {
  return (
    <section className="w-full py-8">
      <div className="group relative flex h-[260px] w-full rounded-[20px] bg-[#8cff64]" dir="rtl">
        {/* بخش تخفیف */}
        <div
          className="flex w-[27%] shrink-0 items-center justify-center border-l-4 border-dotted border-white px-6"
          dir="ltr"
        >
          <div className="text-center leading-none">
            <div className="flex items-end justify-center">
              <span className="text-[92px] font-black tracking-[-6px]">35</span>

              <div className="mb-2 flex flex-col items-start">
                <span className="text-[42px] leading-[0.8] font-black">%</span>

                <span className="text-[32px] leading-[0.8] font-black">OFF</span>
              </div>
            </div>
          </div>
        </div>

        {/* بخش محتوا */}
        <div className="relative flex flex-1 items-center px-14">
          <div className="relative z-10 max-w-[65%]">
            <h2 className="text-[48px] leading-none font-black tracking-[-2px] text-black uppercase">
              تمرینت را قدرتمند شروع کن
            </h2>

            <p className="mt-5 text-[17px] font-bold tracking-wide text-black">
              با بهترین پروتئین وی ایزوله
            </p>

            <p className="mt-1 text-[15px] font-semibold text-black">
              با کد <span className="font-black text-[#ff3030]">35OFF</span> تخفیف بگیر
            </p>
          </div>

          {/* محصول */}
          <div className="absolute top-1/2 left-[14%] z-20 -translate-y-1/2 transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-[-10px] group-hover:-translate-y-[55%] group-hover:rotate-[-4deg]">
            <Image
              src={productImage}
              alt="محصول"
              width={280}
              height={280}
              className="h-[300px] w-[300px] object-contain drop-shadow-[0_18px_12px_rgba(0,0,0,0.25)] transition-transform duration-500"
            />
          </div>

          {/* سایه زیر محصول */}
          <div className="absolute right-[7%] bottom-[-5px] h-[25px] w-[230px] rounded-[50%] bg-black/20 blur-xl transition-all duration-500 group-hover:right-[6%] group-hover:w-[210px] group-hover:bg-black/25" />
        </div>
      </div>
    </section>
  );
}
