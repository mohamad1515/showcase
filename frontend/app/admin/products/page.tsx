'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import {
  FiBox,
  FiEdit,
  FiGrid,
  FiPlusCircle,
  FiStar,
  FiTrash2,
  FiTrendingUp,
} from 'react-icons/fi';
import DataGrid from '../../components/admin/DataGrid';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ProductForm from '../../components/admin/ProductForm';
import { Pill } from '../../components/admin/StatusBadge';
import AdminGuard from '../../components/AdminGuard';
import { getProducts, removeProduct } from '../../lib/graphql';
import type { Product } from '../../lib/products';
import { errorMessage, notifyError, notifySuccess } from '../../lib/toast';

type EditorState = { mode: 'create' } | { mode: 'edit'; product: Product } | null;

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
    <div className="border-border bg-surface flex items-center gap-4 rounded-lg border p-5">
      <span className="bg-accent-soft text-accent inline-flex h-11 w-11 items-center justify-center rounded-md text-lg">
        <Icon aria-hidden />
      </span>
      <div>
        <p className="text-muted text-sm font-bold">{label}</p>
        <p className="tabular-fa text-foreground mt-1 text-2xl font-black">{value}</p>
      </div>
    </div>
  );
}

function ActionsCell({
  data,
  onEdit,
  onRemove,
}: {
  data: Product;
  onEdit: (p: Product) => void;
  onRemove: (p: Product) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onEdit(data)}
        className="border-border bg-surface text-foreground hover:border-accent hover:text-accent inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-black transition"
      >
        <FiEdit aria-hidden />
        ویرایش
      </button>
      <button
        type="button"
        onClick={() => onRemove(data)}
        className="border-danger-soft bg-danger-soft text-danger hover:bg-danger/10 inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-black transition"
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
  const [editor, setEditor] = useState<EditorState>(null);

  const stats = useMemo(
    () => ({
      total: products.length,
      popular: products.filter((p) => p.rating >= 4).length,
      bestSelling: products.filter((p) => p.reviewCount >= 10).length,
    }),
    [products],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await getProducts());
    } catch (err) {
      notifyError(errorMessage(err, 'دریافت محصولات ناموفق بود.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const closeEditor = useCallback(() => setEditor(null), []);
  const handleRefreshAfterEditor = useCallback(async () => {
    setEditor(null);
    await refresh();
  }, [refresh]);

  async function handleRemove(product: Product) {
    if (!window.confirm(`محصول «${product.persianName}» حذف شود؟`)) return;
    try {
      await removeProduct(product.slug);
      await refresh();
      notifySuccess('محصول حذف شد.');
    } catch (err) {
      notifyError(errorMessage(err, 'حذف محصول ناموفق بود.'));
    }
  }

  const columnDefs: ColDef<Product>[] = [
    { field: 'persianName', headerName: 'نام محصول', minWidth: 200 },
    { field: 'slug', headerName: 'اسلاگ', minWidth: 150 },
    {
      field: 'category',
      headerName: 'دسته‌بندی',
      maxWidth: 140,
      cellRenderer: (p: ICellRendererParams<Product>) => <Pill>{p.value as string}</Pill>,
    },
    { field: 'price', headerName: 'قیمت (تومان)', maxWidth: 150 },
    { field: 'weight', headerName: 'وزن', maxWidth: 120 },
    {
      headerName: 'عملیات',
      minWidth: 200,
      sortable: false,
      filter: false,
      cellRenderer: (p: ICellRendererParams<Product>) =>
        p.data ? (
          <ActionsCell
            data={p.data}
            onEdit={(product) => setEditor({ mode: 'edit', product })}
            onRemove={handleRemove}
          />
        ) : null,
    },
  ];

  return (
    <AdminGuard>
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <AdminPageHeader
          icon={FiGrid}
          eyebrow="پنل ادمین"
          title="مدیریت محصولات"
          action={
            <button
              type="button"
              onClick={() => setEditor({ mode: 'create' })}
              className="bg-accent hover:bg-accent-strong inline-flex h-11 items-center gap-2 rounded-md px-5 text-sm font-black text-white transition"
            >
              <FiPlusCircle aria-hidden />
              محصول جدید
            </button>
          }
        />

        {editor ? (
          <section className="border-border bg-surface rounded-lg border p-4 sm:p-6">
            <div className="border-border mb-2 border-b pb-4">
              <p className="text-accent text-sm font-bold">مدیریت محصولات</p>
              <h2 className="text-foreground mt-1 text-xl font-black sm:text-2xl">
                {editor.mode === 'edit'
                  ? `ویرایش ${editor.product.persianName}`
                  : 'افزودن محصول جدید'}
              </h2>
              <p className="text-muted mt-2 text-sm leading-6">
                اطلاعات محصول را در بخش‌های زیر تکمیل کنید.
              </p>
            </div>
            <ProductForm
              key={editor.mode === 'edit' ? editor.product.slug : 'create'}
              mode={editor.mode}
              product={editor.mode === 'edit' ? editor.product : undefined}
              layout="page"
              onSuccess={handleRefreshAfterEditor}
              onCancel={closeEditor}
            />
          </section>
        ) : (
          <>
            <section className="mb-6 grid gap-4 sm:grid-cols-3">
              <StatCard icon={FiBox} label="کل محصولات" value={stats.total} />
              <StatCard icon={FiStar} label="محبوب" value={stats.popular} />
              <StatCard icon={FiTrendingUp} label="پرفروش" value={stats.bestSelling} />
            </section>

            <DataGrid<Product> rowData={products} columnDefs={columnDefs} loading={loading} />
          </>
        )}
      </main>
    </AdminGuard>
  );
}
