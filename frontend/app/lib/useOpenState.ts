'use client';

import { useEffect, useState } from 'react';

/**
 * Keeps a dismissible surface (dropdown, drawer, popover) mounted for `exitDuration`ms
 * after `open` goes false, and defers the "visible" flip by a frame on mount, so CSS
 * transitions on transform/opacity actually have a closed frame to animate from.
 */
export function useOpenState(open: boolean, exitDuration: number) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    setVisible(false);
    const timer = setTimeout(() => setMounted(false), exitDuration);
    return () => clearTimeout(timer);
  }, [open, exitDuration]);

  return { mounted, visible };
}
