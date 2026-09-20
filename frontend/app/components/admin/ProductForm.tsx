"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FiPlusCircle, FiSave } from "react-icons/fi";
import {
  createProduct,
  getBrands,
  getCategories,
  getFlavors,
  updateProduct,
} from "../../lib/graphql";
import { UPLOAD_URL } from "../../lib/config";
import type {
  Product,
  ProductInput,
  Category,
  Flavor,
  Brand,
} from "../../lib/products";
import { errorMessage, notifyError, notifySuccess } from "../../lib/toast";
import FormField, { inputClass, textareaClass } from "./FormField";
import { FilePond, registerPlugin } from "react-filepond";
import type { FilePondFile } from "filepond";
import "filepond/dist/filepond.min.css";

import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

registerPlugin(FilePondPluginImagePreview);

type FilePondFiles = NonNullable<
  React.ComponentProps<typeof FilePond>["files"]
>;

const emptyForm: ProductInput = {
  persianName: "",
  englishName: "",
  brand: "",
  brands: [],
  status: "active",
  flavor: "",
  flavors: [],
  productType: "powder",
  summary: "",
  description: "",
  features: [],
  category: "",
  price: "",
  weight: "",
  compareAtPrice: "",
  tags: [],
  stock: 100,
  mainImage: "/images/product.png",
  galleryImages: [],
};

const toLines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const toTags = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const formatPrice = (value: string): string => {
  // Remove non-digit characters
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return value;

  // Convert to number and format with thousands separator
  return Number(digits).toLocaleString("en-US");
};

type Props = {
  mode: "create" | "edit";
  product?: Product;
};

export default function ProductForm({ mode, product }: Props) {
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
        compareAtPrice: product.compareAtPrice ?? "",
        weight: product.weight,
        tags: product.tags ?? [],
        stock: product.stock,
        mainImage: product.mainImage,
        galleryImages: product.galleryImages ?? [],
      }
    : emptyForm;

  const [form, setForm] = useState<ProductInput>(initial);
  const [featuresText, setFeaturesText] = useState(initial.features.join("\n"));
  const [tagsText, setTagsText] = useState((initial.tags ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [files, setFiles] = useState<FilePondFiles>([]);

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

  function updateField<K extends keyof ProductInput>(
    key: K,
    value: ProductInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const images = form.galleryImages.filter(
      (image) => image !== "/images/product.png",
    );
    const payload: ProductInput = {
      ...form,
      mainImage: images.includes(form.mainImage)
        ? form.mainImage
        : (images[0] ?? "/images/product.png"),
      galleryImages: images.length > 0 ? images : ["/images/product.png"],
      features: toLines(featuresText),
      tags: toTags(tagsText),
    };

    try {
      if (mode === "edit" && product) {
        await updateProduct(product.slug, payload);
        notifySuccess("محصول با موفقیت ویرایش شد.");
      } else {
        await createProduct(payload);
        notifySuccess("محصول جدید اضافه شد.");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      notifyError(errorMessage(err, "ذخیره محصول ناموفق بود."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="نام فارسی">
          <input
            value={form.persianName}
            onChange={(e) => updateField("persianName", e.target.value)}
            required
            className={inputClass}
          />
        </FormField>
      </div>

      <FormField label="نام انگلیسی">
        <input
          value={form.englishName}
          onChange={(e) => updateField("englishName", e.target.value)}
          required
          className={inputClass}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="برند">
          <select
            value={form.brand}
            onChange={(e) => {
              updateField("brand", e.target.value);
              updateField("brands", e.target.value ? [e.target.value] : []);
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
        <FormField label="نوع محصول">
          <select
            value={form.productType}
            onChange={(e) => updateField("productType", e.target.value)}
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
        <FormField label="طعم‌ها" hint="یک یا چند طعم را انتخاب کنید">
          <div className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-2">
            {flavors.map((flavor) => (
              <label
                key={flavor.id}
                className="flex items-center gap-2 text-sm font-bold"
              >
                <input
                  type="checkbox"
                  checked={(form.flavors ?? []).includes(flavor.name)}
                  onChange={(event) => {
                    const nextFlavors = event.target.checked
                      ? [...new Set([...(form.flavors ?? []), flavor.name])]
                      : (form.flavors ?? []).filter(
                          (name) => name !== flavor.name,
                        );
                    updateField("flavors", nextFlavors);
                    updateField("flavor", nextFlavors[0] ?? "");
                  }}
                  className="h-4 w-4 accent-[var(--brand)]"
                />
                {flavor.name}
              </label>
            ))}
          </div>
        </FormField>
        <FormField label="وضعیت">
          <select
            value={form.status}
            onChange={(e) => updateField("status", e.target.value)}
            className={inputClass}
          >
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
            <option value="out_of_stock">ناموجود</option>
          </select>
        </FormField>
      </div>

      <FormField label="خلاصه">
        <textarea
          value={form.summary}
          onChange={(e) => updateField("summary", e.target.value)}
          required
          rows={3}
          className={textareaClass}
        />
      </FormField>

      <FormField label="توضیحات کامل">
        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="دسته‌بندی">
          <select
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
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
        <FormField label="قیمت (تومان)">
          <div className="relative">
            <input
              value={form.price}
              onChange={(e) => {
                const formatted = formatPrice(e.target.value);
                updateField("price", formatted);
              }}
              required
              className={inputClass}
              placeholder="مثال: 100000"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted">
              تومان
            </span>
          </div>
        </FormField>
        <FormField label="وزن/مقدار">
          <input
            value={form.weight}
            onChange={(e) => updateField("weight", e.target.value)}
            required
            className={inputClass}
            placeholder="مثال: ۱ کیلوگرم"
          />
        </FormField>
        <FormField label="قیمت قبل از تخفیف">
          <div className="relative">
            <input
              value={form.compareAtPrice ?? ""}
              onChange={(e) =>
                updateField("compareAtPrice", formatPrice(e.target.value))
              }
              className={inputClass}
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted">
              تومان
            </span>
          </div>
        </FormField>
        <FormField label="موجودی">
          <input
            type="number"
            min={0}
            value={form.stock ?? 0}
            onChange={(e) => updateField("stock", Number(e.target.value))}
            required
            className={inputClass}
          />
        </FormField>
      </div>

      <FormField
        label="تصویر محصول"
        hint="تصویر اصلی را با کلیک روی یکی از تصاویر انتخاب کنید."
      >
        <FilePond
          files={files}
          onupdatefiles={handleFileUpdate}
          allowMultiple
          labelIdle="تصویر مورد نظر را آپلود کنید"
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
                const galleryImages = [
                  ...new Set([...(current.galleryImages || []), nextImage]),
                ];
                return {
                  ...current,
                  galleryImages,
                  mainImage:
                    current.mainImage === "/images/product.png"
                      ? nextImage
                      : current.mainImage,
                };
              });
            }
          }}
        />
        {form.galleryImages.filter((image) => image !== "/images/product.png")
          .length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {form.galleryImages
              .filter((image) => image !== "/images/product.png")
              .map((image) => (
                <button
                  key={image}
                  type="button"
                  title="انتخاب به عنوان تصویر اصلی"
                  onClick={() => updateField("mainImage", image)}
                  aria-pressed={form.mainImage === image}
                  className={`relative aspect-square overflow-hidden rounded-md border-2 ${form.mainImage === image ? "border-accent ring-2 ring-accent ring-offset-2" : "border-border"}`}
                >
                  <img
                    src={image}
                    alt={`پیش‌نمایش ${product?.persianName ?? "محصول"}`}
                    className="h-full w-full object-cover"
                  />
                  {form.mainImage === image && (
                    <span className="absolute inset-x-1 bottom-1 rounded bg-accent px-1 py-0.5 text-[10px] font-black text-white">
                      تصویر اصلی
                    </span>
                  )}
                </button>
              ))}
          </div>
        )}
      </FormField>

      <FormField
        label="برچسب‌ها (تگ‌ها)"
        hint="مثال: کاهش وزن، آنتی اکسیدان، ارگانیک"
      >
        <input
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          className={inputClass}
          placeholder="برچسب‌ها را با کاما جدا کنید"
        />
      </FormField>

      <button
        type="submit"
        disabled={saving}
        className="mt-2 flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-5 text-sm font-black text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
      >
        {saving ? (
          "در حال ذخیره..."
        ) : mode === "edit" ? (
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
    </form>
  );
}
