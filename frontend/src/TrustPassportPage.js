import React from 'react';
import { useProfile } from './ProfileContext';

const TrustPassportPage = ({ sessionId, onClose, onEditProfile }) => {
  const { profile } = useProfile();

  if (!profile) {
    return null;
  }

  // Calculate days since joining (for new users, show "aujourd'hui")
  const joinDate = new Date(profile.created_at);
  const today = new Date();
  const daysSinceJoining = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24));
  
  let memberSinceText = '';
  if (daysSinceJoining === 0) {
    memberSinceText = "aujourd'hui";
  } else if (daysSinceJoining === 1) {
    memberSinceText = "hier";
  } else if (daysSinceJoining < 30) {
    memberSinceText = `${daysSinceJoining} jours`;
  } else if (daysSinceJoining < 365) {
    const months = Math.floor(daysSinceJoining / 30);
    memberSinceText = `${months} mois`;
  } else {
    memberSinceText = joinDate.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long' 
    });
  }

  // Mock data - in a real app, this would come from user's actual activity
  const trustMetrics = {
    reliability: {
      percentage: daysSinceJoining > 0 ? 100 : 0,
      paymentsOnTime: daysSinceJoining > 0 ? 14 : 0,
      totalPayments: daysSinceJoining > 0 ? 14 : 0
    },
    engagement: {
      completedTontines: daysSinceJoining > 30 ? 3 : 0,
      currentGroups: daysSinceJoining > 7 ? 4 : 0
    },
    network: {
      totalMembers: daysSinceJoining > 14 ? 24 : 0,
      connections: daysSinceJoining > 7 ? 3 : 0
    }
  };

  // Available badges with unlock conditions
  const badges = [
    {
      id: 'pioneer',
      name: 'Pionnier',
      description: 'Premier membre de la communauté',
      icon: '🚀',
      unlocked: daysSinceJoining >= 0, // Always unlocked for early adopters
      unlockCondition: 'Rejoindre Tonty'
    },
    {
      id: 'lightning_payer',
      name: 'Payeur Éclair',
      description: 'Toujours à l\'heure dans les paiements',
      icon: '⚡',
      unlocked: trustMetrics.reliability.percentage === 100 && trustMetrics.reliability.totalPayments > 0,
      unlockCondition: 'Maintenir 100% de paiements à l\'heure'
    },
    {
      id: 'community_leader',
      name: 'Leader de Communauté',
      description: 'Influence positive dans plusieurs groupes',
      icon: '👑',
      unlocked: trustMetrics.engagement.completedTontines >= 3 && trustMetrics.network.totalMembers >= 20,
      unlockCondition: 'Terminer 3 tontines et connecter 20+ membres'
    },
    {
      id: 'trusted_member',
      name: 'Membre de Confiance',
      description: 'Reconnu pour sa fiabilité',
      icon: '🛡️',
      unlocked: trustMetrics.reliability.percentage >= 95 && trustMetrics.reliability.totalPayments >= 10,
      unlockCondition: 'Maintenir 95%+ de fiabilité sur 10+ paiements'
    },
    {
      id: 'network_builder',
      name: 'Bâtisseur de Réseau',
      description: 'Excellent dans l\'expansion du réseau',
      icon: '🌐',
      unlocked: trustMetrics.network.totalMembers >= 50,
      unlockCondition: 'Connecter 50+ membres dans votre réseau'
    },
    {
      id: 'commitment_champion',
      name: 'Champion d\'Engagement',
      description: 'Fidèle à ses engagements',
      icon: '🏆',
      unlocked: trustMetrics.engagement.completedTontines >= 5,
      unlockCondition: 'Terminer 5 tontines avec succès'
    }
  ];

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white">
          <div className="max-w-2xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Mon Passeport de Confiance</h1>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Profile Header */}
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-white/20 border-4 border-white/30">
                {profile.avatar_base64 ? (
                  <img src={profile.avatar_base64} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-3xl font-bold">{profile.first_name} {profile.last_name}</h2>
                <p className="text-white/80 text-lg">Membre de Tonty depuis {memberSinceText}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Bilan de Confiance */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Votre Bilan de Confiance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Fiabilité */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-800">Fiabilité</h4>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {trustMetrics.reliability.percentage}%
                </div>
                <p className="text-gray-600 text-sm">
                  {trustMetrics.reliability.paymentsOnTime}/{trustMetrics.reliability.totalPayments} cotisations versées à temps
                </p>
              </div>

              {/* Engagement */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-800">Engagement</h4>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {trustMetrics.engagement.completedTontines}
                </div>
                <p className="text-gray-600 text-sm">
                  Tontines terminées • Engagé dans {trustMetrics.engagement.currentGroups} groupes actuellement
                </p>
              </div>

              {/* Réseau */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-800">Réseau</h4>
                  </div>
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {trustMetrics.network.totalMembers}
                </div>
                <p className="text-gray-600 text-sm">
                  Membres dans votre réseau • Connecté via vos différents groupes
                </p>
              </div>
            </div>
          </div>

          {/* Badges & Réalisations */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Vos Badges</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    badge.unlocked
                      ? 'border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  title={badge.unlocked ? badge.description : `${badge.description} - ${badge.unlockCondition}`}
                >
                  <div className="text-center">
                    <div className={`text-4xl mb-2 ${badge.unlocked ? '' : 'grayscale opacity-50'}`}>
                      {badge.icon}
                    </div>
                    <h4 className={`font-semibold text-sm ${badge.unlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                      {badge.name}
                    </h4>
                  </div>
                  {!badge.unlocked && (
                    <div className="absolute inset-0 bg-gray-200/50 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m8-9a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center">
            <button
              onClick={onEditProfile}
              className="bg-violet-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-violet-600 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Modifier mes informations</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustPassportPage;