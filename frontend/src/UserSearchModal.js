import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useStreamClient } from './StreamContext';

const UserSearchModal = ({ isOpen, onClose }) => {
  const [searchPhone, setSearchPhone] = useState('');
  const [searchCountryCode, setSearchCountryCode] = useState('+33');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const { sessionId } = useAuth();
  const { createDirectChannel } = useStreamClient();

  const countryCodes = [
    { code: '+33', name: 'France', flag: '🇫🇷' },
    { code: '+1', name: 'États-Unis', flag: '🇺🇸' },
    { code: '+44', name: 'Royaume-Uni', flag: '🇬🇧' },
    { code: '+49', name: 'Allemagne', flag: '🇩🇪' },
    { code: '+39', name: 'Italie', flag: '🇮🇹' },
    { code: '+34', name: 'Espagne', flag: '🇪🇸' },
    { code: '+223', name: 'Mali', flag: '🇲🇱' },
    { code: '+226', name: 'Burkina Faso', flag: '🇧🇫' },
    { code: '+225', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
    { code: '+221', name: 'Sénégal', flag: '🇸🇳' },
    { code: '+224', name: 'Guinée', flag: '🇬🇳' },
    { code: '+227', name: 'Niger', flag: '🇳🇪' },
    { code: '+228', name: 'Togo', flag: '🇹🇬' },
    { code: '+229', name: 'Bénin', flag: '🇧🇯' }
  ];

  const handleSearch = async () => {
    if (!searchPhone.trim()) return;

    setIsSearching(true);
    setSearchResults(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: searchPhone,
          country_code: searchCountryCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSearchResults(data);
      } else {
        alert('Erreur lors de la recherche: ' + data.message);
      }
    } catch (error) {
      console.error('Error searching user:', error);
      alert('Erreur lors de la recherche');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddContact = async (userData) => {
    setIsAddingContact(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/add-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          contact_phone: userData.phone,
          contact_country_code: userData.country_code,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Contact ajouté avec succès !');
      } else {
        alert('Erreur lors de l\'ajout du contact: ' + data.message);
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Erreur lors de l\'ajout du contact');
    } finally {
      setIsAddingContact(false);
    }
  };

  const handleStartChat = async (userData) => {
    setIsCreatingChat(true);

    try {
      const channel = await createDirectChannel(userData.user_id, userData.first_name + ' ' + userData.last_name);
      
      if (channel) {
        // Navigate to the chat
        window.location.href = `/chat/direct/${channel.id}`;
        onClose();
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Erreur lors de la création du chat');
    } finally {
      setIsCreatingChat(false);
    }
  };

  const resetSearch = () => {
    setSearchPhone('');
    setSearchResults(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Rechercher un utilisateur</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Search Form */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone
            </label>
            <div className="flex gap-2">
              <select
                value={searchCountryCode}
                onChange={(e) => setSearchCountryCode(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="Numéro de téléphone"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchPhone.trim()}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Recherche...
              </div>
            ) : (
              'Rechercher'
            )}
          </button>

          {/* Search Results */}
          {searchResults && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              {searchResults.user_found ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <img
                        src={searchResults.user_data.avatar_url}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {searchResults.user_data.first_name} {searchResults.user_data.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {searchResults.user_data.phone}
                      </p>
                      <p className="text-xs text-gray-500">
                        {searchResults.user_data.city}, {searchResults.user_data.country}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddContact(searchResults.user_data)}
                      disabled={isAddingContact}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isAddingContact ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Ajout...
                        </div>
                      ) : (
                        '👥 Ajouter au contact'
                      )}
                    </button>
                    <button
                      onClick={() => handleStartChat(searchResults.user_data)}
                      disabled={isCreatingChat}
                      className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isCreatingChat ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Création...
                        </div>
                      ) : (
                        '💬 Discuter'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">Utilisateur non trouvé</p>
                  <p className="text-sm text-gray-500 mt-2">
                    L'utilisateur avec ce numéro n'est pas encore inscrit sur Tonty.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;