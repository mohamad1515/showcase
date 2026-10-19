'use client';

import { useState, type FormEvent } from 'react';

type LocalComment = {
  id: string;
  name: string;
  text: string;
};

const seedComments: LocalComment[] = [
  {
    id: 'seed-1',
    name: 'مهمان',
    text: 'توضیحات خیلی کاربردی بود، ممنون از راهنمایی.',
  },
];

export default function ArticleComments() {
  const [comments, setComments] = useState<LocalComment[]>(seedComments);
  const [name, setName] = useState('');
  const [text, setText] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setComments((current) => [...current, { id: String(Date.now()), name, text }]);
    setName('');
    setText('');
  }

  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="text-foreground text-lg font-black">
        {comments.length} نظر
      </h2>

      <ul className="mt-5 space-y-4">
        {comments.map((comment) => (
          <li key={comment.id} className="border-border bg-card rounded-md border p-4">
            <p className="text-foreground text-sm font-black">{comment.name}</p>
            <p className="text-muted mt-1.5 text-sm leading-6">{comment.text}</p>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <h3 className="text-foreground text-sm font-black">ثبت نظر</h3>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="نام شما"
          required
          className="border-border bg-surface h-11 w-full rounded-md border px-3 text-sm"
        />
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="نظر شما..."
          required
          rows={4}
          className="border-border bg-surface w-full rounded-md border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="bg-accent text-black hover:bg-accent-strong h-11 rounded-md px-6 text-sm font-black transition-colors"
        >
          ثبت نظر
        </button>
      </form>
    </section>
  );
}
