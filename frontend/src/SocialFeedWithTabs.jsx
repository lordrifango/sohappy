import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import GroupActivityFeed from './GroupActivityFeed';

// Composant pour l'onglet Discussions - Liste des groupes
const DiscussionsTab = ({ tontines, onGroupClick }) => {
  const { t } = useTranslation();

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">💬</span>
        Discussions par Groupe
      </h3>
      
      <div className="space-y-3">
        {tontines.map(tontine => (
          <div 
            key={tontine.id}
            onClick={() => onGroupClick(tontine)}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                {/* Avatar du groupe */}
                <div className={`w-12 h-12 ${tontine.color} rounded-full flex items-center justify-center text-white font-bold`}>
                  {tontine.name.substring(0, 2)}
                </div>
                
                {/* Informations du groupe */}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 text-lg">{tontine.fullName}</h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">👥</span> {tontine.membersCount} membres
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">💰</span> {tontine.amount} {tontine.currency}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                      💬 Discussion active
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700 border border-violet-200">
                      📋 Registre complet
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Flèche d'indication */}
              <div className="flex flex-col items-end space-y-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className="w-3 h-3 bg-violet-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tontines.length === 0 && (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Aucun groupe pour le moment</h3>
          <p className="text-gray-600">Créez votre premier groupe pour commencer les discussions !</p>
        </div>
      )}
    </div>
  );
};

// Composant pour l'onglet Communauté - Feed général
const CommunityTab = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Feed de la communauté avec des événements généraux
  const mockCommunityData = [
    {
      id: 1,
      type: 'success',
      user: 'Groupe TFK',
      avatar: 'TFK',
      color: 'bg-green-500',
      title: 'Objectif atteint ! 🎉',
      description: 'Le groupe TFK a atteint son objectif mensuel ! Félicitations à tous les membres !',
      time: '2h'
    },
    {
      id: 2,
      type: 'welcome',
      user: 'Moussa C.',
      avatar: 'MC',
      color: 'bg-blue-500',
      title: 'Nouveau membre !',
      description: 'Bienvenue à Moussa qui a rejoint le groupe GAA ! 👋',
      time: '4h'
    },
    {
      id: 3,
      type: 'milestone',
      user: 'Groupe ÉQB',
      avatar: 'ÉQB',
      color: 'bg-purple-500',
      title: 'Étape importante franchie',
      description: 'Le groupe ÉQB a franchi les 75% de son objectif trimestriel ! 🎯',
      time: '1j'
    },
    {
      id: 4,
      type: 'achievement',
      user: 'Aminata K.',
      avatar: 'AK',
      color: 'bg-orange-500',
      title: 'Contribution régulière',
      description: 'Aminata maintient sa régularité depuis 6 mois ! Bravo ! 🏆',
      time: '2j'
    }
  ];

  return (
    <div className="p-4">
      {/* Barre de recherche */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher dans la communauté..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Feed d'Activité de la Communauté */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center text-lg">
          🌟 Feed d'Activité de la Communauté
        </h3>
        <div className="space-y-3">
          {mockCommunityData.map(activity => (
            <div key={activity.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className={`w-12 h-12 ${activity.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                  {activity.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-gray-800">{activity.user}</h4>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                  <h5 className="font-medium text-gray-700 mb-1">{activity.title}</h5>
                  <p className="text-gray-600 text-sm leading-relaxed">{activity.description}</p>
                  
                  {/* Actions d'interaction */}
                  <div className="flex items-center space-x-4 mt-3">
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-violet-500 text-sm transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>J'aime</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-violet-500 text-sm transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Commenter</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section d'encouragement */}
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl p-6 border border-violet-200 mt-6">
        <div className="text-center">
          <h4 className="font-semibold text-violet-800 mb-2">💫 Participez à la communauté !</h4>
          <p className="text-violet-600 text-sm mb-4">
            Partagez vos succès, encouragez vos amis et célébrez ensemble les objectifs atteints.
          </p>
          <button className="bg-violet-500 text-white px-6 py-2 rounded-xl hover:bg-violet-600 transition-colors">
            Créer une publication
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant principal avec les deux onglets
const SocialFeedWithTabs = ({ tontines, sessionId }) => {
  const [activeSubTab, setActiveSubTab] = useState('discussions');
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
  };

  const handleBackToDiscussions = () => {
    setSelectedGroup(null);
  };

  // Si un groupe est sélectionné, afficher le GroupActivityFeed
  if (selectedGroup) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header avec retour */}
        <div className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white p-4">
          <div className="flex items-center space-x-3 mb-2">
            <button 
              onClick={handleBackToDiscussions}
              className="hover:bg-white hover:bg-opacity-10 p-1 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm opacity-90">Retour aux discussions</span>
          </div>
          <h1 className="text-2xl font-bold">{selectedGroup.fullName}</h1>
          <p className="opacity-90 text-sm">
            👥 {selectedGroup.membersCount} membres • 💰 {selectedGroup.amount} {selectedGroup.currency}
          </p>
        </div>

        {/* GroupActivityFeed pour le groupe sélectionné */}
        <GroupActivityFeed 
          groupId={selectedGroup.id} 
          sessionId={sessionId}
          isEmbedded={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header principal */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <h1 className="text-2xl font-bold">Tonty Network</h1>
        <p className="opacity-90">Restez connecté avec votre communauté</p>
      </div>

      {/* Navigation entre les deux onglets */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeSubTab === 'discussions'
                ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveSubTab('discussions')}
          >
            💬 Discussions
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeSubTab === 'community'
                ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveSubTab('community')}
          >
            🌟 Communauté
          </button>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div>
        {activeSubTab === 'discussions' ? (
          <DiscussionsTab 
            tontines={tontines} 
            onGroupClick={handleGroupClick}
          />
        ) : (
          <CommunityTab />
        )}
      </div>
    </div>
  );
};

export default SocialFeedWithTabs;