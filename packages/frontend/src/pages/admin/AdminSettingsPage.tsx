import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  ShieldCheck,
  Mail,
  Lock,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Key,
  UserCheck,
  Shield,
  Save,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();

  // Email form state
  const [email, setEmail] = useState(user?.email || '');
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);

    if (!emailCurrentPassword) {
      setEmailError('Please enter your current password to confirm email change.');
      return;
    }

    if (email.trim().toLowerCase() === user?.email.toLowerCase()) {
      setEmailError('The new email is the same as your current email.');
      return;
    }

    setEmailLoading(true);
    try {
      await updateProfile({
        email: email.trim(),
        currentPassword: emailCurrentPassword,
      });
      setEmailSuccess('Owner email address has been successfully updated.');
      setEmailCurrentPassword('');
    } catch (err: any) {
      setEmailError(err.response?.data?.error || 'Failed to update email. Please verify your password.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match. Please retype carefully.');
      return;
    }

    setPasswordLoading(true);
    try {
      await updateProfile({
        currentPassword,
        newPassword,
      });
      setPasswordSuccess('Owner password has been successfully updated. Your session remains authenticated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || 'Failed to update password. Please check your current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Profile & Security</h1>
          <span
            style={{
              background: 'rgba(99, 102, 241, 0.18)',
              color: '#a5b4fc',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            OWNER / ADMIN
          </span>
        </div>
        <p className="page-subtitle" style={{ marginBottom: 0 }}>
          Manage your NAPONI platform credentials, update your login email or password, and control session security.
        </p>
      </div>

      {/* Account Identity Summary Card */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.2rem',
              }}
            >
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ffffff' }}>
                {user?.email}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Shield size={14} color="#10b981" />
                Root Administrator & Platform Owner
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                color: '#6ee7b7',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={16} /> Active & Verified
            </div>
            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem' }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        {/* Update Email Form */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
            <Mail size={22} color="#6366f1" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Change Login Email</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Update the primary email address used to log into the NAPONI Owner Panel.
          </p>

          {emailSuccess && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#6ee7b7',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={16} /> {emailSuccess}
            </div>
          )}

          {emailError && (
            <div
              style={{
                background: 'var(--danger-bg)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#fca5a5',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertTriangle size={16} /> {emailError}
            </div>
          )}

          <form onSubmit={handleUpdateEmail}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">New Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@naponi.com"
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Current Password (To Confirm Identity)</label>
              <input
                type="password"
                required
                value={emailCurrentPassword}
                onChange={(e) => setEmailCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={emailLoading}
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Save size={16} /> {emailLoading ? 'Saving...' : 'Save New Email'}
            </button>
          </form>
        </div>

        {/* Update Password Form */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
            <Key size={22} color="#ec4899" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Change Password</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Update your master Owner account password with bank-grade encryption.
          </p>

          {passwordSuccess && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#6ee7b7',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={16} /> {passwordSuccess}
            </div>
          )}

          {passwordError && (
            <div
              style={{
                background: 'var(--danger-bg)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#fca5a5',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertTriangle size={16} /> {passwordError}
            </div>
          )}

          <form onSubmit={handleUpdatePassword}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">New Password (Min. 8 characters)</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter strong new password"
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Lock size={16} /> {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
