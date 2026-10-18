'use client';

import { useState, type ReactNode } from 'react';

type TabItem = {
  id: string;
  label: ReactNode;
  content: ReactNode;
};

export default function Tabs({
  items,
  defaultTabId,
}: {
  items: TabItem[];
  defaultTabId?: string;
}) {
  const [activeId, setActiveId] = useState(defaultTabId ?? items[0]?.id);
  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <div>
      <div className="border-border flex flex-wrap gap-2 border-b" role="tablist">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === activeItem?.id}
            onClick={() => setActiveId(item.id)}
            className={
              item.id === activeItem?.id
                ? 'text-accent-strong border-accent-strong -mb-px border-b-2 px-4 py-3 text-sm font-black'
                : 'text-muted hover:text-foreground -mb-px border-b-2 border-transparent px-4 py-3 text-sm font-bold transition-colors'
            }
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="pt-6">{activeItem?.content}</div>
    </div>
  );
}
