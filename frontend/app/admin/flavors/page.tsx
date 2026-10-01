'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { FiArrowLeft, FiEdit, FiPlus, FiTrash2 } from 'react-icons/fi';
import AdminGuard from '../../components/AdminGuard';
import DataGrid from '../../components/admin/DataGrid';
import Modal from '../../components/admin/CategoriesModal';
import { createFlavor, getFlavors, removeFlavor, updateFlavor } from '../../lib/graphql';
import type { Flavor } from '../../lib/products';
import { errorMessage, notifyError, notifySuccess } from '../../lib/toast';

type ModalState = { mode: 'create' } | { mode: 'edit'; flavor: Flavor } | null;

function FlavorForm({
  initial,
  submitLabel,
  saving,
  onSubmit,
  onCancel,
}: {
  initial: { name: string };
  submitLabel: string;
  saving: boolean;
  onSubmit: (values: { name: string }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="grid gap-4"
    >
      <label className="block">
        <span className="text-foreground text-sm font-bold">نام طعم</span>
        <input
          value={form.name}
          onChange={(e) => setForm({ name: e.target.value })}
          required
          autoFocus
          className="admin-input"
        />
      </label>

      <div className="mt-2 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="border-border bg-surface text-foreground hover:border-accent hover:text-accent h-11 rounded-md border px-5 text-sm font-black transition"
        >
          انصراف
        </button>
        <button
          type="submit"
          disabled={saving}
          className="bg-accent hover:bg-accent-strong h-11 rounded-md px-6 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? 'در حال ذخیره...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

function ActionsCell({
  data,
  onEdit,
  onRemove,
}: {
  data: Flavor;
  onEdit: (flavor: Flavor) => void;
  onRemove: (flavor: Flavor) => void;
}) {
  return (
    <div className="flex h-full items-center gap-2">
      <button
        type="button"
        onClick={() => onEdit(data)}
        className="border-border text-foreground hover:border-accent hover:text-accent inline-flex h-9 items-center gap-1.5 rounded-md border bg-[#d5d6d6] px-3 text-xs font-black transition"
      >
        <FiEdit aria-hidden />
        ویرایش
      </button>
      <button
        type="button"
        onClick={() => onRemove(data)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 text-xs font-black text-red-600 transition hover:bg-red-100"
      >
        <FiTrash2 aria-hidden />
        حذف
      </button>
    </div>
  );
}

export default function AdminFlavorsPage() {
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setFlavors(await getFlavors());
    } catch (err) {
      notifyError(errorMessage(err, 'دریافت طعم‌ها ناموفق بود.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const closeModal = useCallback(() => setModal(null), []);

  async function handleSubmit(values: { name: string }) {
    setSaving(true);
    try {
      if (modal?.mode === 'edit') {
        await updateFlavor(modal.flavor.id, values.name);
        notifySuccess('طعم با موفقیت ویرایش شد.');
      } else {
        await createFlavor(values.name);
        notifySuccess('طعم جدید اضافه شد.');
      }
      setModal(null);
      await refresh();
    } catch (err) {
      notifyError(errorMessage(err, 'ذخیره طعم ناموفق بود.'));
    } finally {
      setSaving(false);
    }
  }

  const handleDelete = useCallback(
    async (flavor: Flavor) => {
      if (!window.confirm(`طعم «${flavor.name}» حذف شود؟`)) return;
      try {
        await removeFlavor(flavor.id);
        notifySuccess('طعم حذف شد.');
        await refresh();
      } catch (err) {
        notifyError(errorMessage(err, 'حذف طعم ناموفق بود.'));
      }
    },
    [refresh],
  );

  const columnDefs = useMemo<ColDef<Flavor>[]>(
    () => [
      { field: 'name', headerName: 'نام طعم', minWidth: 220 },
      {
        headerName: 'عملیات',
        minWidth: 220,
        maxWidth: 240,
        sortable: false,
        filter: false,
        cellRenderer: (p: ICellRendererParams<Flavor>) =>
          p.data ? (
            <ActionsCell
              data={p.data}
              onEdit={(flavor) => setModal({ mode: 'edit', flavor })}
              onRemove={handleDelete}
            />
          ) : null,
      },
    ],
    [handleDelete],
  );

  const initial = modal?.mode === 'edit' ? { name: modal.flavor.name } : { name: '' };

  return (
    <AdminGuard>
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <section className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-foreground text-2xl font-black sm:text-3xl">مدیریت طعم‌ها</h1>
          </div>

          <Link
            href="/admin"
            className="border-border bg-surface text-foreground hover:border-accent hover:text-accent inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-black transition"
          >
            بازگشت به داشبورد
            <FiArrowLeft aria-hidden />
          </Link>
        </section>

        <section className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setModal({ mode: 'create' })}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-emerald-500 px-5 text-sm font-black text-white transition hover:cursor-pointer hover:bg-emerald-700"
          >
            <FiPlus aria-hidden />
            افزودن
          </button>
        </section>

        <DataGrid<Flavor> rowData={flavors} columnDefs={columnDefs} loading={loading} />

        <Modal
          open={modal !== null}
          title={modal?.mode === 'edit' ? 'ویرایش طعم' : 'افزودن طعم'}
          onClose={closeModal}
        >
          <FlavorForm
            key={modal?.mode === 'edit' ? modal.flavor.id : 'create'}
            initial={initial}
            submitLabel={modal?.mode === 'edit' ? 'ویرایش' : 'افزودن'}
            saving={saving}
            onSubmit={handleSubmit}
            onCancel={closeModal}
          />
        </Modal>
      </main>
    </AdminGuard>
  );
}
