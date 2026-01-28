'use client';

import { useState } from 'react';

export default function Home() {
  const [content, setContent] = useState('');
  const [ttl, setTtl] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [result, setResult] = useState<{ id: string; url: string } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/pastes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          ttl_seconds: ttl ? parseInt(ttl, 10) : undefined,
          max_views: maxViews ? parseInt(maxViews, 10) : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create paste');
      }

      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Pastebin Lite</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea
            required
            className="w-full h-48 p-2 border rounded-md font-mono"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your paste content here..."
          />
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">TTL (seconds)</label>
            <input
              type="number"
              className="w-full p-2 border rounded-md"
              value={ttl}
              onChange={(e) => setTtl(e.target.value)}
              placeholder="Optional"
              min="1"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Max Views</label>
            <input
              type="number"
              className="w-full p-2 border rounded-md"
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              placeholder="Optional"
              min="1"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Creating...' : 'Create Paste'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 p-4 bg-green-100 rounded-md">
          <p className="font-medium">Paste created successfully!</p>
          <p className="mt-2">
            URL: <a href={result.url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{result.url}</a>
          </p>
          <p className="text-sm text-gray-600 mt-1">ID: {result.id}</p>
        </div>
      )}
    </div>
  );
}
