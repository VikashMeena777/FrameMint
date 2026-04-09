'use client';

import { useState, useCallback, useEffect } from 'react';

export interface GalleryVariant {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
  format: string;
  sizeBytes: number | null;
}

export interface GalleryThumbnail {
  id: string;
  title: string;
  prompt: string;
  style: string;
  platform: string;
  status: string;
  isFavourite: boolean;
  createdAt: string;
  variants: GalleryVariant[];
}

interface UseGalleryReturn {
  thumbnails: GalleryThumbnail[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  fetchMore: () => Promise<void>;
  deleteThumbnail: (id: string) => Promise<boolean>;
  toggleFavourite: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useGallery(favouritesOnly = false): UseGalleryReturn {
  const [thumbnails, setThumbnails] = useState<GalleryThumbnail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchGallery = useCallback(
    async (append = false) => {
      try {
        if (!append) setLoading(true);
        setError(null);

        const params = new URLSearchParams({ limit: '20' });
        if (append && cursor) params.set('cursor', cursor);
        if (favouritesOnly) params.set('favourites', 'true');
        // When not appending (fresh fetch), never send cursor
        if (!append) params.delete('cursor');

        const res = await fetch(`/api/user/gallery?${params}`);
        if (!res.ok) {
          setError('Failed to load gallery');
          return;
        }

        const data = await res.json();

        // Map to our interface (API returns camelCase already)
        const items: GalleryThumbnail[] = data.thumbnails ?? [];

        if (append) {
          setThumbnails((prev) => [...prev, ...items]);
        } else {
          setThumbnails(items);
        }

        setCursor(data.cursor || null);
        setHasMore(data.hasMore ?? false);
      } catch {
        setError('Network error — please try again');
      } finally {
        setLoading(false);
      }
    },
    [cursor, favouritesOnly]
  );

  const fetchMore = useCallback(async () => {
    if (hasMore && cursor) await fetchGallery(true);
  }, [hasMore, cursor, fetchGallery]);

  const deleteThumbnail = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/user/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thumbnailId: id }),
      });
      if (!res.ok) return false;
      setThumbnails((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch {
      return false;
    }
  }, []);

  const toggleFavourite = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/user/gallery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thumbnailId: id }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      setThumbnails((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, isFavourite: data.is_favourite }
            : t
        )
      );
      return true;
    } catch {
      return false;
    }
  }, []);

  const refetch = useCallback(async () => {
    setCursor(null);
    setThumbnails([]);
    // The useEffect watching favouritesOnly will re-trigger fetchGallery.
    // For imperative refetch, call directly with fresh params:
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ limit: '20' });
      if (favouritesOnly) params.set('favourites', 'true');
      const res = await fetch(`/api/user/gallery?${params}`);
      if (!res.ok) { setError('Failed to load gallery'); return; }
      const data = await res.json();
      setThumbnails(data.thumbnails ?? []);
      setCursor(data.cursor || null);
      setHasMore(data.hasMore ?? false);
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }, [favouritesOnly]);

  useEffect(() => {
    fetchGallery(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favouritesOnly]);

  // When favouritesOnly is true, API already filters server-side.
  // No client-side filter needed.
  const filtered = thumbnails;

  return { thumbnails: filtered, loading, error, hasMore, fetchMore, deleteThumbnail, toggleFavourite, refetch };
}
