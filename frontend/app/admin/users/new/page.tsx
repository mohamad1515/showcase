"use client";

import { FiUserPlus } from "react-icons/fi";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";
import UserForm from "../../../components/admin/UserForm";
import AdminGuard from "../../../components/AdminGuard";

export default function NewUserPage() {
  return (
    <AdminGuard>
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 lg:px-12">
        <AdminPageHeader
          icon={FiUserPlus}
          eyebrow="کاربر جدید"
          title="افزودن کاربر"
          description="نام، ایمیل و رمز عبور کاربر جدید را وارد کنید."
          backHref="/admin/users"
          backLabel="بازگشت به لیست کاربران"
        />
        <UserForm mode="create" />
      </main>
    </AdminGuard>
  );
}
