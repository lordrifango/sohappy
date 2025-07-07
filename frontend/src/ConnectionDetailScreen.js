import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

// Composant Avatar réutilisé
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

// Page de détail de connexion - "Notre Lien"
const ConnectionDetailScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { memberId } = useParams();
  
  // Récupérer les données du membre depuis l'état de navigation ou fallback
  const member = location.state?.member || {
    id: memberId,
    fullName: "Membre introuvable",
    initials: "??",
    avatarUrl: null,
    trustLink: "Aucune information disponible",
    memberSince: "Inconnu",
    commonTontines: [],
    collaborationDuration: "0 mois"
  };

  // Mock data pour les tontines en commun avec plus de détails
  const mockCommonTontinesDetails = {
    "TFK": {
      name: "Tontine Familiale Konaté",
      status: "active",
      startDate: "15 Janvier 2025",
      endDate: "15 Août 2025",
      myPosition: 3,
      memberPosition: 5,
      totalMembers: 8,
      monthlyAmount: "250 000 FCFA",
      completedCycles: 0,
      memberRole: "Membre",
      myRole: "Membre"
    },
    "GAA": {
      name: "Groupe Amis Abidjan", 
      status: "completed",
      startDate: "1 Février 2024",
      endDate: "1 Décembre 2024",
      myPosition: 2,
      memberPosition: 4,
      totalMembers: 11,
      monthlyAmount: "100 000 FCFA",
      completedCycles: 1,
      memberRole: "Membre",
      myRole: "Membre"
    },
    "ÉQB": {
      name: "Épargne Quartier Bamako",
      status: "active",
      startDate: "15 Mars 2025", 
      endDate: "15 Mai 2026",
      myPosition: 7,
      memberPosition: 12,
      totalMembers: 15,
      monthlyAmount: "500 000 FCFA",
      completedCycles: 0,
      memberRole: "Membre",
      myRole: "Membre"
    }
  };

  // Obtenir les détails des tontines communes
  const commonTontinesDetails = member.commonTontines.map(tontineId => ({
    id: tontineId,
    ...mockCommonTontinesDetails[tontineId]
  })).filter(t => t.name); // Filtrer les tontines inexistantes

  // Calculer des statistiques de collaboration
  const totalCollaborations = commonTontinesDetails.length;
  const activeCollaborations = commonTontinesDetails.filter(t => t.status === 'active').length;
  const completedCollaborations = commonTontinesDetails.filter(t => t.status === 'completed').length;
  
  // Calculer la durée totale de collaboration
  const collaborationMonths = parseFloat(member.collaborationDuration.match(/\d+/) || 0);
  const collaborationYears = Math.floor(collaborationMonths / 12);
  const remainingMonths = collaborationMonths % 12;
  
  const formatCollaborationDuration = () => {
    if (collaborationYears > 0 && remainingMonths > 0) {
      return `${collaborationYears} an${collaborationYears > 1 ? 's' : ''} et ${remainingMonths} mois`;
    } else if (collaborationYears > 0) {
      return `${collaborationYears} an${collaborationYears > 1 ? 's' : ''}`;
    } else {
      return `${remainingMonths} mois`;
    }
  };

  const handleBack = () => {
    navigate('/network');
  };

  const handleStartNewTontine = () => {
    alert(`Création d'une nouvelle tontine avec ${member.fullName}`);
  };

  const handleInviteToExisting = () => {
    alert(`Invitation de ${member.fullName} à une tontine existante`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Vous & {member.fullName.split(' ')[0]}</h1>
              <p className="text-white/80">Historique de votre relation de confiance</p>
            </div>
          </div>

          {/* Profils côte à côte */}
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <Avatar 
                avatarUrl={null} 
                initials="ME"
                size="w-20 h-20"
              />
              <p className="text-white/90 mt-2 font-medium">Vous</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-1 bg-white/30 rounded-full mb-2"></div>
              <div className="text-2xl">🤝</div>
              <div className="w-12 h-1 bg-white/30 rounded-full mt-2"></div>
            </div>
            
            <div className="text-center">
              <Avatar 
                avatarUrl={member.avatarUrl} 
                initials={member.initials}
                size="w-20 h-20"
              />
              <p className="text-white/90 mt-2 font-medium">{member.fullName.split(' ')[0]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Résumé de la relation */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-3">📊</span>
            Votre Relation de Confiance
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-violet-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-violet-600">{formatCollaborationDuration()}</div>
              <div className="text-sm text-violet-700">de collaboration</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{totalCollaborations}</div>
              <div className="text-sm text-emerald-700">projet{totalCollaborations > 1 ? 's' : ''} en commun</div>
            </div>
          </div>

          {/* Type de lien */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-800 mb-2 flex items-center">
              <span className="text-gray-400 mr-2">🔗</span>
              Votre lien
            </h3>
            <p className="text-gray-700">{member.trustLink}</p>
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div className="text-lg font-bold text-blue-600">{activeCollaborations}</div>
            <div className="text-xs text-gray-600">En cours</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div className="text-lg font-bold text-green-600">{completedCollaborations}</div>
            <div className="text-xs text-gray-600">Terminés</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div className="text-lg font-bold text-purple-600">100%</div>
            <div className="text-xs text-gray-600">Fiabilité</div>
          </div>
        </div>

        {/* Tontines en commun */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-3">🏛️</span>
            Vos Projets Communs
          </h2>

          {commonTontinesDetails.length > 0 ? (
            <div className="space-y-4">
              {commonTontinesDetails.map((tontine, index) => (
                <div key={tontine.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{tontine.name}</h3>
                      <p className="text-sm text-gray-600">
                        {tontine.startDate} - {tontine.endDate}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tontine.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {tontine.status === 'active' ? 'En cours' : 'Terminé'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Votre position</p>
                      <p className="font-medium text-gray-800">#{tontine.myPosition}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Position de {member.fullName.split(' ')[0]}</p>
                      <p className="font-medium text-gray-800">#{tontine.memberPosition}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{tontine.totalMembers} membres</span>
                    <span>{tontine.monthlyAmount}/mois</span>
                  </div>

                  {tontine.completedCycles > 0 && (
                    <div className="mt-2 text-xs text-emerald-600 font-medium">
                      ✅ {tontine.completedCycles} cycle{tontine.completedCycles > 1 ? 's' : ''} terminé{tontine.completedCycles > 1 ? 's' : ''} ensemble
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m0 0h4M9 7h6m-6 4h6m-6 4h6" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800 mb-1">Aucun projet commun</h3>
              <p className="text-gray-600 text-sm">Vous n'avez pas encore collaboré dans des tontines</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-3">🚀</span>
              Nouvelles Collaborations
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleStartNewTontine}
                className="w-full bg-violet-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-violet-600 transition-colors flex items-center justify-center space-x-2"
              >
                <span>+</span>
                <span>Créer une nouvelle tontine ensemble</span>
              </button>
              <button
                onClick={handleInviteToExisting}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Inviter à une tontine existante
              </button>
            </div>
          </div>

          {/* Note de confidentialité */}
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="text-blue-500">
                <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m8-9a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 text-sm">Confidentialité respectée</h4>
                <p className="text-blue-700 text-xs mt-1">
                  Seules les informations communes à vos collaborations sont affichées. 
                  Les données personnelles de {member.fullName.split(' ')[0]} restent privées.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionDetailScreen;