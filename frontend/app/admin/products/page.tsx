"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import {
  FiBox,
  FiGrid,
  FiPlusCircle,
  FiStar,
  FiTrash2,
  FiTrendingUp,
} from "react-icons/fi";
import DataGrid from "../../components/admin/DataGrid";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import { Pill } from "../../components/admin/StatusBadge";
import AdminGuard from "../../components/AdminGuard";
import { getProducts, removeProduct } from "../../lib/graphql";
import type { Product } from "../../lib/products";
import { errorMessage, notifyError, notifySuccess } from "../../lib/toast";

const categoryLabels: Record<Product["category"], string> = {
  default: "پیشنهادی",
  popular: "محبوب",
  "best-selling": "پرفروش",
};

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-surface p-5">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-accent-soft text-lg text-accent">
        <Icon aria-hidden />
      </span>
      <div>
        <p className="text-sm font-bold text-muted">{label}</p>
        <p className="tabular-fa mt-1 text-2xl font-black text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

function ActionsCell({
  data,
  onRemove,
}: {
  data: Product;
  onRemove: (p: Product) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/products/${data.slug}/edit`}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-black text-foreground transition hover:border-accent hover:text-accent"
      >
        ویرایش
      </Link>
      <button
        type="button"
        onClick={() => onRemove(data)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-danger-soft bg-danger-soft px-3 text-xs font-black text-danger transition hover:bg-danger/10"
      >
        <FiTrash2 aria-hidden />
        حذف
      </button>
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = useMemo(
    () => ({
      total: products.length,
      popular: products.filter((p) => p.category === "popular").length,
      bestSelling: products.filter((p) => p.category === "best-selling").length,
    }),
    [products],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await getProducts());
    } catch (err) {
      notifyError(errorMessage(err, "دریافت محصولات ناموفق بود."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleRemove(product: Product) {
    if (!window.confirm(`محصول «${product.name}» حذف شود؟`)) return;
    try {
      await removeProduct(product.slug);
      await refresh();
      notifySuccess("محصول حذف شد.");
    } catch (err) {
      notifyError(errorMessage(err, "حذف محصول ناموفق بود."));
    }
  }

  const columnDefs: ColDef<Product>[] = [
    { field: "name", headerName: "نام محصول", minWidth: 200 },
    { field: "slug", headerName: "اسلاگ", minWidth: 150 },
    {
      field: "category",
      headerName: "دسته‌بندی",
      maxWidth: 140,
      cellRenderer: (p: ICellRendererParams<Product>) => (
        <Pill>{categoryLabels[p.value as Product["category"]]}</Pill>
      ),
    },
    { field: "price", headerName: "قیمت (تومان)", maxWidth: 150 },
    { field: "weight", headerName: "وزن", maxWidth: 120 },
    { field: "quantity", headerName: "تعداد", maxWidth: 100 },
    {
      headerName: "عملیات",
      minWidth: 200,
      sortable: false,
      filter: false,
      cellRenderer: (p: ICellRendererParams<Product>) =>
        p.data ? <ActionsCell data={p.data} onRemove={handleRemove} /> : null,
    },
  ];

  return (
    <AdminGuard>
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <AdminPageHeader
          icon={FiGrid}
          eyebrow="پنل ادمین"
          title="مدیریت محصولات"
          description="محصولات را از همین صفحه به سرویس GraphQL بک‌اند اضافه، ویرایش یا حذف کنید."
          action={
            <Link
              href="/admin/products/new"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-5 text-sm font-black text-white transition hover:bg-accent-strong"
            >
              <FiPlusCircle aria-hidden />
              محصول جدید
            </Link>
          }
        />

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard icon={FiBox} label="کل محصولات" value={stats.total} />
          <StatCard icon={FiStar} label="محبوب" value={stats.popular} />
          <StatCard
            icon={FiTrendingUp}
            label="پرفروش"
            value={stats.bestSelling}
          />
        </section>

        <DataGrid<Product>
          rowData={products}
          columnDefs={columnDefs}
          loading={loading}
        />
      </main>
    </AdminGuard>
  );
}
