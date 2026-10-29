'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import type { Order } from '../../lib/products';
import { errorMessage, notifyError, notifySuccess } from '../../lib/toast';
import { getAdminOrders, updateOrderStatus } from '../../lib/graphql';

const statusLabels: Record<string, string> = { pending: 'در انتظار پرداخت', paid: 'پرداخت‌شده', shipped: 'ارسال‌شده', canceled: 'لغوشده' };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try { setOrders(await getAdminOrders()); }
    catch (error) { notifyError(errorMessage(error, 'دریافت سفارش‌ها ناموفق بود.')); }
    finally { setLoading(false); }
  }

  useEffect(() => { void refresh(); }, []);

  async function changeStatus(order: Order, status: 'pending' | 'shipped' | 'canceled') {
    setBusyId(order.id);
    try {
      const updated = await updateOrderStatus(order.id, status);
      setOrders((current) => current.map((item) => item.id === updated.id ? updated : item));
      notifySuccess('وضعیت سفارش به‌روزرسانی شد.');
    } catch (error) { notifyError(errorMessage(error, 'به‌روزرسانی وضعیت سفارش ناموفق بود.')); }
    finally { setBusyId(null); }
  }

  return <section className="space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-5">
      <div><h2 className="text-2xl font-black">مدیریت سفارش‌ها</h2><p className="text-muted mt-2 text-sm">مشاهدهٔ اقلام و به‌روزرسانی وضعیت ارسال</p></div>
      <button onClick={() => void refresh()} className="border-border inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-bold"><FiRefreshCw aria-hidden/>به‌روزرسانی</button>
    </header>
    {loading ? <p className="rounded-lg border border-border p-6 text-sm">در حال دریافت سفارش‌ها…</p> : orders.length === 0 ? <p className="rounded-lg border border-border p-6 text-sm text-muted">سفارشی ثبت نشده است.</p> : <div className="grid gap-4">{orders.map((order) => <article key={order.id} className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div><h3 className="font-black">سفارش شمارهٔ {order.id}</h3><p className="mt-1 text-xs text-muted">{new Date(order.createdAt).toLocaleDateString('fa-IR')}</p></div>
        <div className="flex items-center gap-3"><span className="text-sm font-bold">{statusLabels[order.status] ?? order.status}</span><strong>{order.total} تومان</strong></div>
      </div>
      <ul className="grid gap-2 py-4">{order.items.map((item) => <li key={item.id} className="flex justify-between gap-2 rounded-md bg-background px-3 py-2 text-sm"><span>{item.productName} × {item.quantity}</span><span>{item.total} تومان</span></li>)}</ul>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <label className="flex items-center gap-2 text-sm font-bold">وضعیت سفارش<select disabled={busyId === order.id || ['canceled', 'shipped'].includes(order.status)} value={order.status === 'canceled' ? 'canceled' : order.status === 'shipped' ? 'shipped' : order.status === 'paid' ? 'paid' : 'pending'} onChange={(event) => void changeStatus(order, event.target.value as 'pending' | 'shipped' | 'canceled')} className="glass-input h-10 rounded-md px-3"><option value="pending">در انتظار پرداخت</option>{order.status === 'paid' && <option value="paid">پرداخت‌شده</option>}<option value="shipped" disabled={order.status !== 'paid'}>ارسال‌شده</option><option value="canceled">لغوشده</option></select></label>
        <Link href={`/orders`} className="text-accent inline-flex items-center gap-2 text-sm font-bold">سفارش‌های مشتری <FiArrowLeft aria-hidden/></Link>
      </div>
    </article>)}</div>}
  </section>;
}
