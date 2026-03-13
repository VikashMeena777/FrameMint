'use client';

import { useState } from 'react';
import {
  Video,
  Link2,
  Loader2,
  ImageIcon,
  ArrowRight,
  AlertCircle,
  Wand2,
  Download,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

interface ExtractedFrame {
  url: string;
  timestampSec: number;
}

export default function VideoCreatePage() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [frames, setFrames] = useState<ExtractedFrame[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<number | null>(null);

  const handleExtract = async () => {
    if (!youtubeUrl.trim()) return;
    setLoading(true);
    setError(null);
    setFrames([]);
    setSelectedFrame(null);

    try {
      const res = await fetch('/api/generate/video-frames', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeUrl.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to extract frames');
        return;
      }

      setVideoTitle(data.videoTitle);
      setFrames(data.frames || []);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFromFrame = () => {
    if (selectedFrame === null) return;
    const frame = frames[selectedFrame];
    // Navigate to editor with the selected frame as the image
    window.location.href = `/editor?image=${encodeURIComponent(frame.url)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-[var(--fm-text)]"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          <Video className="inline h-6 w-6 mr-2 text-[var(--fm-primary)]" />
          Video to Thumbnail
        </h1>
        <p className="text-sm text-[var(--fm-text-secondary)] mt-1">
          Extract key frames from any YouTube video, then generate or edit a
          thumbnail from them
        </p>
      </div>

      {/* URL input */}
      <GlassCard hover={false} className="p-5">
        <label className="text-sm font-medium text-[var(--fm-text)] block mb-2">
          YouTube Video URL
        </label>
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4">
            <Link2 className="h-4 w-4 text-[var(--fm-text-secondary)] shrink-0" />
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 bg-transparent py-2.5 text-sm text-[var(--fm-text)] placeholder:text-[var(--fm-text-secondary)]/50 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
            />
          </div>
          <button
            onClick={handleExtract}
            disabled={loading || !youtubeUrl.trim()}
            className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Video className="h-4 w-4" />
            )}
            {loading ? 'Extracting...' : 'Extract Frames'}
          </button>
        </div>

        {/* Supported formats */}
        <p className="text-xs text-[var(--fm-text-secondary)]/60 mt-2">
          Supports: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
        </p>

        {/* Error */}
        {error && (
          <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </GlassCard>

      {/* Results */}
      {frames.length > 0 && (
        <>
          <GlassCard hover={false} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3
                  className="font-semibold text-[var(--fm-text)]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {videoTitle}
                </h3>
                <p className="text-xs text-[var(--fm-text-secondary)] mt-0.5">
                  {frames.length} frames extracted · Click a frame to select it
                </p>
              </div>
            </div>

            {/* Frame grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {frames.map((frame, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedFrame(i)}
                  className={cn(
                    'group relative aspect-video rounded-xl overflow-hidden border-2 transition-all',
                    selectedFrame === i
                      ? 'border-[var(--fm-primary)] ring-2 ring-[var(--fm-primary)]/20 scale-[1.02]'
                      : 'border-white/10 hover:border-white/30'
                  )}
                >
                  <img
                    src={frame.url}
                    alt={`Frame ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-white/0 group-hover:text-white/80 transition-all" />
                  </div>
                  {selectedFrame === i && (
                    <div className="absolute top-2 right-2 bg-[var(--fm-primary)] text-white rounded-full p-1">
                      <ImageIcon className="h-3 w-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Action buttons */}
          {selectedFrame !== null && (
            <div className="flex items-center gap-3 justify-end">
              <a
                href={frames[selectedFrame].url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glass px-4 py-2.5 rounded-xl text-sm inline-flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Frame
              </a>
              <button
                onClick={handleGenerateFromFrame}
                className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Edit in Thumbnail Editor
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!loading && frames.length === 0 && !error && (
        <GlassCard hover={false} className="p-12 text-center">
          <Video className="h-12 w-12 mx-auto text-[var(--fm-text-secondary)]/20" />
          <p className="text-[var(--fm-text-secondary)] mt-4">
            Paste a YouTube URL above to extract key frames
          </p>
          <p className="text-sm text-[var(--fm-text-secondary)]/60 mt-1">
            Pro tip: Great thumbnails often use a different frame than the
            auto-generated one
          </p>
        </GlassCard>
      )}
    </div>
  );
}
