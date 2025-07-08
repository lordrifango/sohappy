import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useStreamClient } from './StreamContext';

const ContactsList = ({ isOpen, onClose }) => {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingChat, setIsCreatingChat] = useState(null);
  const { sessionId } = useAuth();
  const { createDirectChannel } = useStreamClient();

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
    }
  }, [isOpen, sessionId]);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/contacts/${sessionId}`);
      const data = await response.json();

      if (data.success) {
        setContacts(data.contacts);
      } else {
        console.error('Error fetching contacts:', data.message);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = async (contact) => {
    setIsCreatingChat(contact.id);

    try {
      const channel = await createDirectChannel(contact.user_id, contact.name);
      
      if (channel) {
        // Navigate to the chat
        window.location.href = `/chat/direct/${channel.id}`;
        onClose();
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Erreur lors de la création du chat');
    } finally {
      setIsCreatingChat(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Mes Contacts</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-600">Aucun contact pour le moment</p>
            <p className="text-sm text-gray-500 mt-2">
              Utilisez la fonction de recherche pour ajouter des contacts.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <img
                      src={contact.avatar_url}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{contact.name}</h3>
                    <p className="text-sm text-gray-600">{contact.phone}</p>
                    <p className="text-xs text-gray-500">
                      {contact.city}, {contact.country}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleStartChat(contact)}
                  disabled={isCreatingChat === contact.id}
                  className="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                >
                  {isCreatingChat === contact.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                      ...
                    </div>
                  ) : (
                    '💬'
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

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

export default ContactsList;