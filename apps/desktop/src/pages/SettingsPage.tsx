// ============================================
// Settings Page — Profile & Workspace settings
// ============================================
import { useEffect, useState } from 'react';
import { Settings, User, Building2, Save, Check } from 'lucide-react';
import { useAuthStore } from '../stores/auth-store';
import { useWorkspaceStore } from '../stores/workspace-store';
import { usersApi } from '../api';
import '../styles/settings.css';

type SettingsTab = 'profile' | 'workspace';

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { selectedWorkspace } = useWorkspaceStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Profile state
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Workspace state
  const [workspaceName, setWorkspaceName] = useState(selectedWorkspace?.name ?? '');

  useEffect(() => {
    setDisplayName(user?.displayName ?? '');
  }, [user]);

  useEffect(() => {
    setWorkspaceName(selectedWorkspace?.name ?? '');
  }, [selectedWorkspace]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setProfileSaving(true);
    setProfileSaved(false);
    try {
      const updates: { displayName?: string; avatarUrl?: string } = {};
      if (displayName.trim()) updates.displayName = displayName.trim();
      if (avatarUrl.trim()) updates.avatarUrl = avatarUrl.trim();

      await usersApi.updateProfile(user.id, updates);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setProfileSaving(false);
    }
  };

  const TABS: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { key: 'profile', label: 'Profile', icon: <User size={16} /> },
    { key: 'workspace', label: 'Workspace', icon: <Building2 size={16} /> },
  ];

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div className="settings-header-left">
          <Settings size={22} />
          <h2>Settings</h2>
        </div>
      </header>

      <div className="settings-layout">
        {/* Tab nav */}
        <nav className="settings-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`settings-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div className="settings-content">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h3 className="settings-section-title">
                <User size={18} />
                Profile Information
              </h3>
              <p className="settings-section-desc">
                Manage your account details and how others see you.
              </p>

              <div className="settings-form">
                <div className="form-group">
                  <label htmlFor="settings-email">Email</label>
                  <input
                    id="settings-email"
                    type="email"
                    value={user?.email ?? ''}
                    disabled
                    className="form-input disabled"
                  />
                  <span className="form-hint">Email cannot be changed</span>
                </div>

                <div className="form-group">
                  <label htmlFor="settings-name">Display Name</label>
                  <input
                    id="settings-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="settings-avatar">Avatar URL</label>
                  <input
                    id="settings-avatar"
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="form-input"
                  />
                  <span className="form-hint">Enter a URL to your profile picture</span>
                </div>

                <div className="form-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                  >
                    {profileSaved ? (
                      <>
                        <Check size={14} /> Saved
                      </>
                    ) : profileSaving ? (
                      'Saving…'
                    ) : (
                      <>
                        <Save size={14} /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workspace' && (
            <div className="settings-section">
              <h3 className="settings-section-title">
                <Building2 size={18} />
                Workspace Settings
              </h3>
              <p className="settings-section-desc">
                Manage your workspace configuration and preferences.
              </p>

              <div className="settings-form">
                <div className="form-group">
                  <label htmlFor="ws-name">Workspace Name</label>
                  <input
                    id="ws-name"
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="form-input"
                    disabled
                  />
                  <span className="form-hint">Workspace renaming coming soon</span>
                </div>

                <div className="form-group">
                  <label>Members</label>
                  <div className="ws-stat">
                    {selectedWorkspace?.members?.length ?? 0} member(s) in this workspace
                  </div>
                </div>

                <div className="form-group">
                  <label>Created</label>
                  <div className="ws-stat">
                    {selectedWorkspace?.createdAt
                      ? new Date(selectedWorkspace.createdAt).toLocaleDateString()
                      : '—'}
                  </div>
                </div>
              </div>

              {/* Danger zone */}
              <div className="danger-zone">
                <h4>Danger Zone</h4>
                <p>
                  Permanently delete this workspace and all its data. This action cannot be undone.
                </p>
                <button className="btn btn-danger" disabled>
                  Delete Workspace
                </button>
                <span className="form-hint">Workspace deletion is disabled for safety</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
