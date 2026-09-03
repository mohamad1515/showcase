"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FiPlusCircle, FiSave } from "react-icons/fi";
import { createProduct, updateProduct } from "../../lib/graphql";
import { UPLOAD_URL } from "../../lib/config";
import type {
  Product,
  ProductCategory,
  ProductInput,
  ProductType,
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

const categories: { value: ProductCategory; label: string }[] = [
  { value: "default", label: "پیشنهادی" },
  { value: "popular", label: "محبوب" },
  { value: "best-selling", label: "پرفروش" },
];

const productTypes: { value: string; label: string }[] = [
  { value: "powder", label: "پودر" },
  { value: "liquid", label: "مایع" },
  { value: "tablet", label: "قرص" },
  { value: "capsule", label: "کپسول" },
];

const emptyForm: ProductInput = {
  name: "",
  tagline: "",
  summary: "",
  description: "",
  features: [],
  category: "default",
  productType: "powder",
  price: "",
  weight: "",
  quantity: "1",
  tags: [],
  stock: 100,
  images: [],
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
        name: product.name,
        tagline: product.tagline,
        summary: product.summary,
        description: product.description,
        features: product.features,
        category: product.category,
        productType: product.productType,
        price: product.price,
        weight: product.weight,
        quantity: product.quantity,
        tags: product.tags ?? [],
        stock: product.stock,
        images: product.images ?? [],
      }
    : emptyForm;

  const [form, setForm] = useState<ProductInput>(initial);
  const [featuresText, setFeaturesText] = useState(initial.features.join("\n"));
  const [tagsText, setTagsText] = useState((initial.tags ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<FilePondFiles>([]);

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
    const images = form.images.filter(
      (image) => image !== "/images/product.png",
    );
    const payload: ProductInput = {
      ...form,
      images: images.length > 0 ? images : ["/images/product.png"],
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
        <FormField label="نام محصول">
          <input
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
            className={inputClass}
          />
        </FormField>
      </div>

      <FormField label="تیتر کوتاه">
        <input
          value={form.tagline}
          onChange={(e) => updateField("tagline", e.target.value)}
          required
          className={inputClass}
        />
      </FormField>

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

      <div className="grid gap-4 sm:grid-cols-5">
        <FormField label="دسته‌بندی">
          <select
            value={form.category}
            onChange={(e) =>
              updateField("category", e.target.value as ProductCategory)
            }
            className={inputClass}
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="نوع محصول">
          <select
            value={form.productType}
            onChange={(e) =>
              updateField("productType", e.target.value as ProductType)
            }
            className={inputClass}
          >
            {productTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
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
            placeholder={
              form.productType === "powder"
                ? "مثال: 500 یا 1.5"
                : form.productType === "liquid"
                  ? "میلی‌گرم"
                  : "گرم"
            }
          />
        </FormField>
        <FormField label="تعداد">
          <input
            value={form.quantity}
            onChange={(e) => updateField("quantity", e.target.value)}
            required
            className={inputClass}
            placeholder={
              form.productType === "tablet" || form.productType === "capsule"
                ? "مثال: 30"
                : form.productType === "liquid"
                  ? "تعداد بطری"
                  : "تعداد"
            }
          />
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

      <FormField label="تصاویر محصول">
        <FilePond
          files={files}
          onupdatefiles={handleFileUpdate}
          allowMultiple
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
              updateField("images", [
                ...(form.images || []),
                file.serverId as string,
              ]);
            }
          }}
        />
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
