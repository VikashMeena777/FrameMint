'use client';

import { useState, useRef, useCallback } from 'react';
import {
  FlaskConical,
  Plus,
  BarChart3,
  Share2,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Eye,
  MousePointerClick,
  Upload,
  ImagePlus,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

interface ABVariant {
  id: string;
  label: string;
  imageUrl: string;
  impressions: number;
  clicks: number;
}

interface ABTestLocal {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed';
  variants: ABVariant[];
  createdAt: string;
}

// Demo data — in production this would come from Supabase
const DEMO_TESTS: ABTestLocal[] = [
  {
    id: '1',
    name: 'Gaming Thumbnail — Bold vs Minimal',
    status: 'active',
    createdAt: new Date().toISOString(),
    variants: [
      { id: 'a', label: 'Variant A — Bold', imageUrl: '', impressions: 1243, clicks: 87 },
      { id: 'b', label: 'Variant B — Minimal', imageUrl: '', impressions: 1198, clicks: 112 },
    ],
  },
];

function VariantUploadZone({
  variant,
  onImageUpload,
}: {
  variant: ABVariant;
  onImageUpload: (file: File) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items?.length > 0) setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) onImageUpload(file);
    },
    [onImageUpload]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageUpload(file);
  };

  return (
    <div
      className={cn(
        'aspect-video rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer transition-all duration-200',
        isDragging
          ? 'border-2 border-dashed border-[var(--fm-primary)] bg-[var(--fm-primary)]/10'
          : variant.imageUrl
            ? 'border border-white/10'
            : 'border-2 border-dashed border-white/15 bg-white/[0.03] hover:border-[var(--fm-primary)]/40 hover:bg-[var(--fm-primary)]/5'
      )}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {variant.imageUrl ? (
        <>
          <img
            src={variant.imageUrl}
            alt={variant.label}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="text-center">
              <Upload className="h-5 w-5 mx-auto text-white mb-1" />
              <p className="text-xs text-white/80">Click to replace</p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center p-4">
          <ImagePlus className="h-8 w-8 text-[var(--fm-text-secondary)]/40 mx-auto" />
          <p className="text-xs text-[var(--fm-text-secondary)] mt-2 font-medium">
            {isDragging ? 'Drop image here' : 'Click or drag image'}
          </p>
          <p className="text-[10px] text-[var(--fm-text-secondary)]/50 mt-0.5">
            PNG, JPG up to 10MB
          </p>
        </div>
      )}
    </div>
  );
}

export default function ABTestPage() {
  const [tests, setTests] = useState<ABTestLocal[]>(DEMO_TESTS);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Handle image upload for a variant
  const handleVariantImageUpload = (testId: string, variantId: string, file: File) => {
    const url = URL.createObjectURL(file);
    setTests((prev) =>
      prev.map((test) =>
        test.id === testId
          ? {
              ...test,
              variants: test.variants.map((v) =>
                v.id === variantId ? { ...v, imageUrl: url } : v
              ),
            }
          : test
      )
    );
  };

  const createTest = () => {
    if (!newName.trim()) return;
    const test: ABTestLocal = {
      id: Date.now().toString(),
      name: newName.trim(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      variants: [
        { id: 'a', label: 'Variant A', imageUrl: '', impressions: 0, clicks: 0 },
        { id: 'b', label: 'Variant B', imageUrl: '', impressions: 0, clicks: 0 },
      ],
    };
    setTests([test, ...tests]);
    setNewName('');
    setShowCreate(false);
  };

  const copyShareLink = (testId: string, variantId: string) => {
    const url = `${window.location.origin}/api/ab/${testId}/${variantId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(`${testId}-${variantId}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCTR = (v: ABVariant) =>
    v.impressions > 0 ? ((v.clicks / v.impressions) * 100).toFixed(1) : '0.0';

  const getWinner = (variants: ABVariant[]) => {
    if (variants.every((v) => v.impressions === 0)) return null;
    return variants.reduce((best, v) =>
      (v.clicks / Math.max(v.impressions, 1)) > (best.clicks / Math.max(best.impressions, 1)) ? v : best
    );
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
            <FlaskConical className="inline h-6 w-6 mr-2 text-[var(--fm-primary)]" />
            A/B Testing
          </h1>
          <p className="text-sm text-[var(--fm-text-secondary)] mt-1">
            Compare thumbnails side-by-side, share variants, and track click-through rates
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary px-4 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Test
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <GlassCard hover={false} className="p-5">
          <h3 className="text-sm font-semibold text-[var(--fm-text)] mb-3">Create New A/B Test</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Test name, e.g. 'Gaming Thumbnail Styles'"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[var(--fm-text)] placeholder:text-[var(--fm-text-secondary)]/50 focus:outline-none focus:border-[var(--fm-primary)]/50"
              onKeyDown={(e) => e.key === 'Enter' && createTest()}
            />
            <button onClick={createTest} className="btn-primary px-4 py-2.5 rounded-xl text-sm font-semibold">
              Create
            </button>
            <button onClick={() => setShowCreate(false)} className="btn-glass px-4 py-2.5 rounded-xl text-sm">
              Cancel
            </button>
          </div>
        </GlassCard>
      )}

      {/* Test list */}
      {tests.length === 0 ? (
        <GlassCard hover={false} className="p-12 text-center">
          <FlaskConical className="h-12 w-12 mx-auto text-[var(--fm-text-secondary)]/30" />
          <p className="text-[var(--fm-text-secondary)] mt-4">No A/B tests yet</p>
          <p className="text-sm text-[var(--fm-text-secondary)]/60 mt-1">
            Create a test to compare different thumbnail versions
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => {
            const winner = getWinner(test.variants);

            return (
              <GlassCard key={test.id} hover={false} className="p-5">
                {/* Test header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3
                      className="font-semibold text-[var(--fm-text)]"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {test.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          test.status === 'active'
                            ? 'bg-green-500/10 text-green-400'
                            : test.status === 'completed'
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-white/5 text-[var(--fm-text-secondary)]'
                        )}
                      >
                        {test.status}
                      </span>
                      <span className="text-xs text-[var(--fm-text-secondary)]">
                        {new Date(test.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setTests((prev) => prev.filter((t) => t.id !== test.id))}
                    className="text-[var(--fm-text-secondary)] hover:text-red-400 transition-colors p-1"
                    title="Delete test"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Variants grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {test.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={cn(
                        'rounded-xl border p-4 transition-all',
                        winner?.id === variant.id && test.status !== 'draft'
                          ? 'border-green-500/30 bg-green-500/5'
                          : 'border-white/10 bg-white/2'
                      )}
                    >
                      {/* Image upload zone */}
                      <div className="mb-3 relative">
                        <VariantUploadZone
                          variant={variant}
                          onImageUpload={(file) =>
                            handleVariantImageUpload(test.id, variant.id, file)
                          }
                        />

                        {/* Winner badge */}
                        {winner?.id === variant.id && test.status !== 'draft' && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold z-10">
                            Winner
                          </div>
                        )}
                      </div>

                      {/* Label */}
                      <p className="text-sm font-medium text-[var(--fm-text)] mb-2">
                        {variant.label}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white/5 rounded-lg p-2">
                          <Eye className="h-3 w-3 mx-auto text-[var(--fm-text-secondary)] mb-1" />
                          <p className="text-sm font-semibold text-[var(--fm-text)]">
                            {variant.impressions.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-[var(--fm-text-secondary)]">Views</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2">
                          <MousePointerClick className="h-3 w-3 mx-auto text-[var(--fm-text-secondary)] mb-1" />
                          <p className="text-sm font-semibold text-[var(--fm-text)]">
                            {variant.clicks.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-[var(--fm-text-secondary)]">Clicks</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2">
                          <BarChart3 className="h-3 w-3 mx-auto text-[var(--fm-primary)] mb-1" />
                          <p className="text-sm font-semibold text-[var(--fm-primary)]">
                            {getCTR(variant)}%
                          </p>
                          <p className="text-[10px] text-[var(--fm-text-secondary)]">CTR</p>
                        </div>
                      </div>

                      {/* Share link */}
                      <button
                        onClick={() => copyShareLink(test.id, variant.id)}
                        className="mt-3 w-full btn-glass px-3 py-2 rounded-lg text-xs inline-flex items-center justify-center gap-1.5"
                      >
                        {copiedId === `${test.id}-${variant.id}` ? (
                          <>
                            <Check className="h-3 w-3 text-green-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy Share Link
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
