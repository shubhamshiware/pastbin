import { fetchAndDecrementPaste } from '@/lib/kv';
import { notFound } from 'next/navigation';

export default async function PastePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const paste = await fetchAndDecrementPaste(id);

  if (!paste) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Paste {id}</h1>
      <div className="bg-gray-100 p-4 rounded-md overflow-auto whitespace-pre-wrap font-mono">
        {paste.content}
      </div>
      <div className="mt-4 text-sm text-gray-500">
        {paste.remaining_views !== null && (
          <p>Remaining views: {paste.remaining_views}</p>
        )}
        {paste.expires_at && (
          <p>Expires at: {new Date(paste.expires_at).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}
