import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfile } from './ProfileContext';

// Profile Creation Component
export const ProfileCreationScreen = ({ onProfileCreated, sessionId }) => {
  const { t } = useTranslation();
  const { createProfile } = useProfile();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    city: '',
    country: '',
    occupation: '',
    avatar_base64: '',
    language: 'fr',
    currency: 'FCFA'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('La photo ne doit pas dépasser 2MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner un fichier image');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setFormData(prev => ({
          ...prev,
          avatar_base64: base64
        }));
        setAvatarPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setFormData(prev => ({
      ...prev,
      avatar_base64: ''
    }));
    setAvatarPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await createProfile(sessionId, formData);
      
      if (result.success) {
        console.log('Profile created successfully:', result.profile);
        onProfileCreated(result.profile);
      } else {
        setError(result.message || 'Erreur lors de la création du profil');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      setError('Erreur lors de la création du profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('profile.create_title')}</h1>
          <p className="text-gray-600">{t('profile.create_subtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-violet-200 mb-4">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <label className="bg-violet-500 text-white px-4 py-2 rounded-lg hover:bg-violet-600 cursor-pointer text-sm transition-colors">
                {t('profile.upload_photo')}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm transition-colors"
                >
                  {t('profile.remove_photo')}
                </button>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.first_name')} *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.last_name')} *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.date_of_birth')}
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.gender')}
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="">{t('profile.gender')}</option>
              <option value="male">{t('profile.male')}</option>
              <option value="female">{t('profile.female')}</option>
              <option value="other">{t('profile.other')}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.city')}
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.country')}
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.occupation')}
            </label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.language')}
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.currency')}
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="FCFA">FCFA</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.first_name || !formData.last_name}
            className="w-full bg-violet-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-violet-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? t('common.loading') : t('profile.create_profile')}
          </button>
        </form>
      </div>
    </div>
  );
};

// Profile Edit Modal Component
export const ProfileEditModal = ({ isOpen, onClose, sessionId, currentProfile, onProfileUpdated }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    city: '',
    country: '',
    occupation: '',
    avatar_base64: '',
    language: 'fr',
    currency: 'FCFA'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (currentProfile) {
      setFormData({
        first_name: currentProfile.first_name || '',
        last_name: currentProfile.last_name || '',
        date_of_birth: currentProfile.date_of_birth || '',
        gender: currentProfile.gender || '',
        city: currentProfile.city || '',
        country: currentProfile.country || '',
        occupation: currentProfile.occupation || '',
        avatar_base64: currentProfile.avatar_base64 || '',
        language: currentProfile.language || 'fr',
        currency: currentProfile.currency || 'FCFA'
      });
      setAvatarPreview(currentProfile.avatar_base64 || '');
    }
  }, [currentProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('La photo ne doit pas dépasser 2MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner un fichier image');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setFormData(prev => ({
          ...prev,
          avatar_base64: base64
        }));
        setAvatarPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setFormData(prev => ({
      ...prev,
      avatar_base64: ''
    }));
    setAvatarPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${backendUrl}/api/profile/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        onProfileUpdated(data.profile);
        onClose();
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{t('profile.edit_title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-violet-200 mb-4">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <label className="bg-violet-500 text-white px-4 py-2 rounded-lg hover:bg-violet-600 cursor-pointer text-sm transition-colors">
                {t('profile.upload_photo')}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm transition-colors"
                >
                  {t('profile.remove_photo')}
                </button>
              )}
            </div>
          </div>

          {/* Form Fields - Same as creation form */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.first_name')} *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.last_name')} *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.date_of_birth')}
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.gender')}
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="">{t('profile.gender')}</option>
              <option value="male">{t('profile.male')}</option>
              <option value="female">{t('profile.female')}</option>
              <option value="other">{t('profile.other')}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.city')}
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.country')}
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.occupation')}
            </label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.language')}
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.currency')}
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="FCFA">FCFA</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !formData.first_name || !formData.last_name}
              className="flex-1 bg-violet-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-violet-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t('common.loading') : t('profile.save_profile')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};