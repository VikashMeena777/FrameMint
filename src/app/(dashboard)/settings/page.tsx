'use client';

import { User, Mail, Save, Loader2, Check, AlertTriangle } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useUser } from '@/hooks/useUser';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, loading } = useUser();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="skeleton h-7 w-32 rounded-lg" />
        <div className="skeleton h-64 w-full rounded-2xl" />
        <div className="skeleton h-40 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[var(--fm-text)]">Settings</h1>
        <p className="text-sm text-[var(--fm-text-secondary)] mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--fm-text-secondary)] mb-5">Profile</h2>

        {/* Avatar row */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/6">
          <div className="relative h-16 w-16 rounded-2xl overflow-hidden border border-white/10">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center gradient-primary">
                <User className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--fm-text)]">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-[var(--fm-text-secondary)] mt-0.5">{user?.email}</p>
            <p className="text-xs text-[var(--fm-text-muted)] mt-1">
              Member since{' '}
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                : '—'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Full name */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--fm-text-secondary)]">
              Full Name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--fm-text-muted)]" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setSaved(false); }}
                placeholder="Your name"
                className="glass-input w-full py-3 pl-10 pr-4 text-sm"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--fm-text-secondary)]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--fm-text-muted)]" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="glass-input w-full py-3 pl-10 pr-4 text-sm opacity-40 cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-[var(--fm-text-muted)] mt-1.5">Email cannot be changed after registration.</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--fm-text-secondary)] mb-5">Preferences</h2>
        <div className="space-y-4">
          {[
            { label: 'Default platform', options: ['YouTube', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok'] },
            { label: 'Default style', options: ['Cinematic', 'Gaming', 'Vlog', 'Educational', 'Podcast', 'Minimal'] },
          ].map(({ label, options }) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--fm-text)]">{label}</p>
              </div>
              <select className="glass-input px-3 py-2 text-sm w-44 cursor-pointer">
                {options.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="glass rounded-2xl p-6 border border-red-500/10">
        <div className="flex items-center gap-2.5 mb-3">
          <AlertTriangle className="h-4.5 w-4.5 text-red-400" style={{ width: '1.125rem', height: '1.125rem' }} />
          <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
        </div>
        <p className="text-sm text-[var(--fm-text-secondary)] mb-4">
          Once deleted, all your thumbnails and account data are permanently removed.
        </p>
        <button
          onClick={() => toast.error('Account deletion requires email confirmation — coming soon')}
          className="text-sm font-medium text-red-400 border border-red-500/20 bg-red-500/6 hover:bg-red-500/12 rounded-xl px-4 py-2 transition-all"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
