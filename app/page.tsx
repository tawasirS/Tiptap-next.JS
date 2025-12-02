'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

// ปิด SSR ให้ editor
const TiptapEditor = dynamic(
  () => import('../components/TiptapEditor'),
  { ssr: false }
);

export default function HomePage() {
  const [content, setContent] = useState('<p>เริ่มเขียนโน้ตของคุณได้เลย…</p>');

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900">
          Notion-like Tiptap Editor
        </h1>

        <TiptapEditor
          initialContent={content}
          onChange={setContent}
        />
      </div>
    </main>
  );
}
