'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { FiEdit, FiPower, FiUserPlus, FiUsers } from 'react-icons/fi';
import DataGrid from '../../components/admin/DataGrid';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import Modal from '../../components/admin/CategoriesModal';
import UserForm from '../../components/admin/UserForm';
import { ActiveBadge, Pill } from '../../components/admin/StatusBadge';
import AdminGuard from '../../components/AdminGuard';
import { getUsers, setUserActive } from '../../lib/graphql';
import type { AdminUser } from '../../lib/products';
import { errorMessage, notifyError, notifySuccess } from '../../lib/toast';

type ModalState = { mode: 'create' } | { mode: 'edit'; user: AdminUser } | null;

function ActionsCell({
  data,
  onEdit,
  onToggle,
}: {
  data: AdminUser;
  onEdit: (user: AdminUser) => void;
  onToggle: (u: AdminUser) => void;
}) {
  const isAdmin = data.role?.toLowerCase() === 'admin';

  return (
    <div className="flex items-center gap-2">
      {!isAdmin && (
        <>
          <button
            type="button"
            onClick={() => onEdit(data)}
            className="border-border bg-surface text-foreground hover:border-accent hover:text-accent inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-black transition"
          >
            <FiEdit aria-hidden />
            ویرایش
          </button>

          <button
            type="button"
            onClick={() => onToggle(data)}
            className="border-border bg-surface text-foreground hover:border-accent hover:text-accent inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-black transition"
          >
            <FiPower aria-hidden className="text-red-500" />
            {data.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
          </button>
        </>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await getUsers());
    } catch (err) {
      notifyError(errorMessage(err, 'دریافت کاربران ناموفق بود.'));
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

  async function handleToggle(user: AdminUser) {
    try {
      await setUserActive(user.id.toString(), !user.is_active);
      await refresh();
      notifySuccess(`کاربر ${user.name} ${user.is_active ? 'غیرفعال' : 'فعال'} شد.`);
    } catch (err) {
      notifyError(errorMessage(err, 'بروزرسانی وضعیت ناموفق بود.'));
    }
  }

  const columnDefs: ColDef<AdminUser>[] = [
    { field: 'name', headerName: 'نام کامل', minWidth: 180 },
    { field: 'email', headerName: 'ایمیل', minWidth: 220 },
    {
      field: 'role',
      headerName: 'نقش',
      maxWidth: 130,
      cellRenderer: (p: ICellRendererParams<AdminUser>) => <Pill>{p.value}</Pill>,
    },
    {
      field: 'is_active',
      headerName: 'وضعیت',
      maxWidth: 130,
      cellRenderer: (p: ICellRendererParams<AdminUser>) => (
        <ActiveBadge active={Boolean(p.value)} />
      ),
    },
    {
      headerName: 'عملیات',
      minWidth: 220,
      sortable: false,
      filter: false,
      cellRenderer: (p: ICellRendererParams<AdminUser>) =>
        p.data ? (
          <ActionsCell
            data={p.data}
            onEdit={(user) => setModal({ mode: 'edit', user })}
            onToggle={handleToggle}
          />
        ) : null,
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
            <button
              type="button"
              onClick={() => setModal({ mode: 'create' })}
              className="bg-accent hover:bg-accent-strong inline-flex h-11 items-center gap-2 rounded-md px-5 text-sm font-black text-white transition"
            >
              <FiUserPlus aria-hidden />
              کاربر جدید
            </button>
          }
        />

        <DataGrid<AdminUser> rowData={users} columnDefs={columnDefs} loading={loading} />

        <Modal
          open={modal !== null}
          title={modal?.mode === 'edit' ? 'ویرایش کاربر' : 'افزودن کاربر'}
          onClose={closeModal}
        >
          <UserForm
            mode={modal?.mode === 'edit' ? 'edit' : 'create'}
            user={modal?.mode === 'edit' ? modal.user : undefined}
            onSuccess={handleRefreshAfterModal}
            onCancel={closeModal}
          />
        </Modal>
      </main>
    </AdminGuard>
  );
}
