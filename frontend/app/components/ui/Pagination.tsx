'use client';

import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <nav aria-label="صفحه‌بندی" className="mt-10 flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        style={{ transitionTimingFunction: 'var(--motion-ease-out)' }}
        className="border-border text-foreground hover:border-accent hover:text-accent active:scale-[0.97] disabled:active:scale-100 grid h-10 w-10 place-items-center rounded-md border transition-[border-color,color,transform] duration-150 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="صفحه قبلی"
      >
        <FiChevronRight aria-hidden />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page}
          style={{ transitionTimingFunction: 'var(--motion-ease-out)' }}
          className={
            p === page
              ? 'bg-accent text-black active:scale-[0.97] grid h-10 w-10 place-items-center rounded-md text-sm font-black transition-transform duration-150'
              : 'border-border text-foreground hover:border-accent active:scale-[0.97] grid h-10 w-10 place-items-center rounded-md border text-sm font-bold transition-[border-color,color,transform] duration-150'
          }
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
        style={{ transitionTimingFunction: 'var(--motion-ease-out)' }}
        className="border-border text-foreground hover:border-accent hover:text-accent active:scale-[0.97] disabled:active:scale-100 grid h-10 w-10 place-items-center rounded-md border transition-[border-color,color,transform] duration-150 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="صفحه بعدی"
      >
        <FiChevronLeft aria-hidden />
      </button>
    </nav>
  );
}
