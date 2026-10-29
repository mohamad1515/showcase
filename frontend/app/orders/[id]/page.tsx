'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { getOrders } from '../../lib/graphql';
import type { Order } from '../../lib/products';
import { errorMessage, notifyError } from '../../lib/toast';
import { useAuth } from '../../providers/AuthProvider';

const statusLabels: Record<string, string> = { pending: 'در انتظار پرداخت', paid: 'پرداخت‌شده', shipped: 'ارسال‌شده', canceled: 'لغوشده' };

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { token, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!token) { setLoading(false); return; }
    getOrders().then((orders) => setOrder(orders.find((item) => item.id === params.id) ?? null))
      .catch((error) => notifyError(errorMessage(error, 'دریافت سفارش ناموفق بود.')))
      .finally(() => setLoading(false));
  }, [authLoading, params.id, token]);

  if (authLoading || loading) return <main className="mx-auto max-w-4xl px-4 py-10 text-sm">در حال دریافت جزئیات سفارش…</main>;
  if (!token) return <main className="mx-auto max-w-3xl px-4 py-10 text-center">برای مشاهدهٔ سفارش وارد شوید.<Link href="/auth?mode=login" className="text-accent mr-2 font-bold">ورود</Link></main>;
  if (!order) return <main className="mx-auto max-w-3xl px-4 py-10 text-center"><p>این سفارش پیدا نشد.</p><Link href="/orders" className="text-accent mt-3 inline-block font-bold">بازگشت به سفارش‌ها</Link></main>;

  return <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
    <Link href="/orders" className="text-accent inline-flex items-center gap-2 text-sm font-bold"><FiArrowRight aria-hidden/>بازگشت به سفارش‌ها</Link>
    <header className="my-6 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-5"><div><p className="text-sm font-bold text-muted">جزئیات سفارش</p><h1 className="mt-2 text-3xl font-black">شمارهٔ {order.id}</h1></div><span className="rounded-full bg-accent/10 px-4 py-2 text-sm font-bold text-accent">{statusLabels[order.status] ?? order.status}</span></header>
    <p className="text-sm text-muted">تاریخ ثبت: {new Date(order.createdAt).toLocaleDateString('fa-IR')}</p>
    <section className="mt-5 grid gap-3">{order.items.map((item) => <article key={item.id} className="flex flex-wrap justify-between gap-3 rounded-lg border border-border bg-surface p-4"><div><h2 className="font-black">{item.productName}</h2><p className="mt-1 text-sm text-muted">تعداد: {item.quantity}</p></div><div className="text-left text-sm"><p>{item.unitPrice} تومان برای هر عدد</p><p className="mt-1 font-black">جمع: {item.total} تومان</p></div></article>)}</section>
    <div className="mt-5 flex justify-between rounded-lg bg-surface p-5 font-black"><span>مبلغ کل</span><span>{order.total} تومان</span></div>
  </main>;
}
