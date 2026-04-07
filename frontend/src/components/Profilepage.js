import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { user, updateUser } = useAuth(); // assumes updateUser exists in AuthContext
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    department: user?.department || '',
    bio: user?.bio || '',
    joinedDate: user?.joinedDate || '2024-01-15',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Call your API / context update here
      if (updateUser) await updateUser(formData);
      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      department: user?.department || '',
      bio: user?.bio || '',
      joinedDate: user?.joinedDate || '2024-01-15',
    });
    setIsEditing(false);
  };

  const initials = formData.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const stats = [
    { label: 'Tasks Completed', value: '124' },
    { label: 'Projects', value: '8' },
    { label: 'Team Members', value: '16' },
    { label: 'Performance Score', value: '94%' },
  ];

  const fields = [
    { name: 'name', label: 'Full Name', icon: UserIcon, type: 'text' },
    { name: 'email', label: 'Email Address', icon: EnvelopeIcon, type: 'email' },
    { name: 'phone', label: 'Phone Number', icon: PhoneIcon, type: 'tel' },
    { name: 'location', label: 'Location', icon: MapPinIcon, type: 'text' },
    { name: 'department', label: 'Department', icon: BriefcaseIcon, type: 'text' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Success Banner */}
        {successMsg && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium animate-slide-down">
            <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Hero Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Cover */}
          <div className="h-28 bg-gradient-to-r from-primary-600 to-secondary-600" />

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 mb-6">
              {/* Avatar */}
              <div className="relative w-fit">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg border-4 border-white">
                  <span className="text-3xl font-bold text-white">{initials}</span>
                </div>
                {isEditing && (
                  <button className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md hover:bg-primary-700 transition-colors">
                    <CameraIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-medium hover:shadow-md hover:scale-105 transition-all disabled:opacity-60 disabled:scale-100"
                    >
                      {isSaving ? (
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : (
                        <CheckIcon className="h-4 w-4" />
                      )}
                      {isSaving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-medium hover:shadow-md hover:scale-105 transition-all"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Name / Role */}
            <h1 className="text-2xl font-bold text-gray-900">{formData.name || 'Your Name'}</h1>
            <p className="text-sm text-gray-500 capitalize mt-0.5">{user?.role} &middot; {formData.department || 'Department'}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {stats.map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {fields.map(({ name, label, icon: Icon, type }) => (
              <div key={name}>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
                {isEditing ? (
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
                    placeholder={label}
                  />
                ) : (
                  <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                    <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{formData[name] || <span className="text-gray-400 italic">Not set</span>}</span>
                  </div>
                )}
              </div>
            ))}

            {/* Joined date (read-only) */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Member Since</label>
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {new Date(formData.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-5">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Bio</label>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all resize-none"
                placeholder="Tell your team a little about yourself…"
              />
            ) : (
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 min-h-[60px]">
                {formData.bio || <span className="text-gray-400 italic">No bio added yet.</span>}
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;