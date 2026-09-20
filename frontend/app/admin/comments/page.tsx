"use client";

import { useEffect, useState } from "react";
import { FiMessageSquare } from "react-icons/fi";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import CommentCard from "../../components/admin/CommentCard";
import AdminGuard from "../../components/AdminGuard";
import {
  getAdminComments,
  removeComment,
  replyToComment,
  updateComment,
} from "../../lib/graphql";
import type { Comment, CommentStatus } from "../../lib/products";
import { errorMessage, notifyError, notifySuccess } from "../../lib/toast";

type Tab = { label: string; status?: CommentStatus; empty: string };

const tabs: Tab[] = [
  { label: "همه پیام‌ها", empty: "هنوز نظری ثبت نشده است." },
  {
    label: "بدون پاسخ",
    status: "UNANSWERED",
    empty: "همه نظرها پاسخ داده شده‌اند.",
  },
  {
    label: "پاسخ داده‌شده",
    status: "ANSWERED",
    empty: "هنوز به نظری پاسخ داده نشده است.",
  },
];

export default function AdminCommentsPage() {
  const [tabIndex, setTabIndex] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const tab = tabs[tabIndex];

  // Each tab asks the backend for that status; `cancelled` drops a stale response
  // when the admin switches tabs quickly.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAdminComments(tab.status)
      .then((rows) => !cancelled && setComments(rows))
      .catch(
        (err) =>
          !cancelled &&
          notifyError(errorMessage(err, "دریافت نظرات ناموفق بود.")),
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tab.status]);

  // Replace the comment with its saved version; a comment that no longer matches the
  // open tab (e.g. just answered while viewing "Unanswered") leaves the list.
  function applyUpdate(updated: Comment) {
    setComments((current) =>
      current.flatMap((comment) =>
        comment.id !== updated.id
          ? [comment]
          : tab.status && updated.status !== tab.status
            ? []
            : [updated],
      ),
    );
  }

  async function handleReply(id: string, content: string) {
    try {
      applyUpdate(await replyToComment(id, content));
      notifySuccess("پاسخ شما ثبت شد.");
      return true;
    } catch (err) {
      notifyError(errorMessage(err, "ثبت پاسخ ناموفق بود."));
      return false;
    }
  }

  async function handleEdit(id: string, content: string) {
    try {
      applyUpdate(await updateComment(id, content));
      notifySuccess("نظر ویرایش شد.");
      return true;
    } catch (err) {
      notifyError(errorMessage(err, "ویرایش نظر ناموفق بود."));
      return false;
    }
  }

  async function handleRemove(id: string) {
    if (
      !window.confirm(
        "این نظر حذف شود؟ پاسخ مدیر و رأی‌های مربوط به آن هم حذف می‌شوند.",
      )
    ) {
      return;
    }
    try {
      await removeComment(id);
      setComments((current) => current.filter((comment) => comment.id !== id));
      notifySuccess("نظر حذف شد.");
    } catch (err) {
      notifyError(errorMessage(err, "حذف نظر ناموفق بود."));
    }
  }

  return (
    <AdminGuard>
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:px-12">
        <AdminPageHeader
          icon={FiMessageSquare}
          eyebrow="نظرات کاربران"
          title="مدیریت نظرات"
          description="نظرها و امتیازهای کاربران را ببینید، به آن‌ها پاسخ دهید، متن را ویرایش کنید یا حذف کنید."
        />

        <div
          role="tablist"
          aria-label="فیلتر نظرات"
          className="mb-6 flex flex-wrap gap-2 border-b border-border"
        >
          {tabs.map((item, index) => {
            const selected = index === tabIndex;
            return (
              <button
                key={item.label}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTabIndex(index)}
                className={`-mb-px border-b-2 px-4 py-3 text-sm font-black transition ${
                  selected
                    ? "border-accent text-accent"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div role="tabpanel" aria-label={tab.label} aria-busy={loading}>
          {loading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="h-40 animate-pulse rounded-lg bg-surface"
                />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
              {tab.empty}
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onReply={(content) => handleReply(comment.id, content)}
                  onEdit={(content) => handleEdit(comment.id, content)}
                  onRemove={() => handleRemove(comment.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </AdminGuard>
  );
}
