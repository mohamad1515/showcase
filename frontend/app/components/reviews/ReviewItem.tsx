"use client";

import { useState } from "react";
import type { IconType } from "react-icons";
import { FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import { formatDate } from "../../lib/date";
import type { Comment, VoteType } from "../../lib/products";
import { Pill } from "../admin/StatusBadge";
import StarRating from "./StarRating";

function VoteButton({
  icon: Icon,
  label,
  count,
  active,
  activeClass,
  disabled,
  onClick,
}: {
  icon: IconType;
  label: string;
  count: number;
  active: boolean;
  activeClass: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={`${label}، ${count}`}
      className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-bold tabular-nums transition disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? activeClass
          : "border-border bg-background text-muted hover:border-accent hover:text-accent"
      }`}
    >
      <Icon aria-hidden className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
      {count}
    </button>
  );
}

export default function ReviewItem({
  comment,
  onVote,
}: {
  comment: Comment;
  onVote: (type: VoteType) => Promise<void>;
}) {
  const [voting, setVoting] = useState(false);

  async function vote(type: VoteType) {
    setVoting(true);
    try {
      await onVote(type);
    } finally {
      setVoting(false);
    }
  }

  return (
    <article className="rounded-lg border border-border bg-background p-4 sm:p-5">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
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
        <time dateTime={comment.createdAt} className="text-xs text-muted">
          {formatDate(comment.createdAt)}
        </time>
      </header>

      <p className="mt-3 whitespace-pre-line wrap-break-word text-sm leading-7 text-foreground">
        {comment.content}
      </p>
      {comment.editedByAdmin && (
        <p className="mt-1 text-xs text-muted">ویرایش‌شده توسط مدیر</p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <VoteButton
          icon={FiThumbsUp}
          label="پسندیدن"
          count={comment.likeCount}
          active={comment.myVote === "LIKE"}
          activeClass="border-accent bg-accent-soft text-accent"
          disabled={voting}
          onClick={() => vote("LIKE")}
        />
        <VoteButton
          icon={FiThumbsDown}
          label="نپسندیدن"
          count={comment.dislikeCount}
          active={comment.myVote === "DISLIKE"}
          activeClass="border-danger bg-danger-soft text-danger"
          disabled={voting}
          onClick={() => vote("DISLIKE")}
        />
      </div>

      {comment.reply && (
        <div className="mt-4 rounded-md border-s-4 border-accent bg-accent-soft p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Pill>پاسخ مدیر</Pill>
            <time
              dateTime={comment.reply.createdAt}
              className="text-xs text-muted"
            >
              {formatDate(comment.reply.createdAt)}
            </time>
          </div>
          <p className="mt-2 whitespace-pre-line wrap-break-word text-sm leading-7 text-foreground">
            {comment.reply.content}
          </p>
        </div>
      )}
    </article>
  );
}
