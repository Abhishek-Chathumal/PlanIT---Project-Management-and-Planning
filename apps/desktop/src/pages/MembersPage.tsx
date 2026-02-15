// ============================================
// Members Page — Workspace member management
// ============================================
import { useEffect, useState } from 'react';
import { Users, UserPlus, Shield, Crown, Eye, User, Mail, Search } from 'lucide-react';
import { useWorkspaceStore } from '../stores/workspace-store';
import '../styles/members.css';

interface Member {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    isActive: boolean;
    lastLoginAt?: string;
  };
}

const ROLE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  OWNER: { icon: <Crown size={14} />, label: 'Owner', color: '#f59e0b' },
  ADMIN: { icon: <Shield size={14} />, label: 'Admin', color: '#8b5cf6' },
  MEMBER: { icon: <User size={14} />, label: 'Member', color: '#3b82f6' },
  VIEWER: { icon: <Eye size={14} />, label: 'Viewer', color: '#71717a' },
};

export function MembersPage() {
  const { selectedWorkspace } = useWorkspaceStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    if (!selectedWorkspace) return;
    // Use workspace members from store if available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wsMembers = (selectedWorkspace as any).members as Member[] | undefined;
    if (wsMembers && Array.isArray(wsMembers)) {
      setMembers(wsMembers);
    }
    setLoading(false);
  }, [selectedWorkspace]);

  const filteredMembers = members.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.user.displayName.toLowerCase().includes(q) ||
      m.user.email.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q)
    );
  });

  const roleGroups = {
    OWNER: filteredMembers.filter((m) => m.role === 'OWNER'),
    ADMIN: filteredMembers.filter((m) => m.role === 'ADMIN'),
    MEMBER: filteredMembers.filter((m) => m.role === 'MEMBER'),
    VIEWER: filteredMembers.filter((m) => m.role === 'VIEWER'),
  };

  const isValidUrl = (url?: string) =>
    url && (url.startsWith('http://') || url.startsWith('https://'));

  if (loading) {
    return (
      <div className="members-page">
        <div className="members-loading">
          <div className="loading-spinner" />
          <span>Loading members…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="members-page">
      <header className="members-header">
        <div className="members-header-left">
          <Users size={22} />
          <h2>Team Members</h2>
          <span className="member-total-count">{members.length}</span>
        </div>
        <div className="members-header-right">
          <div className="search-box">
            <Search size={14} />
            <input
              placeholder="Search members…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowInvite(!showInvite)}>
            <UserPlus size={14} />
            Invite
          </button>
        </div>
      </header>

      {/* Invite bar */}
      {showInvite && (
        <div className="invite-bar">
          <Mail size={16} />
          <input
            autoFocus
            type="email"
            placeholder="Enter email address to invite…"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="invite-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inviteEmail.trim()) {
                // TODO: Implement invite API
                setInviteEmail('');
                setShowInvite(false);
              }
              if (e.key === 'Escape') setShowInvite(false);
            }}
          />
          <select className="invite-role-select">
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
            <option value="VIEWER">Viewer</option>
          </select>
          <button
            className="btn btn-primary btn-sm"
            disabled={!inviteEmail.trim()}
            onClick={() => {
              // TODO: Implement invite API
              setInviteEmail('');
              setShowInvite(false);
            }}
          >
            Send Invite
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowInvite(false)}>
            Cancel
          </button>
        </div>
      )}

      {/* Role summary */}
      <div className="role-summary">
        {Object.entries(ROLE_CONFIG).map(([role, config]) => {
          const count = roleGroups[role as keyof typeof roleGroups]?.length ?? 0;
          if (count === 0) return null;
          return (
            <div key={role} className="role-summary-chip" style={{ color: config.color }}>
              {config.icon}
              <span>
                {count} {config.label}
                {count !== 1 ? 's' : ''}
              </span>
            </div>
          );
        })}
      </div>

      {/* Members list */}
      <div className="members-list">
        {filteredMembers.length === 0 ? (
          <div className="empty-members">
            <Users size={32} />
            <h3>No members found</h3>
            <p>
              {searchQuery
                ? 'No members match your search.'
                : 'Invite team members to get started.'}
            </p>
          </div>
        ) : (
          filteredMembers.map((member) => {
            const roleConfig = ROLE_CONFIG[member.role] ?? ROLE_CONFIG.MEMBER!;
            return (
              <div key={member.id} className="member-card">
                <div className="member-avatar">
                  {isValidUrl(member.user.avatarUrl) ? (
                    <img src={member.user.avatarUrl} alt="" />
                  ) : (
                    <span>{member.user.displayName.charAt(0).toUpperCase()}</span>
                  )}
                  <div
                    className={`status-dot ${member.user.isActive ? 'online' : 'offline'}`}
                    title={member.user.isActive ? 'Active' : 'Inactive'}
                  />
                </div>
                <div className="member-info">
                  <div className="member-name">{member.user.displayName}</div>
                  <div className="member-email">{member.user.email}</div>
                </div>
                <div className="member-role" style={{ color: roleConfig.color }}>
                  {roleConfig.icon}
                  <span>{roleConfig.label}</span>
                </div>
                <div className="member-joined">
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
