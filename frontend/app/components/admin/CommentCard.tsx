"use client";

import Link from "next/link";
import { useState } from "react";
import type { IconType } from "react-icons";
import {
  FiCornerUpLeft,
  FiEdit,
  FiThumbsDown,
  FiThumbsUp,
  FiTrash2,
} from "react-icons/fi";
import { formatDate } from "../../lib/date";
import type { Comment } from "../../lib/products";
import { notifyError } from "../../lib/toast";
import StarRating from "../reviews/StarRating";
import { textareaClass } from "./FormField";
import { CommentStatusBadge, Pill } from "./StatusBadge";

const MAX_LENGTH = 2000;

const actionClass =
  "inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-black text-foreground transition disabled:cursor-not-allowed disabled:opacity-60";

function Count({ icon: Icon, label, value }: { icon: IconType; label: string; value: number }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 tabular-nums"
      title={label}
      aria-label={`${label}: ${value}`}
    >
      <Icon aria-hidden className="h-4 w-4" />
      {value}
    </span>
  );
}

type Mode = "reply" | "edit";

export default function CommentCard({
  comment,
  onReply,
  onEdit,
  onRemove,
}: {
  comment: Comment;
  /** Resolve to true when the change was saved so the editor can close. */
  onReply: (content: string) => Promise<boolean>;
  onEdit: (content: string) => Promise<boolean>;
  onRemove: () => Promise<void>;
}) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);

  function open(next: Mode) {
    setMode(next);
    setDraft(next === "edit" ? comment.content : "");
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.trim()) {
      notifyError(
        mode === "reply" ? "متن پاسخ را بنویسید." : "متن نظر نمی‌تواند خالی باشد.",
      );
      return;
    }
    setPending(true);
    try {
      const saved = await (mode === "reply" ? onReply : onEdit)(draft);
      if (saved) setMode(null);
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    setPending(true);
    try {
      await onRemove();
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="rounded-lg border border-border bg-surface p-5">
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-soft text-base font-black text-accent"
          >
            {comment.userName.trim().charAt(0)}
          </span>
          <div>
            <p className="text-sm font-black text-foreground">
              {comment.userName}
            </p>
            <StarRating value={comment.rating} size="sm" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CommentStatusBadge status={comment.status} />
          <time dateTime={comment.createdAt} className="text-xs text-muted">
            {formatDate(comment.createdAt)}
          </time>
        </div>
      </header>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
        <span>
          محصول:{" "}
          <Link
            href={`/products/${comment.productSlug}#reviews`}
            className="font-bold text-accent hover:underline"
          >
            {comment.productName}
          </Link>
        </span>
        <Count icon={FiThumbsUp} label="پسندیدن" value={comment.likeCount} />
        <Count icon={FiThumbsDown} label="نپسندیدن" value={comment.dislikeCount} />
      </div>

      <p className="mt-3 whitespace-pre-line wrap-break-word text-sm leading-7 text-foreground">
        {comment.content}
      </p>
      {comment.editedByAdmin && (
        <p className="mt-1 text-xs text-muted">ویرایش‌شده توسط مدیر</p>
      )}

      {comment.reply && (
        <div className="mt-4 rounded-md border-s-4 border-accent bg-accent-soft p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Pill>پاسخ مدیر</Pill>
              <span className="text-xs text-muted">{comment.reply.adminName}</span>
            </span>
            <time dateTime={comment.reply.createdAt} className="text-xs text-muted">
              {formatDate(comment.reply.createdAt)}
            </time>
          </div>
          <p className="mt-2 whitespace-pre-line wrap-break-word text-sm leading-7 text-foreground">
            {comment.reply.content}
          </p>
        </div>
      )}

      {mode ? (
        <form onSubmit={save} className="mt-4 space-y-3">
          <label className="block text-sm font-bold text-foreground">
            {mode === "reply" ? "پاسخ مدیر" : "ویرایش متن نظر"}
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={MAX_LENGTH}
              rows={4}
              autoFocus
              disabled={pending}
              className={`${textareaClass} mt-2 font-normal`}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-9 items-center rounded-md bg-accent px-4 text-xs font-black text-black transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "در حال ذخیره..." : mode === "reply" ? "ثبت پاسخ" : "ذخیره تغییرات"}
            </button>
            <button
              type="button"
              onClick={() => setMode(null)}
              disabled={pending}
              className={`${actionClass} hover:border-accent hover:text-accent`}
            >
              انصراف
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          {!comment.reply && (
            <button
              type="button"
              onClick={() => open("reply")}
              disabled={pending}
              className={`${actionClass} hover:border-accent hover:text-accent`}
            >
              <FiCornerUpLeft aria-hidden />
              پاسخ
            </button>
          )}
          <button
            type="button"
            onClick={() => open("edit")}
            disabled={pending}
            className={`${actionClass} hover:border-accent hover:text-accent`}
          >
            <FiEdit aria-hidden />
            ویرایش
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className={`${actionClass} hover:border-danger hover:text-danger`}
          >
            <FiTrash2 aria-hidden />
            حذف
          </button>
        </div>
      )}
    </article>
  );
}
