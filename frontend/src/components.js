import React, { useState, useEffect } from 'react';

// Header Component
export const Header = ({ notifications, onNotificationClick }) => (
  <header className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 shadow-lg">
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-bold">Tonty</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button 
            onClick={onNotificationClick}
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-colors"
          >
            <BellIcon className="w-6 h-6" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {notifications}
              </span>
            )}
          </button>
        </div>
        <div className="flex items-center space-x-2 bg-orange-500 px-3 py-1 rounded-full text-sm">
          <UserIcon className="w-4 h-4" />
          <span>Utilisateur</span>
          <span className="bg-red-500 px-2 py-0.5 rounded-full text-xs">DEMO</span>
        </div>
      </div>
    </div>
  </header>
);

// Dashboard Component
export const Dashboard = ({ tontines, onTontineSelect, currency, onCurrencyToggle, onMembersClick, onUpcomingToursClick, onDepositClick, onWithdrawClick }) => {
  const totalBalance = "1 000 000";
  const activeTontines = tontines.length;
  const connectedMembers = 24;
  const upcomingTours = 21;
  const maxTontines = 10;
  const progressPercentage = (activeTontines / maxTontines) * 100;

  const getCurrencySymbol = () => {
    switch(currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      default: return 'FCFA';
    }
  };

  const getCurrencyValue = () => {
    switch(currency) {
      case 'USD': return '1 650'; // Conversion approximative
      case 'EUR': return '1 524'; // Conversion approximative
      default: return totalBalance;
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Balance Section */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
        <div className="text-right mb-2">
          <button 
            onClick={onCurrencyToggle}
            className="text-sm opacity-90 hover:opacity-100 bg-white bg-opacity-10 px-2 py-1 rounded-full transition-all"
          >
            {getCurrencySymbol()}
          </button>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-medium opacity-90">Solde réel</h2>
          <h1 className="text-3xl font-bold">{getCurrencyValue()} {getCurrencySymbol()}</h1>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm opacity-90">Tontines actives</p>
            <p className="text-xl font-bold">{activeTontines}</p>
          </div>
          <div>
            <button onClick={onMembersClick} className="text-left hover:bg-white hover:bg-opacity-10 p-2 rounded transition-all">
              <p className="text-sm opacity-90">Membres connectés</p>
              <p className="text-xl font-bold">{connectedMembers}</p>
            </button>
          </div>
          <div>
            <button onClick={onUpcomingToursClick} className="text-left hover:bg-white hover:bg-opacity-10 p-2 rounded transition-all">
              <p className="text-sm opacity-90">Mes tours à venir</p>
              <p className="text-xl font-bold">{upcomingTours}</p>
            </button>
          </div>
        </div>
        
        <div className="bg-white bg-opacity-10 rounded-lg p-3 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">Tontines actives</span>
            <span className="text-sm">{activeTontines}/{maxTontines}</span>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="text-right">
          <button className="text-sm underline opacity-90 hover:opacity-100">
            Voir tableau de bord détaillé →
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button 
          onClick={onDepositClick}
          className="flex-1 bg-emerald-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-emerald-600 transition-colors shadow-lg btn-press"
        >
          + Déposer
        </button>
        <button 
          onClick={onWithdrawClick}
          className="flex-1 border-2 border-emerald-500 text-emerald-600 py-3 px-6 rounded-xl font-medium hover:bg-emerald-50 transition-colors btn-press"
        >
          ↓ Retirer
        </button>
      </div>

      <div className="text-center">
        <button className="text-emerald-600 text-sm hover:underline">
          Voir les tontines à thèmes
        </button>
      </div>

      {/* Tontines List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Mes Tontines</h3>
          <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">
            + Nouvelle tontine
          </button>
        </div>
        
        <div className="space-y-4">
          {tontines.map((tontine) => (
            <TontineCard 
              key={tontine.id} 
              tontine={tontine} 
              onClick={() => onTontineSelect(tontine)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Tontine Card Component
export const TontineCard = ({ tontine, onClick }) => (
  <div 
    className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-all cursor-pointer border border-gray-100"
    onClick={onClick}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center space-x-3">
        <div className={`w-12 h-12 ${tontine.color} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
          {tontine.name.substring(0, 2)}
        </div>
        <div>
          <h4 className="font-semibold text-gray-800">{tontine.fullName}</h4>
          <p className="text-sm text-gray-500">{tontine.membersCount} membres</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-500">Prochain paiement: {tontine.nextPayment}</p>
        <p className="text-lg font-bold text-gray-800">{tontine.amount} {tontine.currency}</p>
      </div>
    </div>
    
    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
      <span className="flex items-center">
        <CalendarIcon className="w-4 h-4 mr-1" />
        Du {tontine.startDate}
      </span>
      <span className="flex items-center">
        <CalendarIcon className="w-4 h-4 mr-1" />
        Au {tontine.endDate}
      </span>
    </div>
    
    <div className="mb-3">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{tontine.remaining}</span>
        <span>{tontine.progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${tontine.progress}%` }}
        ></div>
      </div>
    </div>
    
    <div className="flex justify-between items-center">
      <span className="text-sm text-emerald-600 font-medium">
        C'est votre tour de recevoir le pot !
      </span>
      <button className="text-emerald-600 text-sm hover:underline">
        👥 Voir les members
      </button>
    </div>
  </div>
);

// Members List Component
export const MembersList = ({ tontine, members, onBack }) => (
  <div className="min-h-screen bg-gray-50">
    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4">
      <div className="flex items-center space-x-3 mb-2">
        <button onClick={onBack} className="hover:bg-white hover:bg-opacity-10 p-1 rounded">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <span>Retour</span>
      </div>
      <h1 className="text-2xl font-bold">{tontine.fullName}</h1>
      <p className="opacity-90">🧑‍🤝‍🧑 {tontine.membersCount} membres</p>
    </div>
    
    <div className="p-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Administrateur</h3>
        {members.filter(member => member.role === 'Administrateur').map(member => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Membres</h3>
          <button className="text-sm text-gray-500 hover:text-gray-700">
            ❓ Comprendre les badges et niveaux
          </button>
        </div>
        {members.filter(member => member.role === 'Membre').map(member => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  </div>
);

// Member Card Component
const MemberCard = ({ member }) => (
  <div className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`w-12 h-12 ${member.color} rounded-full flex items-center justify-center text-white font-bold`}>
          {member.avatar}
        </div>
        <div>
          <h4 className="font-semibold text-gray-800">{member.name}</h4>
          <p className="text-sm text-gray-500">{member.role === 'Administrateur' ? 'Administrateur' : 'Membre'}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {member.badges.map((badge, index) => (
              <span key={index} className={`text-xs px-2 py-0.5 rounded-full ${
                badge === 'Digne de confiance' ? 'bg-blue-100 text-blue-800' :
                badge === 'Principal' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-sm font-medium ${
          member.status === 'Actif' ? 'text-green-600' :
          member.status === 'En retard' ? 'text-red-600' :
          member.status === 'Excusé' ? 'text-yellow-600' :
          'text-gray-600'
        }`}>
          {member.status}
        </div>
        <button className="text-emerald-600 text-sm hover:underline mt-1">
          Admin
        </button>
      </div>
    </div>
  </div>
);

// Social Feed Component
export const SocialFeed = ({ tontines }) => {
  const [activeSubTab, setActiveSubTab] = useState('discussions');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <h1 className="text-2xl font-bold">Réseau Tonty</h1>
        <p className="opacity-90">Restez connecté avec votre communauté</p>
      </div>

      {/* Sub Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeSubTab === 'discussions'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveSubTab('discussions')}
          >
            💬 Discussions
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeSubTab === 'community'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveSubTab('community')}
          >
            👥 Communauté
          </button>
        </div>
      </div>

      <div className="p-4">
        {activeSubTab === 'discussions' ? <DiscussionsTab tontines={tontines} /> : <CommunityTab />}
      </div>
    </div>
  );
};

// Discussions Tab
const DiscussionsTab = () => {
  const mockDiscussions = [
    {
      id: 1,
      author: 'Mariam K.',
      avatar: 'MK',
      color: 'bg-red-500',
      time: '2h',
      tontine: 'TFK',
      message: 'Bonjour tout le monde ! N\'oubliez pas le versement de demain 💰',
      likes: 5,
      replies: 2
    },
    {
      id: 2,
      author: 'Fatou D.',
      avatar: 'FD',
      color: 'bg-blue-500',
      time: '4h',
      tontine: 'GAA',
      message: 'Félicitations à Aminata pour avoir reçu son tour ! 🎉🎊',
      likes: 12,
      replies: 8
    },
    {
      id: 3,
      author: 'Ibrahim T.',
      avatar: 'IT',
      color: 'bg-green-500',
      time: '1j',
      tontine: 'ÉQB',
      message: 'Question: peut-on modifier le montant pour le prochain cycle ?',
      likes: 3,
      replies: 15
    }
  ];

  return (
    <div className="space-y-4">
      {/* Create Post */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
            ME
          </div>
          <input 
            type="text" 
            placeholder="Partagez quelque chose avec votre communauté..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex space-x-4 text-gray-500">
            <button className="flex items-center space-x-1 text-sm hover:text-blue-600">
              📷 <span>Photo</span>
            </button>
            <button className="flex items-center space-x-1 text-sm hover:text-blue-600">
              📊 <span>Sondage</span>
            </button>
          </div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-600">
            Publier
          </button>
        </div>
      </div>

      {/* Discussions List */}
      {mockDiscussions.map(discussion => (
        <div key={discussion.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start space-x-3">
            <div className={`w-10 h-10 ${discussion.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
              {discussion.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-gray-800">{discussion.author}</h4>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">{discussion.time}</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full">
                  {discussion.tontine}
                </span>
              </div>
              <p className="text-gray-700 mb-3">{discussion.message}</p>
              <div className="flex items-center space-x-6">
                <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 text-sm">
                  <HeartIcon className="w-4 h-4" />
                  <span>{discussion.likes}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 text-sm">
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  <span>{discussion.replies}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 text-sm">
                  <ShareIcon className="w-4 h-4" />
                  <span>Partager</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Community Tab
const CommunityTab = () => {
  const mockCommunityData = [
    {
      id: 1,
      type: 'achievement',
      user: 'Aminata K.',
      avatar: 'AK',
      color: 'bg-yellow-500',
      title: 'Nouveau Badge obtenu !',
      description: 'A obtenu le badge "Contributeur Régulier" 🏆',
      time: '1h'
    },
    {
      id: 2,
      type: 'milestone',
      user: 'Tontine FCB',
      avatar: 'FCB',
      color: 'bg-purple-500',
      title: 'Objectif atteint !',
      description: '50% de l\'objectif mensuel atteint 🎯',
      time: '3h'
    },
    {
      id: 3,
      type: 'welcome',
      user: 'Moussa C.',
      avatar: 'MC',
      color: 'bg-green-500',
      title: 'Nouveau membre !',
      description: 'A rejoint la tontine TFK - Souhaitons lui la bienvenue ! 👋',
      time: '1j'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Community Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-emerald-600">156</div>
          <div className="text-sm text-gray-600">Membres actifs</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">23</div>
          <div className="text-sm text-gray-600">Tontines actives</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-purple-600">89%</div>
          <div className="text-sm text-gray-600">Taux de réussite</div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          🏆 Classement de la semaine
        </h3>
        <div className="space-y-3">
          {['Mariam K. - 850 pts', 'Fatou D. - 720 pts', 'Ibrahim T. - 680 pts'].map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                } rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                  {index + 1}
                </div>
                <span className="text-gray-700">{item}</span>
              </div>
              {index === 0 && <span className="text-yellow-500">👑</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Community Activity */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Activité de la communauté</h3>
        {mockCommunityData.map(activity => (
          <div key={activity.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 ${activity.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                {activity.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold text-gray-800">{activity.user}</h4>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
                <h5 className="font-medium text-gray-700 mb-1">{activity.title}</h5>
                <p className="text-gray-600 text-sm">{activity.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Bottom Navigation Component
export const BottomNavigation = ({ activeTab, onTabChange }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 shadow-lg">
    <div className="flex justify-around items-center">
      <button
        className={`flex flex-col items-center p-2 ${
          activeTab === 'dashboard' ? 'text-emerald-600' : 'text-gray-500'
        }`}
        onClick={() => onTabChange('dashboard')}
      >
        <HomeIcon className="w-6 h-6" />
        <span className="text-xs mt-1">Mes Tontines</span>
      </button>
      
      <button
        className={`flex flex-col items-center p-2 ${
          activeTab === 'social' ? 'text-emerald-600' : 'text-gray-500'
        }`}
        onClick={() => onTabChange('social')}
      >
        <UsersIcon className="w-6 h-6" />
        <span className="text-xs mt-1">Réseau Social</span>
      </button>
    </div>
  </div>
);

// Floating Action Button Component
export const FloatingActionButton = ({ onCreateTontine, onAddContact, onSupport }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Action Options */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3 animate-fade-in">
          <button
            onClick={() => {
              onCreateTontine();
              setIsOpen(false);
            }}
            className="flex items-center justify-end space-x-3 bg-blue-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-600 transition-all transform hover:scale-105"
          >
            <span className="text-sm font-medium">Créer une tontine</span>
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              🏛️
            </div>
          </button>
          
          <button
            onClick={() => {
              onAddContact();
              setIsOpen(false);
            }}
            className="flex items-center justify-end space-x-3 bg-purple-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-purple-600 transition-all transform hover:scale-105"
          >
            <span className="text-sm font-medium">Ajouter un contact</span>
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              👥
            </div>
          </button>
          
          <button
            onClick={() => {
              onSupport();
              setIsOpen(false);
            }}
            className="flex items-center justify-end space-x-3 bg-orange-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-orange-600 transition-all transform hover:scale-105"
          >
            <span className="text-sm font-medium">Contacter le support</span>
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              📞
            </div>
          </button>
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-all transform hover:scale-110 flex items-center justify-center ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
      >
        <PlusIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

// Create Tontine Modal Component
export const CreateTontineModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    frequency: 'monthly',
    duration: '',
    startDate: '',
    members: []
  });

  if (!isOpen) return null;

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Créer une Tontine</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="mt-2">
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full ${
                    s <= step ? 'bg-white' : 'bg-white bg-opacity-30'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm mt-2 opacity-90">Étape {step} sur 4</p>
          </div>
        </div>

        <div className="p-6">
          {step === 1 && <CreateTontineStep1 formData={formData} setFormData={setFormData} />}
          {step === 2 && <CreateTontineStep2 formData={formData} setFormData={setFormData} />}
          {step === 3 && <CreateTontineStep3 formData={formData} setFormData={setFormData} />}
          {step === 4 && <CreateTontineStep4 formData={formData} setFormData={setFormData} />}
        </div>

        <div className="flex justify-between p-6 border-t border-gray-200">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Précédent
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 ml-auto"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={() => {
                // Handle tontine creation
                onClose();
                setStep(1);
              }}
              className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 ml-auto"
            >
              Créer la Tontine
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Create Tontine Steps
const CreateTontineStep1 = ({ formData, setFormData }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-800">Informations de base</h3>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la tontine</label>
      <input
        type="text"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        placeholder="Ex: Tontine Famille Konaté"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Description (optionnel)</label>
      <textarea
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        rows={3}
        placeholder="Décrivez l'objectif de votre tontine..."
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
      />
    </div>
  </div>
);

const CreateTontineStep2 = ({ formData, setFormData }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-800">Paramètres financiers</h3>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Montant par tour (FCFA)</label>
      <input
        type="number"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        placeholder="250000"
        value={formData.amount}
        onChange={(e) => setFormData({...formData, amount: e.target.value})}
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Fréquence des versements</label>
      <select
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        value={formData.frequency}
        onChange={(e) => setFormData({...formData, frequency: e.target.value})}
      >
        <option value="weekly">Hebdomadaire</option>
        <option value="monthly">Mensuel</option>
        <option value="quarterly">Trimestriel</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Durée (nombre de tours)</label>
      <input
        type="number"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        placeholder="12"
        value={formData.duration}
        onChange={(e) => setFormData({...formData, duration: e.target.value})}
      />
    </div>
  </div>
);

const CreateTontineStep3 = ({ formData, setFormData }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-800">Date de début</h3>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Première collecte</label>
      <input
        type="date"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        value={formData.startDate}
        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
      />
    </div>
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-medium text-blue-800 mb-2">💡 Conseil</h4>
      <p className="text-sm text-blue-600">
        Choisissez une date qui convient à tous les membres. Vous pourrez toujours la modifier avant le lancement.
      </p>
    </div>
  </div>
);

const CreateTontineStep4 = ({ formData, setFormData }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-800">Récapitulatif</h3>
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <div className="flex justify-between">
        <span className="text-gray-600">Nom:</span>
        <span className="font-medium">{formData.name || 'Non défini'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Montant:</span>
        <span className="font-medium">{formData.amount ? `${formData.amount} FCFA` : 'Non défini'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Fréquence:</span>
        <span className="font-medium">
          {formData.frequency === 'weekly' ? 'Hebdomadaire' : 
           formData.frequency === 'monthly' ? 'Mensuel' : 'Trimestriel'}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Durée:</span>
        <span className="font-medium">{formData.duration || 'Non défini'} tours</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Début:</span>
        <span className="font-medium">{formData.startDate || 'Non défini'}</span>
      </div>
    </div>
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
      <h4 className="font-medium text-emerald-800 mb-2">🎉 Prêt à créer !</h4>
      <p className="text-sm text-emerald-600">
        Votre tontine sera créée et vous pourrez ensuite inviter des membres.
      </p>
    </div>
  </div>
);

// Add Contact Modal Component
export const AddContactModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('search');

  const mockContacts = [
    { id: 1, name: 'Amadou Diallo', phone: '+225 07 12 34 56 78', avatar: 'AD', color: 'bg-blue-500', mutual: 3 },
    { id: 2, name: 'Awa Traoré', phone: '+225 05 98 76 54 32', avatar: 'AT', color: 'bg-pink-500', mutual: 7 },
    { id: 3, name: 'Boubacar Koné', phone: '+225 01 23 45 67 89', avatar: 'BK', color: 'bg-green-500', mutual: 1 }
  ];

  const handleSearch = () => {
    if (searchQuery.length > 0) {
      setSearchResults(mockContacts.filter(contact => 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone.includes(searchQuery)
      ));
    } else {
      setSearchResults([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Ajouter un contact</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === 'search' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('search')}
            >
              🔍 Rechercher
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === 'invite' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('invite')}
            >
              📱 Inviter
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'search' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher par nom ou numéro Tonty
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nom ou +225 XX XX XX XX XX"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    🔍
                  </button>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-800">Résultats de recherche</h3>
                  {searchResults.map(contact => (
                    <div key={contact.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${contact.color} rounded-full flex items-center justify-center text-white font-bold`}>
                          {contact.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{contact.name}</p>
                          <p className="text-sm text-gray-500">{contact.phone}</p>
                          <p className="text-xs text-gray-400">{contact.mutual} amis en commun</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm hover:bg-purple-600">
                        Ajouter
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="+225 XX XX XX XX XX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message d'invitation (optionnel)
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Salut ! Je t'invite à rejoindre Tonty pour gérer nos tontines ensemble..."
                />
              </div>

              <button className="w-full bg-purple-500 text-white py-3 rounded-lg font-medium hover:bg-purple-600">
                📤 Envoyer l'invitation
              </button>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-800 mb-2">💡 Comment ça marche ?</h4>
                <p className="text-sm text-purple-600">
                  Votre ami recevra un SMS avec un lien pour télécharger Tonty et rejoindre votre réseau.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Support Modal Component
export const SupportModal = ({ isOpen, onClose }) => {
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Contacter le support</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="mt-2 opacity-90">Nous sommes là pour vous aider !</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Sélectionnez une catégorie</option>
              <option value="technical">Problème technique</option>
              <option value="account">Gestion de compte</option>
              <option value="payment">Problème de paiement</option>
              <option value="tontine">Question sur les tontines</option>
              <option value="suggestion">Suggestion d'amélioration</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Votre message
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={5}
              placeholder="Décrivez votre problème ou votre question en détail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-2">📞 Autres moyens de contact</h4>
            <div className="space-y-2 text-sm text-orange-600">
              <p>📧 Email: support@tonty.app</p>
              <p>📱 WhatsApp: +225 XX XX XX XX XX</p>
              <p>⏰ Horaires: Lun-Ven 8h-18h</p>
            </div>
          </div>

          <button 
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
            disabled={!category || !message}
            onClick={() => {
              // Handle support message
              onClose();
              setCategory('');
              setMessage('');
            }}
          >
            📤 Envoyer le message
          </button>
        </div>
      </div>
    </div>
  );
};

// Icon Components (using simple SVG representations)
const BellIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CalendarIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ArrowLeftIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const HomeIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const UsersIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const XMarkIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const HeartIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const ChatBubbleLeftIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ShareIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
);