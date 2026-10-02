import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Mail,
  Building,
  Shield,
  Save,
  CheckCircle2,
  FileText,
  Camera,
  Loader2,
  Trash2,
  Upload,
  AlertCircle,
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, uploadAvatar, removeAvatar, updateProfile } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [institution, setInstitution] = useState(user?.organization || '');
  const [title, setTitle] = useState(user?.title || '');

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state whenever authenticated user updates
  useEffect(() => {
    if (user) {
      setName(user.fullName || '');
      setEmail(user.email || '');
      setInstitution(user.organization || '');
      setTitle(user.title || '');
    }
  }, [user]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg(null);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be re-selected if needed
    e.target.value = '';

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      showError('Please select a valid image file (JPEG, PNG, WEBP, or GIF).');
      return;
    }

    // Validate size (8MB max)
    if (file.size > 8 * 1024 * 1024) {
      showError('Image file size must be less than 8 MB.');
      return;
    }

    setIsUploadingAvatar(true);
    setErrorMsg(null);

    try {
      await uploadAvatar(file);
      showSuccess('Profile photo uploaded successfully! Any previous image was cleaned up.');
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      showError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user?.avatar) return;
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;

    setIsUploadingAvatar(true);
    setErrorMsg(null);

    try {
      await removeAvatar();
      showSuccess('Profile photo removed successfully.');
    } catch (err: any) {
      console.error('Avatar removal error:', err);
      showError(err.message || 'Failed to remove photo.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Full Name is required.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      await updateProfile({
        fullName: name.trim(),
        organization: institution.trim(),
        title: title.trim(),
      });
      showSuccess('Profile credentials updated successfully!');
    } catch (err: any) {
      console.error('Profile update error:', err);
      showError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = (name || user?.fullName || 'Student')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <DashboardLayout headerTitle="Candidate Credentials & Account Profile" headerSubtitle="MY PROFILE">
      <div className="space-y-6">
        {/* Toast Alerts */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full font-bold">
              UPDATED
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 flex items-center space-x-2 shadow-xs animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Avatar & Summary Card */}
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-4">
              {/* Avatar Container with Hover Upload Overlay */}
              <div className="relative w-28 h-28 mx-auto group">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-28 h-28 rounded-full object-cover ring-4 ring-amber-400/50 shadow-md transition-all group-hover:brightness-90"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-linear-to-br from-[#0A192F] to-slate-800 text-amber-400 font-black text-2xl flex items-center justify-center ring-4 ring-amber-400/50 shadow-md">
                    {initials}
                  </div>
                )}

                <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full z-10" />

                {/* Hover / Click Upload Trigger Button Overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  title="Upload new profile photo"
                  className="absolute inset-0 rounded-full bg-black/45 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px] z-20"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-amber-300 drop-shadow" />
                      <span className="text-[10px] font-extrabold text-white mt-0.5 tracking-tight">Change</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Buttons for Avatar */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-amber-700" />
                  )}
                  <span>{user?.avatar ? 'Change Photo' : 'Upload Photo'}</span>
                </button>

                {user?.avatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={isUploadingAvatar}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    title="Remove photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarFileSelect}
                className="hidden"
              />

              <div>
                <h2 className="text-lg font-bold text-[#0A192F]">{user?.fullName || name}</h2>
                <p className="text-xs text-slate-500">{user?.title || title || 'Enrolled Fellow'}</p>
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-slate-900 p-5 rounded-3xl text-white space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                <Shield className="w-4 h-4" />
                <span>Identity Verification Active</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Your medical registration and institutional affiliation are verified against the UK GMC / ISFRI registry.
              </p>
            </div>
          </div>

          {/* Right Column: Editable Information Form */}
          <div className="lg:col-span-2 space-y-6">
            <form
              onSubmit={handleSaveProfile}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6"
            >
              <h3 className="font-extrabold text-base text-[#0A192F] pb-2 border-b border-slate-100">
                Personal & Professional Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Alistair Vance"
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Professional Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      disabled
                      title="Primary account email cannot be changed directly."
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Institution / Authority</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. St Thomas' Hospital, London"
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Professional Specialty / Title</label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Forensic Pathologist / MD"
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center space-x-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
