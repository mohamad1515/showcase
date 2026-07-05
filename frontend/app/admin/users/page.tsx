"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { FiEdit2, FiPower, FiUserPlus, FiUsers } from "react-icons/fi";
import DataGrid from "../../components/admin/DataGrid";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import { ActiveBadge, Pill } from "../../components/admin/StatusBadge";
import AdminGuard from "../../components/AdminGuard";
import { getUsers, setUserActive } from "../../lib/graphql";
import type { AdminUser } from "../../lib/products";
import { errorMessage, notifyError, notifySuccess } from "../../lib/toast";

function ActionsCell({
  data,
  onToggle,
}: {
  data: AdminUser;
  onToggle: (u: AdminUser) => void;
}) {
  const isAdmin = data.role?.toLowerCase() === "admin";

  return (
    <div className="flex items-center gap-2">
      {!isAdmin && (
        <>
          <Link
            href={`/admin/users/${data.id}/edit`}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-black text-foreground transition hover:border-accent hover:text-accent"
          >
            <FiEdit2 aria-hidden />
            ویرایش
          </Link>

          <button
            type="button"
            onClick={() => onToggle(data)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-black text-foreground transition hover:border-accent hover:text-accent"
          >
            <FiPower aria-hidden />
            {data.is_active ? "غیرفعال کردن" : "فعال کردن"}
          </button>
        </>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await getUsers());
    } catch (err) {
      notifyError(errorMessage(err, "دریافت کاربران ناموفق بود."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleToggle(user: AdminUser) {
    try {
      await setUserActive(user.id.toString(), !user.is_active);
      await refresh();
      notifySuccess(
        `کاربر ${user.name} ${user.is_active ? "غیرفعال" : "فعال"} شد.`,
      );
    } catch (err) {
      notifyError(errorMessage(err, "بروزرسانی وضعیت ناموفق بود."));
    }
  }

  const columnDefs: ColDef<AdminUser>[] = [
    { field: "name", headerName: "نام کامل", minWidth: 180 },
    { field: "email", headerName: "ایمیل", minWidth: 220 },
    {
      field: "role",
      headerName: "نقش",
      maxWidth: 130,
      cellRenderer: (p: ICellRendererParams<AdminUser>) => (
        <Pill>{p.value}</Pill>
      ),
    },
    {
      field: "is_active",
      headerName: "وضعیت",
      maxWidth: 130,
      cellRenderer: (p: ICellRendererParams<AdminUser>) => (
        <ActiveBadge active={Boolean(p.value)} />
      ),
    },
    {
      headerName: "عملیات",
      minWidth: 220,
      sortable: false,
      filter: false,
      cellRenderer: (p: ICellRendererParams<AdminUser>) =>
        p.data ? <ActionsCell data={p.data} onToggle={handleToggle} /> : null,
    },
  ];

  return (
    <AdminGuard>
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <AdminPageHeader
          icon={FiUsers}
          eyebrow="مدیریت کاربران"
          title="کاربران سایت"
          description="کاربران را مشاهده کنید، حساب جدید بسازید و وضعیت دسترسی آن‌ها را فعال یا غیرفعال کنید."
          action={
            <Link
              href="/admin/users/new"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-5 text-sm font-black text-white transition hover:bg-accent-strong"
            >
              <FiUserPlus aria-hidden />
              کاربر جدید
            </Link>
          }
        />

        <DataGrid<AdminUser>
          rowData={users}
          columnDefs={columnDefs}
          loading={loading}
        />
      </main>
    </AdminGuard>
  );
}
