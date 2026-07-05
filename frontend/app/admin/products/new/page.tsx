"use client";

import { FiPlusCircle } from "react-icons/fi";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";
import ProductForm from "../../../components/admin/ProductForm";
import AdminGuard from "../../../components/AdminGuard";

export default function NewProductPage() {
  return (
    <AdminGuard>
      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 lg:px-12">
        <AdminPageHeader
          icon={FiPlusCircle}
          eyebrow="محصول جدید"
          title="افزودن محصول"
          description="مشخصات کامل محصول را وارد کنید. هر ویژگی یا تصویر را در یک خط جدا بنویسید."
          backHref="/admin/products"
          backLabel="بازگشت به لیست محصولات"
        />
        <ProductForm mode="create" />
      </main>
    </AdminGuard>
  );
}
