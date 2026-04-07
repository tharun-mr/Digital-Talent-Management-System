import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  KeyIcon,
  TrashIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

// ── Reusable sub-components ────────────────────────────────────────────────

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
      <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-primary-50 to-secondary-50 flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary-600" />
      </div>
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="px-6 py-5 space-y-5">{children}</div>
  </div>
);

const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <p className="text-sm font-medium text-gray-800">{label}</p>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
        checked ? 'bg-gradient-to-r from-primary-600 to-secondary-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

const Divider = () => <div className="border-t border-gray-100" />;

// ── Main Component ─────────────────────────────────────────────────────────

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const [saved, setSaved] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Notification prefs
  const [notifs, setNotifs] = useState({
    emailTaskUpdates: true,
    emailWeeklyReport: true,
    pushBrowser: false,
    taskAssigned: true,
    taskCompleted: true,
    teamMentions: true,
    systemAnnouncements: false,
  });

  // Appearance
  const [appearance, setAppearance] = useState({
    theme: 'system',
    density: 'comfortable',
    language: 'en',
    timezone: 'Asia/Kolkata',
  });

  // Privacy
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    activityVisible: false,
    showOnlineStatus: true,
  });

  // Password form
  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [pwError, setPwError] = useState('');

  const flash = (msg) => {
    setSaved(msg);
    setTimeout(() => setSaved(''), 3000);
  };

  const handleSaveNotifs = () => flash('Notification preferences saved.');
  const handleSaveAppearance = () => flash('Appearance settings saved.');
  const handleSavePrivacy = () => flash('Privacy settings saved.');

  const handleChangePassword = () => {
    if (!passwords.current) return setPwError('Please enter your current password.');
    if (passwords.next.length < 8) return setPwError('New password must be at least 8 characters.');
    if (passwords.next !== passwords.confirm) return setPwError('Passwords do not match.');
    setPwError('');
    setPasswords({ current: '', next: '', confirm: '' });
    flash('Password changed successfully.');
  };

  const themes = ['light', 'dark', 'system'];
  const densities = ['compact', 'comfortable', 'spacious'];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account preferences and security.</p>
        </div>

        {/* Toast */}
        {saved && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium animate-slide-down">
            <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
            {saved}
          </div>
        )}

        {/* Notifications */}
        <SectionCard title="Notifications" icon={BellIcon}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</p>
          <Toggle
            label="Task updates"
            description="Get notified when tasks you own change status."
            checked={notifs.emailTaskUpdates}
            onChange={(v) => setNotifs((p) => ({ ...p, emailTaskUpdates: v }))}
          />
          <Divider />
          <Toggle
            label="Weekly summary report"
            description="A digest of activity sent every Monday morning."
            checked={notifs.emailWeeklyReport}
            onChange={(v) => setNotifs((p) => ({ ...p, emailWeeklyReport: v }))}
          />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">In-App</p>
          <Toggle
            label="Task assigned to me"
            checked={notifs.taskAssigned}
            onChange={(v) => setNotifs((p) => ({ ...p, taskAssigned: v }))}
          />
          <Divider />
          <Toggle
            label="Task completed"
            checked={notifs.taskCompleted}
            onChange={(v) => setNotifs((p) => ({ ...p, taskCompleted: v }))}
          />
          <Divider />
          <Toggle
            label="Team mentions"
            checked={notifs.teamMentions}
            onChange={(v) => setNotifs((p) => ({ ...p, teamMentions: v }))}
          />
          <Divider />
          <Toggle
            label="System announcements"
            checked={notifs.systemAnnouncements}
            onChange={(v) => setNotifs((p) => ({ ...p, systemAnnouncements: v }))}
          />
          <div className="pt-1">
            <button
              onClick={handleSaveNotifs}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-medium hover:shadow-md hover:scale-105 transition-all"
            >
              Save preferences
            </button>
          </div>
        </SectionCard>

        {/* Appearance */}
        <SectionCard title="Appearance" icon={PaintBrushIcon}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <div className="flex gap-2">
              {themes.map((t) => (
                <button
                  key={t}
                  onClick={() => setAppearance((p) => ({ ...p, theme: t }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all border ${
                    appearance.theme === t
                      ? 'bg-primary-50 border-primary-400 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Divider />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display density</label>
            <div className="flex gap-2">
              {densities.map((d) => (
                <button
                  key={d}
                  onClick={() => setAppearance((p) => ({ ...p, density: d }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all border ${
                    appearance.density === d
                      ? 'bg-primary-50 border-primary-400 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <Divider />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5"><GlobeAltIcon className="h-4 w-4" /> Language</span>
              </label>
              <select
                value={appearance.language}
                onChange={(e) => setAppearance((p) => ({ ...p, language: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                <option value="en">English</option>
                <option value="ta">Tamil</option>
                <option value="hi">Hindi</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
              <select
                value={appearance.timezone}
                onChange={(e) => setAppearance((p) => ({ ...p, timezone: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                <option value="Asia/Kolkata">Asia / Kolkata (IST)</option>
                <option value="America/New_York">America / New York (ET)</option>
                <option value="America/Los_Angeles">America / Los Angeles (PT)</option>
                <option value="Europe/London">Europe / London (GMT)</option>
                <option value="Asia/Tokyo">Asia / Tokyo (JST)</option>
              </select>
            </div>
          </div>
          <div className="pt-1">
            <button
              onClick={handleSaveAppearance}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-medium hover:shadow-md hover:scale-105 transition-all"
            >
              Save appearance
            </button>
          </div>
        </SectionCard>

        {/* Privacy */}
        <SectionCard title="Privacy" icon={ShieldCheckIcon}>
          <Toggle
            label="Public profile"
            description="Allow other team members to view your profile."
            checked={privacy.profileVisible}
            onChange={(v) => setPrivacy((p) => ({ ...p, profileVisible: v }))}
          />
          <Divider />
          <Toggle
            label="Activity visibility"
            description="Show your recent activity to teammates."
            checked={privacy.activityVisible}
            onChange={(v) => setPrivacy((p) => ({ ...p, activityVisible: v }))}
          />
          <Divider />
          <Toggle
            label="Online status"
            description="Let others see when you're active."
            checked={privacy.showOnlineStatus}
            onChange={(v) => setPrivacy((p) => ({ ...p, showOnlineStatus: v }))}
          />
          <div className="pt-1">
            <button
              onClick={handleSavePrivacy}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-medium hover:shadow-md hover:scale-105 transition-all"
            >
              Save privacy
            </button>
          </div>
        </SectionCard>

        {/* Change Password */}
        <SectionCard title="Change Password" icon={KeyIcon}>
          {pwError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{pwError}</p>
          )}
          {[
            { field: 'current', label: 'Current password', show: showCurrentPw, toggle: setShowCurrentPw },
            { field: 'next', label: 'New password', show: showNewPw, toggle: setShowNewPw },
            { field: 'confirm', label: 'Confirm new password', show: showConfirmPw, toggle: setShowConfirmPw },
          ].map(({ field, label, show, toggle }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={passwords[field]}
                  onChange={(e) => setPasswords((p) => ({ ...p, [field]: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => toggle(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {show ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400">Password must be at least 8 characters long.</p>
          <div className="pt-1">
            <button
              onClick={handleChangePassword}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-medium hover:shadow-md hover:scale-105 transition-all"
            >
              Update password
            </button>
          </div>
        </SectionCard>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-red-100">
            <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center">
              <TrashIcon className="h-4 w-4 text-red-500" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Danger Zone</h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-gray-600 mb-4">
              Deleting your account is permanent and cannot be undone. All your data, tasks, and activity will be removed.
            </p>
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-2 px-5 py-2 rounded-lg border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
                Delete my account
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700 font-medium flex-1">Are you absolutely sure? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { logout(); }}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Yes, delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;