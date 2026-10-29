'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiPackage, FiUser } from 'react-icons/fi';
import { getMyProfile, updateMyProfile } from '../lib/graphql';
import type { AdminUser } from '../lib/products';
import { errorMessage, notifyError, notifySuccess } from '../lib/toast';
import { useAuth } from '../providers/AuthProvider';

export default function AccountPage() {
  const { token, loading: authLoading, user, setSession } = useAuth();
  const [profile, setProfile] = useState<AdminUser | null>(null);
  const [name, setName] = useState(user?.name ?? '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!token) { setLoading(false); return; }
    getMyProfile().then((value) => { setProfile(value); setName(value.name); })
      .catch((error) => notifyError(errorMessage(error, 'دریافت پروفایل ناموفق بود.')))
      .finally(() => setLoading(false));
  }, [authLoading, token]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await updateMyProfile(name.trim());
      setProfile(updated);
      if (token) setSession(token, updated);
      notifySuccess('نام پروفایل ذخیره شد.');
    } catch (error) { notifyError(errorMessage(error, 'ذخیرهٔ پروفایل ناموفق بود.')); }
    finally { setSaving(false); }
  }

  if (authLoading || loading) return <main className="mx-auto max-w-3xl p-6 text-sm">در حال بارگذاری حساب کاربری…</main>;
  if (!token) return <main className="mx-auto max-w-3xl p-8 text-center"><h1 className="text-2xl font-black">حساب کاربری</h1><p className="mt-3 text-sm text-muted">برای مشاهدهٔ پروفایل وارد حساب شوید.</p><Link className="mt-5 inline-flex rounded-md bg-accent px-5 py-3 font-bold text-white" href="/auth?mode=login">ورود</Link></main>;

  return <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
    <header className="mb-7"><p className="text-sm font-bold text-accent">حساب کاربری</p><h1 className="mt-2 text-3xl font-black">پروفایل من</h1></header>
    <form onSubmit={save} className="grid gap-5 rounded-xl border border-border bg-surface p-6">
      <label className="grid gap-2 text-sm font-bold">نام نمایشی<input required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="glass-input h-11 rounded-md px-3" /></label>
      <label className="grid gap-2 text-sm font-bold">ایمیل<input disabled value={profile?.email ?? user?.email ?? ''} className="glass-input h-11 rounded-md px-3 opacity-70" /></label>
      <button disabled={saving || !name.trim()} className="h-11 rounded-md bg-accent px-5 font-black text-white disabled:opacity-60">{saving ? 'در حال ذخیره…' : 'ذخیرهٔ تغییرات'}</button>
    </form>
    <nav className="mt-5 flex flex-wrap gap-3"><Link href="/orders" className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-bold"><FiPackage aria-hidden/>سفارش‌های من</Link><span className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm text-muted"><FiUser aria-hidden/>{profile?.email}</span></nav>
  </main>;
}
