import { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useUIStore } from '@/stores/uiStore';

const AVATARS = ['😊', '😎', '🤗', '🦊', '🐱', '🐶', '🦄', '🌟', '🎨', '🎵', '🌈', '🚀'];

export default function ProfilePage() {
  const { profile, updateProfile } = useUserStore();
  const { addToast } = useUIStore();
  const [editName, setEditName] = useState(profile?.name || '');
  const [editAvatar, setEditAvatar] = useState(profile?.avatar || '😊');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    updateProfile({
      name: editName.trim() || 'User',
      avatar: editAvatar,
    });
    setIsEditing(false);
    addToast('Profile updated', 'success');
  };

  if (!profile) {
    return (
      <div className="max-w-md mx-auto p-4 text-center py-16 text-gray-400" data-testid="profile-empty">
        <span className="text-5xl block mb-4">👤</span>
        <p>No profile found. Complete onboarding first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6" data-testid="profile-page">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Profile
      </h1>

      {/* Avatar + Name */}
      <div className="card p-6 text-center space-y-4">
        {isEditing ? (
          <>
            {/* Avatar picker */}
            <div className="flex flex-wrap justify-center gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  onClick={() => setEditAvatar(av)}
                  className={`text-3xl p-2 rounded-xl transition-all
                    ${editAvatar === av ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-400 scale-110' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                  `}
                  data-testid={`avatar-option-${av}`}
                >
                  {av}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="input-field text-center text-lg w-full max-w-xs mx-auto"
              placeholder="Your name"
              data-testid="edit-name-input"
            />

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setIsEditing(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary"
                data-testid="save-profile"
              >
                Save
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="text-6xl block">{profile.avatar}</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {profile.name}
            </h2>
            <p className="text-xs text-gray-400">
              Member since{' '}
              {new Date(profile.createdAt).toLocaleDateString()}
            </p>
            <button
              onClick={() => {
                setEditName(profile.name);
                setEditAvatar(profile.avatar);
                setIsEditing(true);
              }}
              className="btn-secondary text-sm"
              data-testid="edit-profile-btn"
            >
              ✏️ Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
}
