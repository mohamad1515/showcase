'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FiSave, FiUserPlus } from 'react-icons/fi';
import { createUser, updateUser } from '../../lib/graphql';
import type { AdminUser } from '../../lib/products';
import { errorMessage, notifyError, notifySuccess } from '../../lib/toast';
import FormField, { inputClass } from './FormField';

type Props = {
  mode: 'create' | 'edit';
  user?: AdminUser;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function UserForm({ mode, user, onSuccess, onCancel }: Props) {
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      if (mode === 'edit' && user) {
        await updateUser(user.id.toString(), {
          name,
          email,
          ...(password ? { password } : {}),
        });
        notifySuccess('اطلاعات کاربر با موفقیت به‌روز شد.');
      } else {
        await createUser({ name, email, password });
        notifySuccess('کاربر جدید با موفقیت اضافه شد.');
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/users');
        router.refresh();
      }
    } catch (err: unknown) {
      notifyError(errorMessage(err, 'ذخیره کاربر ناموفق بود.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-border bg-surface grid gap-4 rounded-lg border p-6 shadow-sm sm:p-8"
    >
      <FormField label="نام کامل">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClass}
        />
      </FormField>

      <FormField label="ایمیل">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          dir="ltr"
          required
          className={`${inputClass} text-left`}
        />
      </FormField>

      <FormField
        label="رمز عبور"
        hint={mode === 'edit' ? 'فقط در صورت تغییر وارد کنید' : undefined}
      >
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          dir="ltr"
          minLength={mode === 'edit' ? undefined : 6}
          required={mode === 'create'}
          className={`${inputClass} text-left`}
        />
      </FormField>

      <button
        type="submit"
        disabled={saving}
        className="bg-accent hover:bg-accent-strong mt-2 flex h-12 items-center justify-center gap-2 rounded-md px-5 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-70"
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
            <FiUserPlus aria-hidden />
            افزودن کاربر
          </>
        )}
      </button>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="border-border bg-background text-foreground hover:border-accent hover:text-accent mt-2 h-11 rounded-md border px-4 text-sm font-black transition"
        >
          انصراف
        </button>
      )}
    </form>
  );
}
