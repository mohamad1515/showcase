'use client';

import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

export type AccordionEntry = { question: string; answer: string };

export default function Accordion({
  items,
  defaultOpenIndex = 0,
}: {
  items: AccordionEntry[];
  defaultOpenIndex?: number;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  return (
    <div className="divide-border border-border divide-y rounded-md border">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right"
              aria-expanded={isOpen}
            >
              <span className="text-foreground text-sm font-black">{item.question}</span>
              <FiChevronDown
                aria-hidden
                className={`text-muted shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5">
                <p className="text-muted text-sm leading-7">{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
