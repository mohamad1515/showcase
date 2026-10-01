'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FiCheck, FiPlus, FiPlusCircle, FiSave } from 'react-icons/fi';
import {
  createFlavor,
  createProduct,
  getBrands,
  getCategories,
  getFlavors,
  updateProduct,
} from '../../lib/graphql';
import { UPLOAD_URL } from '../../lib/config';
import type { Product, ProductInput, Category, Flavor, Brand } from '../../lib/products';
import { errorMessage, notifyError, notifySuccess } from '../../lib/toast';
import FormField, { inputClass, textareaClass } from './FormField';
import { FilePond, registerPlugin } from 'react-filepond';
import type { FilePondFile } from 'filepond';
import 'filepond/dist/filepond.min.css';

import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

registerPlugin(FilePondPluginImagePreview);

type FilePondFiles = NonNullable<React.ComponentProps<typeof FilePond>['files']>;

const PLACEHOLDER_IMAGE = '/images/product.png';

const emptyForm: ProductInput = {
  persianName: '',
  englishName: '',
  brand: '',
  brands: [],
  status: 'active',
  flavor: '',
  flavors: [],
  productType: 'powder',
  summary: '',
  description: '',
  features: [],
  category: '',
  price: '',
  weight: '',
  compareAtPrice: '',
  tags: [],
  stock: 100,
  mainImage: PLACEHOLDER_IMAGE,
  galleryImages: [],
};

const toLines = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const toTags = (value: string) =>
  value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

const formatPrice = (value: string): string => {
  // Remove non-digit characters
  const digits = value.replace(/[^\d]/g, '');
  if (!digits) return value;

  // Convert to number and format with thousands separator
  return Number(digits).toLocaleString('en-US');
};

type Props = {
  mode: 'create' | 'edit';
  product?: Product;
  layout?: 'modal' | 'page';
  onSuccess?: () => void;
  onCancel?: () => void;
};

function parseWeight(weight: string) {
  if (!weight) return { weightValue: '', weightUnit: 'kg' as const };

  const match = weight.match(/([\d.,]+)\s*(kg|kilogram|gr|gram|g|کیلو|کیلوگرم|گرم)?/i);
  if (!match) {
    return { weightValue: weight.replace(/[^\d.]/g, ''), weightUnit: 'kg' as const };
  }

  const rawValue = match[1].replace(/,/g, '');
  const unit = (match[2] ?? 'kg').toLowerCase();
  const normalizedUnit =
    unit.includes('g') || unit.includes('گرم') || unit.includes('gr') ? 'gr' : 'kg';

  return {
    weightValue: rawValue,
    weightUnit: normalizedUnit as 'kg' | 'gr',
  };
}

/** A titled group of fields. Groups are separated by a divider instead of nested cards. */
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-border grid gap-4 border-b py-6 first:pt-0 last:border-b-0 last:pb-0">
      <div>
        <h3 className="text-foreground text-base font-black">{title}</h3>
        {description && <p className="text-muted mt-1 text-xs leading-6">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function ProductForm({
  mode,
  product,
  layout = 'modal',
  onSuccess,
  onCancel,
}: Props) {
  const router = useRouter();
  const initial = product
    ? {
        persianName: product.persianName,
        englishName: product.englishName,
        brand: product.brand,
        brands: product.brands ?? (product.brand ? [product.brand] : []),
        status: product.status,
        flavor: product.flavor,
        flavors: product.flavors ?? (product.flavor ? [product.flavor] : []),
        productType: product.productType,
        summary: product.summary,
        description: product.description,
        features: product.features,
        category: product.category,
        price: product.price,
        compareAtPrice: product.compareAtPrice ?? '',
        weight: product.weight,
        tags: product.tags ?? [],
        stock: product.stock,
        mainImage: product.mainImage,
        galleryImages: product.galleryImages ?? [],
      }
    : emptyForm;

  const [form, setForm] = useState<ProductInput>(initial);
  const [featuresText, setFeaturesText] = useState(initial.features.join('\n'));
  const [tagsText, setTagsText] = useState((initial.tags ?? []).join(', '));
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [newFlavorName, setNewFlavorName] = useState('');
  const [files, setFiles] = useState<FilePondFiles>([]);
  const initialWeight = parseWeight(product?.weight ?? '');
  const [weightValue, setWeightValue] = useState(initialWeight.weightValue);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'gr'>(initialWeight.weightUnit);

  React.useEffect(() => {
    Promise.all([getCategories(), getFlavors(), getBrands()])
      .then(([nextCategories, nextFlavors, nextBrands]) => {
        setCategories(nextCategories);
        setFlavors(nextFlavors);
        setBrands(nextBrands);
      })
      .catch(() => {
        setCategories([]);
        setFlavors([]);
        setBrands([]);
      });
  }, []);

  function handleFileUpdate(nextFiles: FilePondFile[]) {
    setFiles(nextFiles as unknown as FilePondFiles);
  }

  function updateField<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleFlavor(name: string) {
    const selected = form.flavors ?? [];
    const nextFlavors = selected.includes(name)
      ? selected.filter((item) => item !== name)
      : [...new Set([...selected, name])];
    updateField('flavors', nextFlavors);
    updateField('flavor', nextFlavors[0] ?? '');
  }

  async function handleAddFlavor() {
    const value = newFlavorName.trim();
    if (!value) return;

    try {
      const created = await createFlavor(value);
      setFlavors((current) => {
        const exists = current.some((item) => item.name === created.name);
        return exists ? current : [...current, created];
      });
      const nextFlavors = [...new Set([...(form.flavors ?? []), created.name])];
      updateField('flavors', nextFlavors);
      updateField('flavor', nextFlavors[0] ?? '');
      setNewFlavorName('');
      notifySuccess('طعم جدید اضافه شد.');
    } catch (err: unknown) {
      notifyError(errorMessage(err, 'افزودن طعم جدید ناموفق بود.'));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const images = form.galleryImages.filter((image) => image !== PLACEHOLDER_IMAGE);
    const payload: ProductInput = {
      ...form,
      weight: weightValue ? `${weightValue} ${weightUnit === 'kg' ? 'کیلوگرم' : 'گرم'}` : '',
      mainImage: images.includes(form.mainImage)
        ? form.mainImage
        : (images[0] ?? PLACEHOLDER_IMAGE),
      galleryImages: images.length > 0 ? images : [PLACEHOLDER_IMAGE],
      features: toLines(featuresText),
      tags: toTags(tagsText),
    };

    try {
      if (mode === 'edit' && product) {
        await updateProduct(product.slug, payload);
        notifySuccess('محصول با موفقیت ویرایش شد.');
      } else {
        await createProduct(payload);
        notifySuccess('محصول جدید اضافه شد.');
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/products');
        router.refresh();
      }
    } catch (err: unknown) {
      notifyError(errorMessage(err, 'ذخیره محصول ناموفق بود.'));
    } finally {
      setSaving(false);
    }
  }

  const galleryImages = form.galleryImages.filter((image) => image !== PLACEHOLDER_IMAGE);

  return (
    <form
      onSubmit={handleSubmit}
      className={layout === 'page' ? 'grid' : 'flex h-full min-h-0 flex-col'}
    >
      <div
        className={
          layout === 'page'
            ? 'px-1 py-5 sm:px-2 sm:py-6'
            : 'min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8'
        }
      >
        <Section title="اطلاعات اصلی">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="نام فارسی">
              <input
                value={form.persianName}
                onChange={(e) => updateField('persianName', e.target.value)}
                required
                className={inputClass}
              />
            </FormField>
            <FormField label="نام انگلیسی">
              <input
                value={form.englishName}
                onChange={(e) => updateField('englishName', e.target.value)}
                required
                dir="ltr"
                className={inputClass}
              />
            </FormField>
          </div>
        </Section>

        <Section title="دسته‌بندی و مشخصات">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="برند">
              <select
                value={form.brand}
                onChange={(e) => {
                  updateField('brand', e.target.value);
                  updateField('brands', e.target.value ? [e.target.value] : []);
                }}
                required
                className={inputClass}
              >
                <option value="">انتخاب برند</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.name}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="دسته‌بندی">
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                required
                className={inputClass}
              >
                <option value="">انتخاب دسته‌بندی</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="نوع محصول">
              <select
                value={form.productType}
                onChange={(e) => updateField('productType', e.target.value)}
                required
                className={inputClass}
              >
                <option value="powder">پودر</option>
                <option value="liquid">مایع</option>
                <option value="beverage">نوشیدنی</option>
                <option value="tablet">قرص</option>
                <option value="capsule">کپسول</option>
              </select>
            </FormField>
            <FormField label="وضعیت">
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
                className={inputClass}
              >
                <option value="active">فعال</option>
                <option value="inactive">غیرفعال</option>
                <option value="out_of_stock">ناموجود</option>
              </select>
            </FormField>
          </div>

          <FormField label="طعم‌ها" hint="یک یا چند طعم را انتخاب کنید">
            <div className="grid gap-3">
              {flavors.length > 0 && (
                <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                  {flavors.map((flavor) => {
                    const selected = (form.flavors ?? []).includes(flavor.name);
                    return (
                      <button
                        key={flavor.id}
                        type="button"
                        onClick={() => toggleFlavor(flavor.name)}
                        aria-pressed={selected}
                        className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-bold transition ${
                          selected
                            ? 'border-accent bg-accent text-white'
                            : 'border-border bg-background text-foreground hover:border-accent hover:text-accent'
                        }`}
                      >
                        {selected && <FiCheck aria-hidden className="h-3.5 w-3.5" />}
                        {flavor.name}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  value={newFlavorName}
                  onChange={(e) => setNewFlavorName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFlavor();
                    }
                  }}
                  className={`${inputClass} flex-1`}
                  placeholder="طعم مورد نظر نیست؟ نام آن را بنویسید"
                />
                <button
                  type="button"
                  onClick={handleAddFlavor}
                  disabled={!newFlavorName.trim()}
                  className="border-border bg-background text-foreground hover:border-accent hover:text-accent flex h-12 shrink-0 items-center gap-1.5 rounded-md border px-4 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiPlus aria-hidden />
                  افزودن
                </button>
              </div>
            </div>
          </FormField>
        </Section>

        <Section title="قیمت و موجودی">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="قیمت (تومان)">
              <div className="relative">
                <input
                  value={form.price}
                  onChange={(e) => updateField('price', formatPrice(e.target.value))}
                  required
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="مثال: 100,000"
                />
                <span className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                  تومان
                </span>
              </div>
            </FormField>
            <FormField label="قیمت قبل از تخفیف" hint="اختیاری">
              <div className="relative">
                <input
                  value={form.compareAtPrice ?? ''}
                  onChange={(e) => updateField('compareAtPrice', formatPrice(e.target.value))}
                  inputMode="numeric"
                  className={inputClass}
                />
                <span className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                  تومان
                </span>
              </div>
            </FormField>
            <FormField label="وزن/مقدار">
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  value={weightValue}
                  onChange={(e) => setWeightValue(e.target.value)}
                  required
                  className={`${inputClass} min-w-0 flex-1`}
                  placeholder="مقدار"
                />
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'gr')}
                  className={`${inputClass} w-28 shrink-0`}
                >
                  <option value="kg">کیلو</option>
                  <option value="gr">گرم</option>
                </select>
              </div>
            </FormField>
            <FormField label="موجودی">
              <input
                type="number"
                min={0}
                value={form.stock ?? 0}
                onChange={(e) => updateField('stock', Number(e.target.value))}
                required
                className={inputClass}
              />
            </FormField>
          </div>
        </Section>

        <Section title="تصاویر" description="تصویر اصلی را با کلیک روی یکی از تصاویر انتخاب کنید.">
          <FilePond
            files={files}
            onupdatefiles={handleFileUpdate}
            allowMultiple
            labelIdle="تصویر مورد نظر را بکشید و رها کنید یا <span class='filepond--label-action'>انتخاب کنید</span>"
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
                setForm((current) => {
                  const nextImage = file.serverId as string;
                  const nextGallery = [...new Set([...(current.galleryImages || []), nextImage])];
                  return {
                    ...current,
                    galleryImages: nextGallery,
                    mainImage:
                      current.mainImage === PLACEHOLDER_IMAGE ? nextImage : current.mainImage,
                  };
                });
              }
            }}
          />
          {galleryImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {galleryImages.map((image) => (
                <button
                  key={image}
                  type="button"
                  title="انتخاب به عنوان تصویر اصلی"
                  onClick={() => updateField('mainImage', image)}
                  aria-pressed={form.mainImage === image}
                  className={`relative aspect-square overflow-hidden rounded-md border-2 transition ${
                    form.mainImage === image
                      ? 'border-accent ring-accent ring-2 ring-offset-2'
                      : 'border-border hover:border-accent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`پیش‌نمایش ${product?.persianName ?? 'محصول'}`}
                    className="h-full w-full object-cover"
                  />
                  {form.mainImage === image && (
                    <span className="bg-accent absolute inset-x-1 bottom-1 rounded px-1 py-0.5 text-center text-[10px] font-black text-white">
                      تصویر اصلی
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </Section>

        <Section title="توضیحات">
          <FormField label="خلاصه">
            <textarea
              value={form.summary}
              onChange={(e) => updateField('summary', e.target.value)}
              required
              rows={3}
              className={textareaClass}
            />
          </FormField>

          <FormField label="توضیحات کامل">
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              required
              rows={5}
              className={textareaClass}
            />
          </FormField>

          <FormField label="ویژگی‌ها" hint="هر ویژگی را در یک خط جدا وارد کنید">
            <textarea
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              required
              rows={4}
              className={textareaClass}
            />
          </FormField>

          <FormField label="برچسب‌ها" hint="مثال: کاهش وزن، آنتی اکسیدان، ارگانیک">
            <input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className={inputClass}
              placeholder="برچسب‌ها را با کاما جدا کنید"
            />
          </FormField>
        </Section>
      </div>

      <div
        className={`border-border bg-surface flex flex-col-reverse gap-3 border-t py-4 sm:flex-row ${
          layout === 'page' ? 'px-1 sm:px-2' : 'sticky bottom-0 px-5 sm:px-8'
        }`}
      >
        <button
          type="submit"
          disabled={saving}
          className="bg-accent hover:bg-accent-strong flex h-12 flex-1 items-center justify-center gap-2 rounded-md px-6 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-48 sm:flex-none"
        >
          {saving ? (
            'در حال ذخیره...'
          ) : mode === 'edit' ? (
            <>
              <FiSave aria-hidden />
              ذخیره تغییرات
            </>
          ) : (
            <>
              <FiPlusCircle aria-hidden />
              افزودن محصول
            </>
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="border-border bg-background text-foreground hover:border-accent hover:text-accent h-12 rounded-md border px-6 text-sm font-black transition"
          >
            انصراف
          </button>
        )}
      </div>
    </form>
  );
}
