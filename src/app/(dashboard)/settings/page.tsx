'use client';

import { User, Mail, Save, Loader2, Check } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useUser } from '@/hooks/useUser';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, loading } = useUser();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Populate field when user data loads
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [user]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to save');
        return;
      }

      setSaved(true);
      toast.success('Profile updated!');
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error('Network error — please try again');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="skeleton h-8 w-40" />
        <div className="skeleton h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
        Settings
      </h1>

      {/* Profile */}
      <GlassCard hover={false} className="p-6">
        <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Profile
        </h2>

        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--fm-primary)]/15">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt=""
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-[var(--fm-primary-light)]" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--fm-text)]">
                {user?.email || 'Not signed in'}
              </p>
              <p className="text-xs text-[var(--fm-text-secondary)]">
                Member since{' '}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '—'}
              </p>
            </div>
          </div>

          {/* Full name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--fm-text)]">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--fm-text-secondary)]" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setSaved(false);
                }}
                placeholder={user?.user_metadata?.full_name || 'Your name'}
                className="glass-input w-full py-2.5 pl-10 pr-4 text-sm"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--fm-text)]">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--fm-text-secondary)]" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="glass-input w-full py-2.5 pl-10 pr-4 text-sm opacity-50 cursor-not-allowed"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </GlassCard>

      {/* Preferences */}
      <GlassCard hover={false} className="p-6">
        <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Preferences
        </h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-[var(--fm-text)]">Default platform</span>
            <select className="glass-input px-3 py-1.5 text-sm w-40">
              <option>YouTube</option>
              <option>Instagram</option>
              <option>Twitter</option>
              <option>LinkedIn</option>
              <option>TikTok</option>
            </select>
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-[var(--fm-text)]">Default style</span>
            <select className="glass-input px-3 py-1.5 text-sm w-40">
              <option>Cinematic</option>
              <option>Gaming</option>
              <option>Vlog</option>
              <option>Educational</option>
              <option>Podcast</option>
              <option>Minimal</option>
            </select>
          </label>
        </div>
      </GlassCard>

      {/* Danger zone */}
      <GlassCard hover={false} className="p-6 border-red-500/10">
        <h2
          className="text-lg font-semibold mb-2 text-red-400"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Danger Zone
        </h2>
        <p className="text-sm text-[var(--fm-text-secondary)] mb-4">
          Once you delete your account, all your data will be permanently removed.
        </p>
        <button
          onClick={() => toast.error('Account deletion requires email confirmation — coming soon')}
          className="btn-glass text-red-400 border-red-500/20 hover:bg-red-500/10 text-sm"
        >
          Delete Account
        </button>
      </GlassCard>
    </div>
  );
}
