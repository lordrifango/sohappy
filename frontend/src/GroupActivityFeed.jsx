import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LedgerEvent from './LedgerEvent';

// Composant UserPost pour les posts des utilisateurs
const UserPostCard = ({ post }) => {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Il y a quelques minutes';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) {
        return 'Hier';
      } else if (diffInDays < 7) {
        return `Il y a ${diffInDays} jours`;
      } else {
        return date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      <div className="flex items-start space-x-3">
        {/* Avatar de l'utilisateur */}
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 ${getAvatarColor(post.author.name)} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
            {getInitials(post.author.name)}
          </div>
        </div>
        
        {/* Contenu du post */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-semibold text-gray-800 text-sm">{post.author.name}</h4>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{formatTimestamp(post.timestamp)}</span>
          </div>
          
          <p className="text-gray-700 text-sm leading-relaxed mb-3">
            {post.content}
          </p>
          
          {/* Actions sociales */}
          <div className="flex items-center space-x-6">
            <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 text-xs transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{post.likes || 0}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 text-xs transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comments || 0}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-gray-500 hover:text-emerald-500 text-xs transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span>Partager</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant principal GroupActivityFeed
const GroupActivityFeed = ({ groupId, sessionId, isEmbedded = false }) => {
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
        
        const response = await axios.get(
          `${backendUrl}/api/v1/group/${groupId}/feed?session_id=${sessionId}`
        );
        
        if (response.data.success) {
          setFeedItems(response.data.items);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error('Error fetching group feed:', err);
        setError('Erreur lors du chargement du fil d\'activité');
      } finally {
        setLoading(false);
      }
    };

    if (groupId && sessionId) {
      fetchFeed();
    }
  }, [groupId, sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du fil d'activité...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <div className="text-red-500">⚠️</div>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isEmbedded ? "bg-gray-50" : "min-h-screen bg-gray-50"}>
      {/* En-tête du fil d'activité - seulement si pas intégré */}
      {!isEmbedded && (
        <div className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white p-4">
          <h1 className="text-2xl font-bold mb-1">Fil d'Activité du Groupe</h1>
          <p className="opacity-90 text-sm">
            Suivez l'historique vivante et inaltérable de votre groupe
          </p>
        </div>
      )}

      {/* Zone de création de post */}
      <div className="p-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              ME
            </div>
            <input 
              type="text" 
              placeholder="Partagez quelque chose avec votre groupe..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex space-x-4 text-gray-500">
              <button className="flex items-center space-x-1 text-sm hover:text-violet-600 transition-colors">
                <span>📷</span>
                <span>Photo</span>
              </button>
              <button className="flex items-center space-x-1 text-sm hover:text-violet-600 transition-colors">
                <span>📊</span>
                <span>Sondage</span>
              </button>
            </div>
            <button className="bg-violet-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-violet-600 transition-colors">
              Publier
            </button>
          </div>
        </div>

        {/* Fil d'activité mixte */}
        <div className="space-y-1">
          {feedItems.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Pas d'activité pour le moment</h3>
              <p className="text-gray-600">Les événements et messages apparaîtront ici au fur et à mesure.</p>
            </div>
          ) : (
            feedItems.map(item => {
              // Rendu conditionnel basé sur le type
              if (item.type === 'LEDGER_EVENT') {
                return <LedgerEvent key={item.id} event={item} />;
              } else if (item.type === 'POST') {
                return <UserPostCard key={item.id} post={item} />;
              }
              return null; // Ignore les types inconnus
            })
          )}
        </div>

        {/* Légende explicative */}
        <div className="mt-6 bg-violet-50 border border-violet-200 rounded-xl p-4">
          <h4 className="text-violet-800 font-semibold mb-2 flex items-center">
            <span className="mr-2">ℹ️</span>
            À propos de ce fil d'activité
          </h4>
          <div className="text-violet-700 text-sm space-y-1">
            <p>• <strong>Événements du registre</strong> (fond gris, bordure violette) : Actions automatiques, permanentes et immuables</p>
            <p>• <strong>Messages des utilisateurs</strong> (fond blanc) : Discussions sociales avec likes et commentaires</p>
            <p>• L'historique est chronologique et préserve la vérité du groupe</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupActivityFeed;