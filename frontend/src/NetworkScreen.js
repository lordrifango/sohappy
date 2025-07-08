import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStreamClient } from './StreamContext';
import { Chat, Channel, ChannelList, MessageList, MessageInput, Thread, Window } from 'stream-chat-react';
import UserSearchModal from './UserSearchModal';
import ContactsList from './ContactsList';
import 'stream-chat-react/dist/css/v2/index.css';

// Composant Avatar pour les membres
const Avatar = ({ avatarUrl, initials, size = "w-12 h-12" }) => {
  if (avatarUrl) {
    return (
      <img 
        src={avatarUrl} 
        alt="Avatar" 
        className={`${size} rounded-full object-cover border-2 border-gray-200`}
      />
    );
  }
  
  return (
    <div className={`${size} rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-bold text-sm border-2 border-gray-200`}>
      {initials}
    </div>
  );
};

// Composant NetworkMemberCard - Le cœur de la fonctionnalité
const NetworkMemberCard = ({ member, onInvite, onCreateGroup, onViewConnection }) => {
  return (
    <div 
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
      onClick={() => onViewConnection && onViewConnection(member)}
    >
      <div className="flex items-center space-x-4">
        {/* Avatar à gauche */}
        <Avatar 
          avatarUrl={member.avatarUrl} 
          initials={member.initials}
          size="w-16 h-16"
        />
        
        {/* Informations centrales (flex-grow) */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 text-lg truncate">
            {member.fullName}
          </h4>
          {/* La Ligne Magique - Lien de Confiance */}
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-gray-400">🔗</span>
            <p className="text-gray-500 text-sm leading-relaxed">
              {member.trustLink}
            </p>
          </div>
          
          {/* Informations supplémentaires */}
          {member.memberSince && (
            <p className="text-xs text-gray-400 mt-1">
              Membre depuis {member.memberSince}
            </p>
          )}
        </div>
        
        {/* Actions à droite */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInvite && onInvite(member);
            }}
            className="bg-violet-50 hover:bg-violet-100 text-violet-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
          >
            <span>+</span>
            <span>Inviter</span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateGroup && onCreateGroup(member);
            }}
            className="bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Créer groupe
          </button>
        </div>
      </div>
    </div>
  );
};

// Page principale du Réseau de Confiance
const NetworkScreen = () => {
  const navigate = useNavigate();
  
  // États pour les données et l'interface
  const [members, setMembers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [activeNetworkTab, setActiveNetworkTab] = useState('membres');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour le chat
  const [channelsLoading, setChannelsLoading] = useState(true);
  
  // États pour les nouvelles fonctionnalités
  const [isUserSearchModalOpen, setIsUserSearchModalOpen] = useState(false);
  const [isContactsListOpen, setIsContactsListOpen] = useState(false);
  
  // Hook GetStream
  const { 
    chatClient, 
    streamToken, 
    isConnecting, 
    createTontineChannel, 
    createDirectChannel, 
    getUserChannels 
  } = useStreamClient();

  // Mock data - Dans un vrai projet, cela viendrait de l'API
  const mockNetworkData = [
    {
      id: "usr_001",
      avatarUrl: null,
      initials: "MK",
      fullName: "Mariam Konaté",
      trustLink: "Membre de la Tontine Familiale Konaté avec vous.",
      memberSince: "Février 2025",
      commonTontines: ["TFK"],
      collaborationDuration: "2 ans"
    },
    {
      id: "usr_002", 
      avatarUrl: null,
      initials: "AK",
      fullName: "Aminata Koné",
      trustLink: "Vous avez participé à 2 projets ensemble.",
      memberSince: "Mars 2025",
      commonTontines: ["TFK", "GAA"],
      collaborationDuration: "1 an 8 mois"
    },
    {
      id: "usr_003",
      avatarUrl: null,
      initials: "FD", 
      fullName: "Fatou Diallo",
      trustLink: "Lien via Moussa C. dans le Groupe Amis Abidjan.",
      memberSince: "Janvier 2025",
      commonTontines: ["GAA"],
      collaborationDuration: "10 mois"
    },
    {
      id: "usr_004",
      avatarUrl: null,
      initials: "IT",
      fullName: "Ibrahim Touré",
      trustLink: "Membre de votre réseau depuis Février 2025.",
      memberSince: "Février 2025",
      commonTontines: ["ÉQB"],
      collaborationDuration: "11 mois"
    },
    {
      id: "usr_005",
      avatarUrl: null,
      initials: "MC",
      fullName: "Moussa Camara",
      trustLink: "Co-fondateur de 3 tontines avec vous.",
      memberSince: "Janvier 2025",
      commonTontines: ["TFK", "GAA", "ÉQB"],
      collaborationDuration: "2 ans 1 mois"
    },
    {
      id: "usr_006",
      avatarUrl: null,
      initials: "SS",
      fullName: "Sekou Sylla",
      trustLink: "Vous vous êtes entraidés dans des moments difficiles.",
      memberSince: "Avril 2025",
      commonTontines: ["TFK"],
      collaborationDuration: "8 mois"
    },
    {
      id: "usr_007",
      avatarUrl: null,
      initials: "KB",
      fullName: "Kadiatou Bah",
      trustLink: "Partenaire fiable dans vos épargnes communes.",
      memberSince: "Mai 2025",
      commonTontines: ["GAA"],
      collaborationDuration: "7 mois"
    },
    {
      id: "usr_008",
      avatarUrl: null,
      initials: "OB",
      fullName: "Oumar Barry",
      trustLink: "Connexion via le réseau de Mariam K.",
      memberSince: "Juin 2025",
      commonTontines: ["ÉQB"],
      collaborationDuration: "6 mois"
    }
  ];

  // Simulation de chargement de données
  useEffect(() => {
    const loadNetworkData = async () => {
      try {
        setLoading(true);
        // Simule un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMembers(mockNetworkData);
      } catch (err) {
        setError("Erreur lors du chargement du réseau");
      } finally {
        setLoading(false);
      }
    };

    loadNetworkData();
  }, []);

  // Charger les canaux GetStream
  useEffect(() => {
    const loadChannels = async () => {
      if (!chatClient || !streamToken || isConnecting) return;
      
      try {
        setChannelsLoading(true);
        const userChannels = await getUserChannels();
        setChannels(userChannels);
      } catch (error) {
        console.error('Erreur lors du chargement des canaux:', error);
      } finally {
        setChannelsLoading(false);
      }
    };

    loadChannels();
  }, [chatClient, streamToken, isConnecting, getUserChannels]);

  // Filtrage en temps réel
  const filteredMembers = members.filter(member => 
    member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.trustLink.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers pour les actions
  const handleInvite = (member) => {
    alert(`Invitation envoyée à ${member.fullName}`);
  };

  const handleCreateGroup = (member) => {
    alert(`Création d'un nouveau groupe avec ${member.fullName}`);
  };

  const handleViewConnection = (member) => {
    // Navigation vers la vue "Notre Lien" 
    navigate(`/network/connection/${member.id}`, { state: { member } });
  };

  const handleBack = () => {
    navigate('/');
  };

  // Composant pour l'onglet Discussions
  const DiscussionsTab = () => {
    const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
    
    if (isConnecting || channelsLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des discussions...</p>
          </div>
        </div>
      );
    }

    if (!chatClient) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-600">Impossible de se connecter au chat</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    const customFilters = { 
      type: 'team', 
      members: { $in: [streamToken.user_id] } 
    };
    const sort = { last_message_at: -1 };

    const handleCreateTestChannel = async () => {
      try {
        const testChannelId = `test_${Date.now()}`;
        const testChannelName = `Test Discussion ${Date.now()}`;
        
        await createTontineChannel(testChannelId, testChannelName, []);
        
        // Recharger les canaux
        const userChannels = await getUserChannels();
        setChannels(userChannels);
        
        alert('✅ Canal de test créé avec succès !');
      } catch (error) {
        console.error('Erreur lors de la création du canal de test:', error);
        alert('❌ Erreur lors de la création du canal de test');
      }
    };

    return (
      <div className="space-y-4">
        {/* Statistiques des discussions */}
        <div className="bg-gradient-to-r from-violet-50 to-violet-100 rounded-2xl p-4 border border-violet-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">💬</div>
              <div>
                <h3 className="font-semibold text-violet-800">
                  Discussions de groupe par objectifs
                </h3>
                <p className="text-violet-700 text-sm">
                  {channels.length} discussion{channels.length > 1 ? 's' : ''} active{channels.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {/* Bouton de test temporaire */}
            <button
              onClick={handleCreateTestChannel}
              className="bg-violet-500 text-white px-3 py-2 rounded-lg hover:bg-violet-600 text-sm"
            >
              + Test
            </button>
          </div>
        </div>

        {channels.length === 0 && (
          <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">ℹ️</div>
              <div>
                <h3 className="font-semibold text-yellow-800">
                  Aucune discussion pour le moment
                </h3>
                <p className="text-yellow-700 text-sm">
                  Créez un objectif avec le bouton flottant (+) pour générer automatiquement une discussion de groupe, ou utilisez le bouton "Test" ci-dessus pour créer une discussion test.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Interface de chat */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100" style={{ height: '500px' }}>
          <div className="p-4 border-b bg-gray-50 rounded-t-2xl">
            <h3 className="font-semibold text-gray-800">Vos discussions</h3>
          </div>
          
          <div className="flex" style={{ height: '452px' }}>
            <Chat client={chatClient} theme="messaging light">
              {/* Liste des canaux */}
              <div className="w-1/3 border-r">
                <ChannelList
                  filters={customFilters}
                  sort={sort}
                  onSelect={setSelectedChannel}
                  options={{ state: true, watch: true, presence: true }}
                />
              </div>

              {/* Zone de messages */}
              <div className="w-2/3">
                {selectedChannel ? (
                  <Channel channel={selectedChannel}>
                    <Window>
                      <MessageList />
                      <MessageInput />
                    </Window>
                    <Thread />
                  </Channel>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-50">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-gray-600">Sélectionnez une discussion</p>
                      <p className="text-gray-500 text-sm mt-2">
                        Chaque objectif créé génère automatiquement une discussion de groupe
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Chat>
          </div>
        </div>
      </div>
    );
  };

  // Composant pour l'onglet Membres (existant)
  const MembersTab = () => {
    return (
      <div className="space-y-4">
        {/* Message d'encouragement */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🌟</div>
            <div>
              <h3 className="font-semibold text-emerald-800 mb-1">
                Votre réseau de confiance grandit !
              </h3>
              <p className="text-emerald-700 text-sm">
                Chaque connexion représente une relation de confiance construite à travers vos collaborations sur Tonty.
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div className="text-2xl font-bold text-violet-600">{members.length}</div>
            <div className="text-sm text-gray-600">Connexions</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div className="text-2xl font-bold text-emerald-600">
              {Math.round(members.reduce((sum, m) => sum + parseFloat(m.collaborationDuration.match(/\d+/) || 0), 0) / members.length)}
            </div>
            <div className="text-sm text-gray-600">Mois moy.</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div className="text-2xl font-bold text-blue-600">
              {new Set(members.flatMap(m => m.commonTontines)).size}
            </div>
            <div className="text-sm text-gray-600">Groupes</div>
          </div>
        </div>

        {/* Liste des membres */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Vos Connexions
              {searchQuery && (
                <span className="text-violet-600 ml-2">
                  ({filteredMembers.length} résultat{filteredMembers.length > 1 ? 's' : ''})
                </span>
              )}
            </h2>
            
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Effacer
              </button>
            )}
          </div>

          {filteredMembers.length > 0 ? (
            <ul className="space-y-3">
              {filteredMembers.map((member) => (
                <li key={member.id}>
                  <NetworkMemberCard
                    member={member}
                    onInvite={handleInvite}
                    onCreateGroup={handleCreateGroup}
                    onViewConnection={handleViewConnection}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Aucun résultat
              </h3>
              <p className="text-gray-600 mb-4">
                Aucun membre ne correspond à votre recherche "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="bg-violet-500 text-white px-4 py-2 rounded-lg hover:bg-violet-600 transition-colors"
              >
                Voir tous les membres
              </button>
            </div>
          )}
        </div>

        {/* Call to action en bas */}
        <div className="bg-violet-50 rounded-2xl p-6 border border-violet-200">
          <div className="text-center">
            <h3 className="font-semibold text-violet-800 mb-2">
              💫 Étendez votre réseau
            </h3>
            <p className="text-violet-700 text-sm mb-4">
              Invitez des amis à rejoindre Tonty et renforcez ensemble vos liens de confiance.
            </p>
            <button className="bg-violet-500 text-white px-6 py-3 rounded-xl hover:bg-violet-600 transition-colors">
              Inviter des amis
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre réseau...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-violet-500 text-white px-4 py-2 rounded-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold">Réseau Tonty</h1>
              <p className="text-white/80">
                Gérez vos connexions et discussions de groupe
              </p>
            </div>
          </div>

          {/* Onglets de navigation */}
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setActiveNetworkTab('membres')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeNetworkTab === 'membres' 
                  ? 'bg-white text-violet-600' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              👥 Membres ({members.length})
            </button>
            <button
              onClick={() => setActiveNetworkTab('discussions')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeNetworkTab === 'discussions' 
                  ? 'bg-white text-violet-600' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              💬 Discussions ({channels.length})
            </button>
            <button
              onClick={() => setIsUserSearchModalOpen(true)}
              className="px-4 py-2 rounded-lg font-medium transition-colors text-white hover:bg-white/10"
            >
              🔍 Rechercher
            </button>
            <button
              onClick={() => setIsContactsListOpen(true)}
              className="px-4 py-2 rounded-lg font-medium transition-colors text-white hover:bg-white/10"
            >
              👥 Contacts
            </button>
          </div>

          {/* Barre de recherche (uniquement pour l'onglet membres) */}
          {activeNetworkTab === 'membres' && (
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un membre par nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30"
              />
              <svg 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-2xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-violet-500 text-white px-4 py-2 rounded-lg"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <>
            {/* Rendu conditionnel basé sur l'onglet actif */}
            {activeNetworkTab === 'membres' ? <MembersTab /> : <DiscussionsTab />}
          </>
        )}
      </div>
    </div>
  );
};

export default NetworkScreen;