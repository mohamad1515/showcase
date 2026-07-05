"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FiPlusCircle, FiSave } from "react-icons/fi";
import { createProduct, updateProduct } from "../../lib/graphql";
import type {
  Product,
  ProductCategory,
  ProductInput,
} from "../../lib/products";
import { errorMessage, notifyError, notifySuccess } from "../../lib/toast";
import FormField, { inputClass, textareaClass } from "./FormField";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";

import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

registerPlugin(FilePondPluginImagePreview);

const categories: { value: ProductCategory; label: string }[] = [
  { value: "default", label: "پیشنهادی" },
  { value: "popular", label: "محبوب" },
  { value: "best-selling", label: "پرفروش" },
];

const emptyForm: ProductInput = {
  slug: "",
  name: "",
  tagline: "",
  summary: "",
  description: "",
  features: [],
  category: "default",
  price: "",
  weight: "",
  quantity: "1",
  images: [],
};

const toLines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

type Props = {
  mode: "create" | "edit";
  product?: Product;
};

export default function ProductForm({ mode, product }: Props) {
  const router = useRouter();
  const initial = product
    ? {
        slug: product.slug,
        name: product.name,
        tagline: product.tagline,
        summary: product.summary,
        description: product.description,
        features: product.features,
        category: product.category,
        price: product.price,
        weight: product.weight,
        quantity: product.quantity,
        images: product.images ?? [],
      }
    : emptyForm;

  const [form, setForm] = useState<ProductInput>(initial);
  const [featuresText, setFeaturesText] = useState(initial.features.join("\n"));
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<any[]>([]);

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
      images,
      features: toLines(featuresText),
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
        <FormField label="اسلاگ">
          <input
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            required
            dir="ltr"
            className={`${inputClass} text-left`}
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

      <div className="grid gap-4 sm:grid-cols-4">
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
        <FormField label="قیمت">
          <input
            value={form.price}
            onChange={(e) => updateField("price", e.target.value)}
            required
            className={inputClass}
          />
        </FormField>
        <FormField label="وزن">
          <input
            value={form.weight}
            onChange={(e) => updateField("weight", e.target.value)}
            required
            className={inputClass}
          />
        </FormField>
        <FormField label="تعداد">
          <input
            value={form.quantity}
            onChange={(e) => updateField("quantity", e.target.value)}
            required
            className={inputClass}
          />
        </FormField>
      </div>

      <FormField label="تصاویر محصول">
        <FilePond
          files={files}
          onupdatefiles={setFiles}
          allowMultiple
          name="file"
          server={{
            process: {
              url: "http://localhost:4000/upload",

              onload: (response) => {
                const result = JSON.parse(response);
                return result.url;
              },
            },
          }}
          onprocessfile={(error, file) => {
            if (!error && file.serverId) {
              updateField("images", [file.serverId as string]);
            }
          }}
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
