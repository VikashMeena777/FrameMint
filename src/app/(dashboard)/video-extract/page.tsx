'use client';

import { useState, useRef } from 'react';
import {
  Video,
  Upload,
  Loader2,
  Download,
  Wand2,
  Clock,
  Image as ImageIcon,
  Play,
  Film,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

interface ExtractedFrame {
  id: string;
  timestamp: number;
  dataUrl: string;
}

export default function VideoExtractPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoName, setVideoName] = useState('');
  const [frames, setFrames] = useState<ExtractedFrame[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    setVideoName(file.name);
    setVideoSrc(URL.createObjectURL(file));
    setFrames([]);
    setSelectedFrame(null);
  };

  const extractFrames = async (count: number = 8) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !videoSrc) return;

    setExtracting(true);
    setFrames([]);
    setProgress(0);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Wait for video metadata
    await new Promise<void>((resolve) => {
      if (video.readyState >= 1) resolve();
      else video.addEventListener('loadedmetadata', () => resolve(), { once: true });
    });

    const duration = video.duration;
    canvas.width = 1280;
    canvas.height = 720;

    const extracted: ExtractedFrame[] = [];
    const interval = duration / (count + 1); // avoid very first and last frame

    for (let i = 1; i <= count; i++) {
      const time = interval * i;

      await new Promise<void>((resolve) => {
        video.currentTime = time;
        video.addEventListener('seeked', () => {
          // Draw current frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

          extracted.push({
            id: `frame-${i}`,
            timestamp: time,
            dataUrl,
          });

          setProgress(Math.round((i / count) * 100));
          resolve();
        }, { once: true });
      });
    }

    setFrames(extracted);
    setExtracting(false);
    setProgress(100);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const downloadFrame = (frame: ExtractedFrame) => {
    const link = document.createElement('a');
    link.download = `framemint-frame-${formatTime(frame.timestamp).replace(':', '-')}.jpg`;
    link.href = frame.dataUrl;
    link.click();
  };

  const editFrame = (frame: ExtractedFrame) => {
    // Navigate to editor with this frame
    window.location.href = `/editor?image=${encodeURIComponent(frame.dataUrl)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-[var(--fm-text)]"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          <Film className="inline h-6 w-6 mr-2 text-[var(--fm-primary)]" />
          Video to Thumbnail
        </h1>
        <p className="text-sm text-[var(--fm-text-secondary)] mt-1">
          Extract the best frames from your video as thumbnail candidates
        </p>
      </div>

      {/* Upload area */}
      {!videoSrc ? (
        <GlassCard
          hover
          className="p-12 text-center cursor-pointer border-2 border-dashed border-white/10 hover:border-[var(--fm-primary)]/30"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 mx-auto text-[var(--fm-text-secondary)]/30" />
          <p className="text-[var(--fm-text)] font-semibold mt-4">
            Drop a video file or click to browse
          </p>
          <p className="text-sm text-[var(--fm-text-secondary)] mt-1">
            Supports MP4, WebM, MOV — processed locally in your browser
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </GlassCard>
      ) : (
        <>
          {/* Video preview */}
          <GlassCard hover={false} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-[var(--fm-primary)]" />
                <span className="text-sm font-medium text-[var(--fm-text)] truncate max-w-[300px]">
                  {videoName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="bg-white/5 text-[var(--fm-text)] border border-white/10 rounded-lg px-3 py-1.5 text-xs"
                  defaultValue="8"
                  id="frameCount"
                >
                  <option value="4">4 frames</option>
                  <option value="8">8 frames</option>
                  <option value="12">12 frames</option>
                  <option value="16">16 frames</option>
                </select>
                <button
                  onClick={() => {
                    const count = parseInt(
                      (document.getElementById('frameCount') as HTMLSelectElement).value
                    );
                    extractFrames(count);
                  }}
                  disabled={extracting}
                  className="btn-primary px-4 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {extracting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Extracting {progress}%
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      Extract Frames
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setVideoSrc(null);
                    setFrames([]);
                    setVideoName('');
                  }}
                  className="btn-glass px-3 py-1.5 rounded-lg text-xs"
                >
                  New Video
                </button>
              </div>
            </div>
            <video
              ref={videoRef}
              src={videoSrc}
              className="w-full max-h-[300px] rounded-lg bg-black"
              controls
              crossOrigin="anonymous"
            />
          </GlassCard>

          {/* Progress bar */}
          {extracting && (
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
              <div
                className="h-full gradient-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Extracted frames */}
          {frames.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--fm-text)] mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Extracted Frames ({frames.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {frames.map((frame) => (
                  <div
                    key={frame.id}
                    className={cn(
                      'rounded-xl overflow-hidden border-2 transition-all cursor-pointer group',
                      selectedFrame === frame.id
                        ? 'border-[var(--fm-primary)] shadow-lg shadow-purple-500/10'
                        : 'border-transparent hover:border-white/20'
                    )}
                    onClick={() => setSelectedFrame(frame.id)}
                  >
                    <div className="relative aspect-video">
                      <img
                        src={frame.dataUrl}
                        alt={`Frame at ${formatTime(frame.timestamp)}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <div className="flex items-center gap-1 text-xs text-white">
                          <Clock className="h-3 w-3" />
                          {formatTime(frame.timestamp)}
                        </div>
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); downloadFrame(frame); }}
                          className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
                          title="Download"
                        >
                          <Download className="h-4 w-4 text-white" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); editFrame(frame); }}
                          className="p-2 bg-[var(--fm-primary)]/80 rounded-lg hover:bg-[var(--fm-primary)] transition"
                          title="Edit in Editor"
                        >
                          <Wand2 className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Hidden canvas for frame extraction */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
