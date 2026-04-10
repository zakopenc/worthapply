'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  full_name: string;
  email: string;
  plan: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, plan')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const profileWithEmail = {
        full_name: profileData.full_name || '',
        email: user.email || '',
        plan: profileData.plan || 'free',
      };

      setProfile(profileWithEmail);
      setFullName(profileData.full_name || '');
    } catch (err) {
      setError((err as Error).message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess('Profile updated successfully!');
      loadProfile(); // Reload to get latest data
    } catch (err) {
      setError((err as Error).message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="max-w-[960px] mx-auto py-20 px-8">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-5xl font-black tracking-tight text-on-surface mb-4">
            Settings
          </h1>
          <p className="text-xl text-on-surface/60 max-w-2xl leading-relaxed">
            Manage your account settings and preferences
          </p>
        </header>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-error-container/10 border border-error rounded-xl">
            <p className="text-error font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-outline-variant/20">
          <button
            className={`pb-4 px-2 font-semibold transition-all ${
              activeTab === 'profile'
                ? 'text-secondary border-b-2 border-secondary'
                : 'text-on-surface/60 hover:text-on-surface'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`pb-4 px-2 font-semibold transition-all ${
              activeTab === 'account'
                ? 'text-secondary border-b-2 border-secondary'
                : 'text-on-surface/60 hover:text-on-surface'
            }`}
            onClick={() => setActiveTab('account')}
          >
            Account
          </button>
          <button
            className={`pb-4 px-2 font-semibold transition-all ${
              activeTab === 'billing'
                ? 'text-secondary border-b-2 border-secondary'
                : 'text-on-surface/60 hover:text-on-surface'
            }`}
            onClick={() => setActiveTab('billing')}
          >
            Billing
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-lg text-on-surface/60">Loading settings...</div>
          </div>
        )}

        {/* Profile Tab */}
        {!loading && activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile}>
            <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-10 shadow-sm">
              <h2 className="text-2xl font-bold text-on-surface mb-6">
                Profile Information
              </h2>

              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-secondary ml-1">
                    Full Name
                  </label>
                  <input
                    className="bg-surface-container-high border-none rounded-2xl p-4 focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary/20 transition-all"
                    placeholder="Your full name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-secondary ml-1">
                    Email
                  </label>
                  <input
                    className="bg-surface-container-high border-none rounded-2xl p-4 opacity-50 cursor-not-allowed"
                    type="email"
                    value={profile?.email || ''}
                    disabled
                  />
                  <p className="text-sm text-on-surface/60 ml-1">
                    Email cannot be changed
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-secondary ml-1">
                    Current Plan
                  </label>
                  <div className="bg-surface-container-high rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-on-surface capitalize">
                          {profile?.plan || 'Free'}
                        </div>
                        <div className="text-sm text-on-surface/60">
                          {profile?.plan === 'free' 
                            ? '3 analyses per month'
                            : 'Unlimited analyses'}
                        </div>
                      </div>
                      {profile?.plan === 'free' && (
                        <Button
                          variant="secondary"
                          onClick={() => (window.location.href = '/pricing')}
                          icon={
                            <span className="material-symbols-outlined text-[20px]">
                              upgrade
                            </span>
                          }
                          iconPosition="left"
                        >
                          Upgrade
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                  icon={
                    <span className="material-symbols-outlined text-[20px]">
                      save
                    </span>
                  }
                  iconPosition="left"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </section>
          </form>
        )}

        {/* Account Tab */}
        {!loading && activeTab === 'account' && (
          <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-on-surface mb-6">
              Account Settings
            </h2>

            <div className="space-y-6">
              <div className="p-5 bg-surface-container-high rounded-xl">
                <h3 className="font-bold text-on-surface mb-2">
                  Change Password
                </h3>
                <p className="text-sm text-on-surface/60 mb-4">
                  Update your password to keep your account secure
                </p>
                <Button
                  variant="outline"
                  onClick={() => alert('Password change coming soon!')}
                  icon={
                    <span className="material-symbols-outlined text-[20px]">
                      lock
                    </span>
                  }
                  iconPosition="left"
                >
                  Change password
                </Button>
              </div>

              <div className="p-5 bg-red-50 border border-red-200 rounded-xl">
                <h3 className="font-bold text-red-900 mb-2">
                  Delete Account
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete your account?')) {
                      alert('Account deletion coming soon!');
                    }
                  }}
                  icon={
                    <span className="material-symbols-outlined text-[20px]">
                      delete_forever
                    </span>
                  }
                  iconPosition="left"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Delete account
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Billing Tab */}
        {!loading && activeTab === 'billing' && (
          <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-on-surface mb-6">
              Billing & Subscription
            </h2>

            <div className="space-y-6">
              <div className="p-5 bg-surface-container-high rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-on-surface capitalize">
                      {profile?.plan || 'Free'} Plan
                    </h3>
                    <p className="text-sm text-on-surface/60">
                      {profile?.plan === 'free'
                        ? 'Limited features'
                        : '$19.99/month - Billed monthly'}
                    </p>
                  </div>
                  {profile?.plan !== 'free' && (
                    <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold text-sm">
                      Active
                    </div>
                  )}
                </div>

                {profile?.plan === 'free' ? (
                  <Button
                    variant="primary"
                    onClick={() => (window.location.href = '/pricing')}
                    icon={
                      <span className="material-symbols-outlined text-[20px]">
                        upgrade
                      </span>
                    }
                    iconPosition="left"
                  >
                    Upgrade to Pro
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => alert('Manage subscription coming soon!')}
                    icon={
                      <span className="material-symbols-outlined text-[20px]">
                        settings
                      </span>
                    }
                    iconPosition="left"
                  >
                    Manage subscription
                  </Button>
                )}
              </div>

              {profile?.plan !== 'free' && (
                <div className="p-5 bg-surface-container-high rounded-xl">
                  <h3 className="font-bold text-on-surface mb-2">
                    Payment Method
                  </h3>
                  <p className="text-sm text-on-surface/60 mb-4">
                    Visa ending in 4242
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => alert('Update payment method coming soon!')}
                    icon={
                      <span className="material-symbols-outlined text-[20px]">
                        credit_card
                      </span>
                    }
                    iconPosition="left"
                  >
                    Update payment method
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
