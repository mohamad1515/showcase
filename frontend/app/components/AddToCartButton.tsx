"use client";

import { useState } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { addCartItem } from "../lib/graphql";
import { errorMessage, notifyError, notifySuccess } from "../lib/toast";
import { useAuth } from "../providers/AuthProvider";

export default function AddToCartButton({
  productSlug,
  disabled,
  className = "",
}: {
  productSlug: string;
  disabled?: boolean;
  className?: string;
}) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!token) {
      notifyError("برای افزودن به سبد خرید ابتدا وارد شوید.");
      return;
    }

    setLoading(true);
    try {
      await addCartItem(productSlug, 1);
      window.dispatchEvent(new CustomEvent("cart:refresh"));
      notifySuccess("محصول به سبد خرید اضافه شد.");
    } catch (err) {
      notifyError(errorMessage(err, "افزودن به سبد خرید ناموفق بود."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={disabled || loading}
      title="افزودن به سبد خرید"
      className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-accent px-3 text-sm font-black text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <FiShoppingCart aria-hidden />
      {loading ? "در حال افزودن" : "افزودن به سبد خرید"}
    </button>
  );
}
