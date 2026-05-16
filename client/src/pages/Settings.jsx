import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Lock, Palette, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  // Profile form
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });

  // Password form
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/profile', profile);
      updateUser(profile);
      toast.success('Profile updated');
    } catch { /* interceptor */ }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch { /* interceptor */ }
    finally { setSaving(false); }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Settings</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Manage your account preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-60 shrink-0">
          <div className="card p-2 flex lg:flex-col gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left w-full
                  ${tab === t.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'}`}
              >
                <t.icon size={18} />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 card p-6 lg:p-8">
          {tab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-6 max-w-lg">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">Profile Information</h2>
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Full Name</label>
                <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Email</label>
                <input type="email" value={user?.email || ''} className="input-field opacity-60 cursor-not-allowed" disabled />
                <p className="text-xs text-surface-400 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Phone</label>
                <input type="tel" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="input-field" placeholder="+91 XXXXX XXXXX" />
              </div>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                Save Changes
              </button>
            </form>
          )}

          {tab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-6 max-w-lg">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">Change Password</h2>
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Current Password</label>
                <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">New Password</label>
                <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Confirm New Password</label>
                <input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} className="input-field" required />
              </div>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Lock size={18} />}
                Update Password
              </button>
            </form>
          )}

          {tab === 'appearance' && (
            <div className="space-y-6 max-w-lg">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">Appearance</h2>
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-surface-200 dark:border-surface-700">
                <div>
                  <p className="font-semibold text-surface-900 dark:text-white">Dark Mode</p>
                  <p className="text-sm text-surface-500">Switch between light and dark themes</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isDark ? 'bg-primary-500' : 'bg-surface-300'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-300 ${isDark ? 'translate-x-7' : ''}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
