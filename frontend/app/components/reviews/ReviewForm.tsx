"use client";

import { useState } from "react";
import { createComment } from "../../lib/graphql";
import { errorMessage, notifyError, notifySuccess } from "../../lib/toast";
import FormField, { textareaClass } from "../admin/FormField";
import StarRating from "./StarRating";

const MAX_LENGTH = 2000;

export default function ReviewForm({
  productSlug,
  onCreated,
}: {
  productSlug: string;
  onCreated: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (rating < 1) {
      notifyError("لطفاً امتیاز خود را انتخاب کنید.");
      return;
    }
    if (!content.trim()) {
      notifyError("متن نظر را بنویسید.");
      return;
    }

    setSubmitting(true);
    try {
      await createComment({ productSlug, rating, content });
      setRating(0);
      setContent("");
      notifySuccess("نظر شما ثبت شد.");
      onCreated();
    } catch (err) {
      notifyError(errorMessage(err, "ثبت نظر ناموفق بود."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-bold text-foreground">امتیاز شما</p>
        <StarRating
          value={rating}
          onChange={setRating}
          size="lg"
          className="mt-2"
        />
      </div>

      <FormField label="نظر شما">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={MAX_LENGTH}
          rows={4}
          placeholder="تجربه خود را از این محصول بنویسید..."
          className={textareaClass}
        />
        <p className="mt-1 text-end text-xs tabular-nums text-muted">
          {content.length}/{MAX_LENGTH}
        </p>
      </FormField>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-11 w-full items-center justify-center rounded-md bg-accent px-5 text-sm font-black text-black transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "در حال ثبت..." : "ثبت نظر"}
      </button>
    </form>
  );
}
