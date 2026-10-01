'use client';

import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export default function CategoriesModal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        dir="rtl"
        onMouseDown={(e) => e.stopPropagation()}
        className="border-border bg-surface w-full max-w-lg rounded-xl border p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-foreground text-xl font-black">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="text-muted hover:bg-background hover:text-foreground inline-flex h-9 w-9 items-center justify-center rounded-md transition"
          >
            <FiX aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
