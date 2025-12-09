'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const TiptapEditor = dynamic(
  () => import('../components/TiptapEditor'),
  { ssr: false }
);

export default function HomePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [content, setContent] = useState('<p>Loading…</p>');
  const [loading, setLoading] = useState(true);

  // 🔥 LOAD NOTE
  const loadNote = async () => {
    if (!id) return;

    const response = await fetch(`URL/api/get_note.php?id=${id}`);
    const data = await response.json();

    setContent(data.note);
    setLoading(false);
  };

  useEffect(() => {
    loadNote();
  }, [id]);

  // 🔥 UPDATE NOTE
  const saveNote = async () => {
    const formData = new URLSearchParams();
    formData.append('id', id);
    formData.append('note', content);

    const response = await fetch('URL/api/update_note.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const result = await response.json();
    alert(result.message);
  };

  if (loading) return <p>Loading…</p>;

  return (
    <main className="min-h-screen py-10">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-3xl font-bold mb-6">Edit Note #{id}</h1>

        <TiptapEditor
          initialContent={content}
          onChange={setContent}
        />

        <button
          onClick={saveNote}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mt-4"
        >
          Save
        </button>
      </div>
    </main>
  );
}
