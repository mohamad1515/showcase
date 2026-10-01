'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { FiArrowLeft, FiEdit, FiImage, FiPlus, FiTrash2 } from 'react-icons/fi';
import { FilePond, registerPlugin } from 'react-filepond';
import type { FilePondFile } from 'filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import AdminGuard from '../../components/AdminGuard';
import DataGrid from '../../components/admin/DataGrid';
import Modal from '../../components/admin/CategoriesModal';
import { UPLOAD_URL } from '../../lib/config';
import { createSlider, getSliders, removeSlider, updateSlider } from '../../lib/graphql';
import type { Slider } from '../../lib/products';
import { errorMessage, notifyError, notifySuccess } from '../../lib/toast';

registerPlugin(FilePondPluginImagePreview);

type ModalState = { mode: 'create' } | { mode: 'edit'; slider: Slider } | null;

type FilePondFiles = NonNullable<React.ComponentProps<typeof FilePond>['files']>;

function SliderForm({
  initial,
  saving,
  onSubmit,
  onCancel,
}: {
  initial: { title: string; subtitle: string; image: string; link: string };
  saving: boolean;
  onSubmit: (values: { title: string; subtitle: string; image: string; link: string }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [files, setFiles] = useState<FilePondFiles>([]);

  function updateField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleFileUpdate(nextFiles: FilePondFile[]) {
    setFiles(nextFiles as unknown as FilePondFiles);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="grid gap-4"
    >
      <label className="block">
        <span className="text-foreground text-sm font-bold">عنوان</span>
        <input
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          required
          className="admin-input"
        />
      </label>

      <label className="block">
        <span className="text-foreground text-sm font-bold">توضیح</span>
        <textarea
          value={form.subtitle}
          onChange={(e) => updateField('subtitle', e.target.value)}
          required
          rows={3}
          className="admin-textarea"
        />
      </label>

      <label className="block">
        <span className="text-foreground text-sm font-bold">لینک مقصد</span>
        <input
          value={form.link}
          onChange={(e) => updateField('link', e.target.value)}
          className="admin-input"
        />
      </label>

      <div className="block">
        <span className="text-foreground text-sm font-bold">تصویر اسلایدر</span>
        <div className="mt-2">
          <FilePond
            files={files}
            onupdatefiles={handleFileUpdate}
            allowMultiple={false}
            labelIdle="تصویر را آپلود کنید"
            labelButtonRemoveItem="حذف"
            labelButtonAbortItemProcessing="لغو"
            name="file"
            server={{
              process: {
                url: UPLOAD_URL,
                onload: (response) => {
                  const result = JSON.parse(response);
                  return result.url;
                },
              },
            }}
            onprocessfile={(error, file) => {
              if (!error && file.serverId) {
                const nextImage = file.serverId as string;
                setForm((current) => ({ ...current, image: nextImage }));
              }
            }}
          />
        </div>
        {form.image && (
          <div className="border-border bg-surface mt-3 rounded-md border p-2">
            <img
              src={form.image}
              alt={form.title || 'slider preview'}
              className="h-28 w-full rounded-md object-cover"
            />
          </div>
        )}
      </div>

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
          {saving ? 'در حال ذخیره...' : 'ذخیره'}
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
  data: Slider;
  onEdit: (slider: Slider) => void;
  onRemove: (slider: Slider) => void;
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

const emptyForm = {
  title: '',
  subtitle: '',
  image: '',
  link: '/products',
};

export default function AdminSlidersPage() {
  const [slides, setSlides] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setSlides(await getSliders());
    } catch (err) {
      notifyError(errorMessage(err, 'دریافت اسلایدرها ناموفق بود.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const closeModal = useCallback(() => setModal(null), []);
  const handleRefreshAfterModal = useCallback(async () => {
    setModal(null);
    await refresh();
  }, [refresh]);

  async function handleSubmit(values: {
    title: string;
    subtitle: string;
    image: string;
    link: string;
  }) {
    setSaving(true);
    try {
      if (modal?.mode === 'edit') {
        await updateSlider(modal.slider.id, values);
        notifySuccess('اسلاید با موفقیت ویرایش شد.');
      } else {
        await createSlider(values);
        notifySuccess('اسلاید جدید اضافه شد.');
      }
      await handleRefreshAfterModal();
    } catch (err) {
      notifyError(errorMessage(err, 'ذخیره اسلاید ناموفق بود.'));
    } finally {
      setSaving(false);
    }
  }

  const handleDelete = useCallback(
    async (slider: Slider) => {
      if (slides.length <= 1) {
        notifyError('حداقل یک اسلاید باید باقی بماند.');
        return;
      }
      if (!window.confirm('این اسلاید حذف شود؟')) return;
      try {
        await removeSlider(slider.id);
        await refresh();
        notifySuccess('اسلاید حذف شد.');
      } catch (err) {
        notifyError(errorMessage(err, 'حذف اسلاید ناموفق بود.'));
      }
    },
    [refresh, slides.length],
  );

  const columnDefs = useMemo<ColDef<Slider>[]>(
    () => [
      {
        headerName: 'تصویر',
        maxWidth: 120,
        cellRenderer: (p: ICellRendererParams<Slider>) =>
          p.data ? (
            <img
              src={p.data.image}
              alt={p.data.title}
              className="h-12 w-12 rounded-md object-cover"
            />
          ) : null,
      },
      { field: 'title', headerName: 'عنوان', minWidth: 180 },
      { field: 'subtitle', headerName: 'توضیح', minWidth: 220 },
      { field: 'link', headerName: 'لینک', minWidth: 180 },
      {
        headerName: 'عملیات',
        minWidth: 220,
        maxWidth: 240,
        sortable: false,
        filter: false,
        cellRenderer: (p: ICellRendererParams<Slider>) =>
          p.data ? (
            <ActionsCell
              data={p.data}
              onEdit={(slider) => setModal({ mode: 'edit', slider })}
              onRemove={handleDelete}
            />
          ) : null,
      },
    ],
    [handleDelete],
  );

  const initial =
    modal?.mode === 'edit'
      ? {
          title: modal.slider.title,
          subtitle: modal.slider.subtitle,
          image: modal.slider.image,
          link: modal.slider.link,
        }
      : emptyForm;

  return (
    <AdminGuard>
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <section className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <FiImage aria-hidden />
            </span>
            <div>
              <p className="text-accent text-sm font-black">اسلایدر</p>
              <h1 className="text-foreground text-2xl font-black sm:text-3xl">مدیریت اسلایدها</h1>
            </div>
          </div>

          <Link
            href="/admin"
            className="border-border bg-surface text-foreground hover:border-accent hover:text-accent inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-black transition"
          >
            <FiArrowLeft aria-hidden />
            بازگشت به داشبورد
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

        <DataGrid<Slider> rowData={slides} columnDefs={columnDefs} loading={loading} />

        <Modal
          open={modal !== null}
          title={modal?.mode === 'edit' ? 'ویرایش اسلایدر' : 'افزودن اسلایدر'}
          onClose={closeModal}
        >
          <SliderForm
            key={modal?.mode === 'edit' ? modal.slider.id : 'create'}
            initial={initial}
            saving={saving}
            onSubmit={handleSubmit}
            onCancel={closeModal}
          />
        </Modal>
      </main>
    </AdminGuard>
  );
}
