"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiEdit, FiLoader } from "react-icons/fi";
import AdminPageHeader from "../../../../components/admin/AdminPageHeader";
import UserForm from "../../../../components/admin/UserForm";
import AdminGuard from "../../../../components/AdminGuard";
import { getUsers } from "../../../../lib/graphql";
import type { AdminUser } from "../../../../lib/products";
import { errorMessage, notifyError } from "../../../../lib/toast";

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getUsers()
      .then((users) => {
        if (!active) return;
        setUser(users.find((u) => u.id.toString() === params.id) ?? null);
      })
      .catch((err) =>
        notifyError(errorMessage(err, "دریافت کاربر ناموفق بود.")),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [params.id]);

  return (
    <AdminGuard>
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 lg:px-12">
        <AdminPageHeader
          icon={FiEdit}
          eyebrow="ویرایش کاربر"
          title={user ? `ویرایش ${user.name}` : "ویرایش کاربر"}
          description="اطلاعات کاربر را تغییر دهید. رمز عبور را فقط در صورت نیاز به تغییر پر کنید."
          backHref="/admin/users"
          backLabel="بازگشت به لیست کاربران"
        />

        {loading ? (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-8 text-sm font-bold text-muted">
            <FiLoader className="animate-spin text-accent" aria-hidden />
            در حال دریافت اطلاعات کاربر...
          </div>
        ) : user ? (
          <UserForm mode="edit" user={user} />
        ) : (
          <p className="rounded-lg border border-danger-soft bg-danger-soft p-6 text-sm font-bold text-danger">
            کاربری با این شناسه پیدا نشد.
          </p>
        )}
      </main>
    </AdminGuard>
  );
}
