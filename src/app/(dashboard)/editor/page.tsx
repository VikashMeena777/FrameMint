'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Wand2, Upload, ImageIcon } from 'lucide-react';
import { ThumbnailEditor } from '@/components/editor/ThumbnailEditor';
import { GlassCard } from '@/components/ui/GlassCard';

function EditorContent() {
  const searchParams = useSearchParams();
  const imageFromQuery = searchParams.get('image');

  const [imageUrl, setImageUrl] = useState<string | undefined>(
    imageFromQuery || undefined
  );
  const [urlInput, setUrlInput] = useState('');

  const handleLoadUrl = () => {
    if (urlInput.trim()) {
      setImageUrl(urlInput.trim());
      setUrlInput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-[var(--fm-text)]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <Wand2 className="inline h-6 w-6 mr-2 text-[var(--fm-primary)]" />
            Thumbnail Editor
          </h1>
          <p className="text-sm text-[var(--fm-text-secondary)] mt-1">
            Fine-tune your thumbnails — add text, shapes, and overlays
          </p>
        </div>
      </div>

      {/* Image loader (shown when no image is loaded) */}
      {!imageUrl && (
        <GlassCard hover={false} className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 flex items-center gap-2 w-full">
              <ImageIcon className="h-5 w-5 text-[var(--fm-text-secondary)] shrink-0" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste an image URL to start editing..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[var(--fm-text)] placeholder:text-[var(--fm-text-secondary)]/50 focus:outline-none focus:border-[var(--fm-primary)]/50"
                onKeyDown={(e) => e.key === 'Enter' && handleLoadUrl()}
              />
              <button
                onClick={handleLoadUrl}
                disabled={!urlInput.trim()}
                className="btn-primary px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 disabled:opacity-40"
              >
                Load
              </button>
            </div>
            <div className="text-sm text-[var(--fm-text-secondary)]">or</div>
            <button
              onClick={() => setImageUrl(undefined)}
              className="btn-glass px-4 py-2.5 rounded-xl text-sm inline-flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Start Blank Canvas
            </button>
          </div>
          <p className="text-xs text-[var(--fm-text-secondary)] mt-3">
            💡 Tip: Generate a thumbnail on the{' '}
            <a href="/create" className="text-[var(--fm-primary)] hover:underline">
              Create page
            </a>
            , then click &quot;Edit&quot; to open it here.
          </p>
        </GlassCard>
      )}

      {/* Editor */}
      <ThumbnailEditor
        imageUrl={imageUrl}
        width={1280}
        height={720}
      />
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--fm-primary)]" />
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
