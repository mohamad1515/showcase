'use client';

import { useState } from 'react';
import Link from 'next/link';
import AddToCartButton from './AddToCartButton';
import QuantityStepper from './ui/QuantityStepper';

export default function ProductPurchaseRow({
  productSlug,
  inStock,
}: {
  productSlug: string;
  inStock: boolean;
}) {
  // The stepper is visual only: AddToCartButton always adds one unit per click,
  // matching the cart mutation it already wires up elsewhere in the app.
  const [qty, setQty] = useState(1);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <QuantityStepper value={qty} onChange={setQty} />
      <AddToCartButton
        productSlug={productSlug}
        disabled={!inStock}
        className="h-12 flex-1 text-sm font-black"
      />
      <Link
        href="/products"
        className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-black text-foreground transition hover:border-accent hover:text-accent"
      >
        مشاهده محصولات دیگر
      </Link>
    </div>
  );
}
