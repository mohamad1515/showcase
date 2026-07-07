"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiEdit, FiLoader } from "react-icons/fi";
import AdminPageHeader from "../../../../components/admin/AdminPageHeader";
import ProductForm from "../../../../components/admin/ProductForm";
import AdminGuard from "../../../../components/AdminGuard";
import { getProductBySlug } from "../../../../lib/graphql";
import type { Product } from "../../../../lib/products";
import { errorMessage, notifyError } from "../../../../lib/toast";

export default function EditProductPage() {
  const params = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getProductBySlug(params.slug)
      .then((data) => active && setProduct(data ?? null))
      .catch((err) =>
        notifyError(errorMessage(err, "دریافت محصول ناموفق بود.")),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [params.slug]);

  return (
    <AdminGuard>
      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 lg:px-12">
        <AdminPageHeader
          icon={FiEdit}
          eyebrow="ویرایش محصول"
          title={product ? `ویرایش ${product.name}` : "ویرایش محصول"}
          description="مشخصات محصول را تغییر دهید و ذخیره کنید."
          backHref="/admin/products"
          backLabel="بازگشت به لیست محصولات"
        />

        {loading ? (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-8 text-sm font-bold text-muted">
            <FiLoader className="animate-spin text-accent" aria-hidden />
            در حال دریافت اطلاعات محصول...
          </div>
        ) : product ? (
          <ProductForm mode="edit" product={product} />
        ) : (
          <p className="rounded-lg border border-danger-soft bg-danger-soft p-6 text-sm font-bold text-danger">
            محصولی با این اسلاگ پیدا نشد.
          </p>
        )}
      </main>
    </AdminGuard>
  );
}
