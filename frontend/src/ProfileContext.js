import React, { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  // Load user profile
  const loadProfile = async (sessionId) => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/profile/${sessionId}`);
      const data = await response.json();

      if (data.success && data.profile) {
        setProfile(data.profile);
        setHasProfile(true);
      } else {
        setProfile(null);
        setHasProfile(false);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  // Create profile
  const createProfile = async (sessionId, profileData) => {
    try {
      const response = await fetch(`${backendUrl}/api/profile/create?session_id=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.profile);
        setHasProfile(true);
        return { success: true, profile: data.profile };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      return { success: false, message: 'Erreur lors de la création du profil' };
    }
  };

  // Update profile
  const updateProfile = async (sessionId, updateData) => {
    try {
      const response = await fetch(`${backendUrl}/api/profile/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.profile);
        return { success: true, profile: data.profile };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: 'Erreur lors de la mise à jour du profil' };
    }
  };

  // Clear profile (on logout)
  const clearProfile = () => {
    setProfile(null);
    setHasProfile(false);
    setLoading(false);
  };

  const value = {
    profile,
    hasProfile,
    loading,
    loadProfile,
    createProfile,
    updateProfile,
    clearProfile
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};