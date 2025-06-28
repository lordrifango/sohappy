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
export const Dashboard = ({ 
  tontines, 
  onTontineSelect, 
  currency, 
  onCurrencyToggle, 
  onMembersClick, 
  onUpcomingToursClick, 
  onDepositClick, 
  onWithdrawClick,
  balance = 1000000,
  formatBalance = (amount) => new Intl.NumberFormat('fr-FR').format(amount),
  isPremium = false,
  tontinesCount = 0,
  goalsCount = 0,
  fundsCount = 0,
  limits = { tontines: 3, personalGoals: 1, funds: 1 },
  onUpgrade
}) => {
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
      case 'USD': return formatBalance(Math.round(balance * 0.00165));
      case 'EUR': return formatBalance(Math.round(balance * 0.00152));
      default: return formatBalance(balance);
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

      {/* Premium Status */}
      {isPremium ? (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-xl shadow-lg mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl">⭐</span>
              <div>
                <h3 className="font-bold">Tonty Premium</h3>
                <p className="text-sm opacity-90">Toutes les fonctionnalités débloquées</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Objectifs illimités</p>
              <p className="font-bold">Actif</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-4 rounded-xl shadow-lg mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl">📊</span>
              <div>
                <h3 className="font-bold">Plan Gratuit</h3>
                <p className="text-sm opacity-90">
                  {tontinesCount}/{limits.tontines} tontines • {goalsCount}/{limits.personalGoals} objectif • {fundsCount}/{limits.funds} cagnotte
                </p>
              </div>
            </div>
            <button 
              onClick={onUpgrade}
              className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Upgrade
            </button>
          </div>
        </div>
      )}

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

//======= COMPOSANTS PREMIUM =======

// Premium Modal - Affiché quand les limites gratuites sont atteintes
export const PremiumModal = ({ isOpen, onClose, limitType, onUpgrade }) => {
  if (!isOpen) return null;

  const limitMessages = {
    tontine: {
      title: "Limite de tontines atteinte",
      message: "En tant qu'utilisateur gratuit, vous ne pouvez créer que 3 tontines maximum.",
      icon: "🏛️"
    },
    personalGoal: {
      title: "Limite d'objectifs personnels atteinte",
      message: "En tant qu'utilisateur gratuit, vous ne pouvez créer qu'1 objectif personnel maximum.",
      icon: "🎯"
    },
    fund: {
      title: "Limite de cagnottes atteinte",
      message: "En tant qu'utilisateur gratuit, vous ne pouvez créer qu'1 cagnotte maximum.",
      icon: "💰"
    }
  };

  const currentLimit = limitMessages[limitType] || limitMessages.tontine;

  const premiumFeatures = [
    { icon: "🚀", title: "Tontines illimitées", description: "Créez autant de tontines que vous voulez" },
    { icon: "🎯", title: "Objectifs illimités", description: "Fixez-vous tous les objectifs que vous souhaitez" },
    { icon: "💰", title: "Cagnottes illimitées", description: "Organisez toutes vos collectes de fonds" },
    { icon: "📊", title: "Analyses avancées", description: "Statistiques détaillées de vos épargnes" },
    { icon: "📁", title: "Export PDF", description: "Téléchargez vos relevés en PDF" },
    { icon: "🔔", title: "Notifications intelligentes", description: "Rappels personnalisés et optimisés" },
    { icon: "🎨", title: "Thèmes premium", description: "Personnalisez l'apparence de votre app" },
    { icon: "🛡️", title: "Support prioritaire", description: "Assistance rapide et dédiée" }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{currentLimit.icon}</div>
              <div>
                <h2 className="text-xl font-bold">{currentLimit.title}</h2>
                <p className="opacity-90 text-sm">Passez au Premium pour continuer</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Limit Message */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <p className="text-orange-800 text-center">{currentLimit.message}</p>
          </div>

          {/* Premium Features */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
              🌟 Débloquez toutes les fonctionnalités Premium
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="text-xl">{feature.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl p-6 mb-6 text-center">
            <h3 className="text-lg font-bold mb-2">Tonty Premium</h3>
            <div className="text-3xl font-bold mb-1">5 000 FCFA</div>
            <p className="text-sm opacity-90 mb-4">par mois</p>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-sm">✅ Tous vos objectifs en illimité</p>
              <p className="text-sm">✅ Fonctionnalités avancées</p>
              <p className="text-sm">✅ Support prioritaire</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-emerald-700 shadow-lg"
            >
              🚀 Passer au Premium maintenant
            </button>
            <button 
              onClick={onClose}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50"
            >
              Plus tard
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Annulable à tout moment • Paiement sécurisé • Activation immédiate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Pricing Page Component
export const PricingPage = ({ isOpen, onClose, onSelectPremium }) => {
  if (!isOpen) return null;

  const freeFeatures = [
    "✅ Jusqu'à 3 tontines",
    "✅ 1 objectif personnel",
    "✅ 1 cagnotte",
    "✅ Dépôts et retraits gratuits",
    "✅ Interface de base",
    "❌ Historique limité (30 jours)",
    "❌ Pas d'export PDF",
    "❌ Support standard",
    "❌ Analyses limitées"
  ];

  const premiumFeatures = [
    "🚀 Tontines illimitées",
    "🎯 Objectifs personnels illimités", 
    "💰 Cagnottes illimitées",
    "✅ Dépôts et retraits gratuits",
    "📊 Analyses avancées et graphiques",
    "📁 Export PDF des relevés",
    "🔔 Notifications intelligentes",
    "🛡️ Support prioritaire 24/7",
    "☁️ Sauvegarde cloud sécurisée",
    "🎨 Thèmes premium et customisation",
    "📈 Statistiques détaillées",
    "🔮 Accès anticipé aux nouvelles fonctionnalités",
    "💾 Historique complet illimité"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Choisissez votre plan Tonty</h1>
              <p className="opacity-90 mt-1">Débloquez tout le potentiel de vos épargnes</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Plans Comparison */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Plan Gratuit */}
            <div className="border-2 border-gray-200 rounded-2xl p-6 relative">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Plan Gratuit</h2>
                <div className="text-3xl font-bold text-gray-600 mb-1">0 FCFA</div>
                <p className="text-gray-500">Pour toujours</p>
              </div>
              
              <div className="space-y-3 mb-6">
                {freeFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <span className={feature.startsWith('❌') ? 'text-gray-400' : 'text-gray-700'}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-medium cursor-not-allowed">
                Plan actuel
              </button>
            </div>

            {/* Plan Premium */}
            <div className="border-2 border-emerald-500 rounded-2xl p-6 relative bg-gradient-to-b from-emerald-50 to-white">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  ⭐ Recommandé
                </span>
              </div>
              
              <div className="text-center mb-6 mt-2">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Plan Premium</h2>
                <div className="text-3xl font-bold text-emerald-600 mb-1">5 000 FCFA</div>
                <p className="text-gray-500">par mois</p>
              </div>
              
              <div className="space-y-3 mb-6">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-700">
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={onSelectPremium}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 shadow-lg"
              >
                🚀 Passer au Premium
              </button>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">❓ Questions fréquentes</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Puis-je annuler mon abonnement à tout moment ?</h4>
                <p className="text-sm text-gray-600">Oui, vous pouvez annuler à tout moment depuis les paramètres de votre compte. Votre abonnement restera actif jusqu'à la fin de la période payée.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Que se passe-t-il si je dépasse les limites gratuites ?</h4>
                <p className="text-sm text-gray-600">Vous ne pourrez plus créer de nouveaux objectifs jusqu'à ce que vous passiez au Premium ou supprimiez des objectifs existants.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Mes données sont-elles sauvegardées ?</h4>
                <p className="text-sm text-gray-600">Oui, toutes vos données sont automatiquement sauvegardées. Avec Premium, vous bénéficiez d'une sauvegarde cloud sécurisée supplémentaire.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Comment fonctionne le paiement ?</h4>
                <p className="text-sm text-gray-600">Paiement sécurisé par Mobile Money (Wave, Orange Money, MTN, Moov). Facturation automatique chaque mois.</p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500 mb-4">
              Rejoignez plus de 10 000 utilisateurs qui ont déjà choisi Tonty Premium
            </p>
            <button 
              onClick={onSelectPremium}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-blue-600 shadow-lg"
            >
              Essayer Premium maintenant
            </button>
          </div>
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

// Discussions Tab - Now organized by Tontine groups
const DiscussionsTab = ({ tontines }) => {
  const [selectedTontine, setSelectedTontine] = useState(null);
  
  // Mock discussions organized by tontine
  const mockDiscussionsByTontine = {
    'tfk': [
      {
        id: 1,
        author: 'Mariam K.',
        avatar: 'MK',
        color: 'bg-red-500',
        time: '2h',
        message: 'Bonjour tout le monde ! N\'oubliez pas le versement de demain 💰',
        likes: 5,
        replies: 2
      }
    ],
    'gaa': [
      {
        id: 2,
        author: 'Fatou D.',
        avatar: 'FD',
        color: 'bg-blue-500',
        time: '4h',
        message: 'Félicitations à Aminata pour avoir reçu son tour ! 🎉🎊',
        likes: 12,
        replies: 8
      }
    ],
    'eqb': [
      {
        id: 3,
        author: 'Ibrahim T.',
        avatar: 'IT',
        color: 'bg-green-500',
        time: '1j',
        message: 'Question: peut-on modifier le montant pour le prochain cycle ?',
        likes: 3,
        replies: 15
      }
    ]
  };

  if (selectedTontine) {
    const discussions = mockDiscussionsByTontine[selectedTontine.id] || [];
    
    return (
      <div className="space-y-4">
        {/* Complete tontine info header */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={() => setSelectedTontine(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className={`w-12 h-12 ${selectedTontine.color} rounded-full flex items-center justify-center text-white font-bold`}>
              {selectedTontine.name}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-lg">{selectedTontine.fullName}</h3>
              <p className="text-sm text-gray-500">{selectedTontine.membersCount} membres</p>
            </div>
          </div>

          {/* Tontine details */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Montant par tour</p>
              <p className="font-bold text-gray-800">{selectedTontine.amount} {selectedTontine.currency}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Prochain paiement</p>
              <p className="font-medium text-gray-800">{selectedTontine.nextPayment}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Période</p>
              <p className="text-sm text-gray-700">{selectedTontine.startDate} - {selectedTontine.endDate}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Progression</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${selectedTontine.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium">{selectedTontine.progress}%</span>
              </div>
            </div>
          </div>

          {/* Members preview */}
          <div className="border-t border-gray-200 pt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Membres actifs</p>
            <div className="flex -space-x-2">
              {Array.from({length: Math.min(selectedTontine.membersCount, 6)}).map((_, i) => (
                <div 
                  key={i}
                  className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold ${
                    ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'][i]
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              {selectedTontine.membersCount > 6 && (
                <div className="w-8 h-8 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                  +{selectedTontine.membersCount - 6}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create Post for this tontine */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
              ME
            </div>
            <input 
              type="text" 
              placeholder={`Partagez quelque chose avec ${selectedTontine.name}...`}
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

        {/* Discussions for this tontine */}
        {discussions.map(discussion => (
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

        {discussions.length === 0 && (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="text-gray-400 mb-4">
              <ChatBubbleLeftIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Aucune discussion pour le moment</h3>
            <p className="text-gray-600">Soyez le premier à démarrer une conversation dans ce groupe !</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Discussions par Tontine</h3>
      
      {/* Tontine groups list */}
      {tontines && tontines.map(tontine => (
        <div 
          key={tontine.id}
          onClick={() => setSelectedTontine(tontine)}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 ${tontine.color} rounded-full flex items-center justify-center text-white font-bold`}>
                {tontine.name}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{tontine.fullName}</h4>
                <p className="text-sm text-gray-500">{tontine.membersCount} membres</p>
                <p className="text-xs text-gray-400">
                  {mockDiscussionsByTontine[tontine.id] ? 
                    `${mockDiscussionsByTontine[tontine.id].length} message(s)` : 
                    'Aucun message'
                  }
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              {mockDiscussionsByTontine[tontine.id] && mockDiscussionsByTontine[tontine.id].length > 0 && (
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
              )}
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
        <span className="text-xs mt-1">Réseau Tonty</span>
      </button>
    </div>
  </div>
);

// Floating Action Button Component
export const FloatingActionButton = ({ onCreateGoal, onAddContact, onSupport }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Action Options */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3 animate-fade-in">
          <button
            onClick={() => {
              onCreateGoal();
              setIsOpen(false);
            }}
            className="flex items-center justify-end space-x-3 bg-emerald-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-emerald-600 transition-all transform hover:scale-105"
          >
            <span className="text-sm font-medium">Créer un objectif</span>
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              🎯
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
export const CreateTontineModal = ({ isOpen, onClose, onTontineCreated }) => {
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
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [newTontineId, setNewTontineId] = useState(null);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleCreateTontine = () => {
    // Generate new tontine data
    const newTontine = {
      id: `tontine_${Date.now()}`,
      name: formData.name.split(' ').map(word => word[0]).join('').toUpperCase(),
      fullName: formData.name,
      amount: formData.amount,
      currency: 'FCFA',
      nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
      membersCount: 1, // Creator only initially
      startDate: formData.startDate,
      endDate: new Date(new Date(formData.startDate).getTime() + parseInt(formData.duration) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
      remaining: `${formData.duration} mois restants`,
      progress: 0,
      color: ['bg-blue-500', 'bg-purple-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'][Math.floor(Math.random() * 5)]
    };

    setNewTontineId(newTontine.id);
    setShowSuccessScreen(true);
    
    // Call parent callback to add tontine to list
    if (onTontineCreated) {
      onTontineCreated(newTontine);
    }
  };

  const resetModal = () => {
    setStep(1);
    setFormData({
      name: '',
      description: '',
      amount: '',
      frequency: 'monthly',
      duration: '',
      startDate: '',
      members: []
    });
    setShowSuccessScreen(false);
    setNewTontineId(null);
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetModal, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {!showSuccessScreen ? (
          <>
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Créer une Tontine</h2>
                <button onClick={handleClose} className="text-white hover:text-gray-200">
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
                  onClick={handleCreateTontine}
                  className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 ml-auto"
                >
                  Créer la Tontine
                </button>
              )}
            </div>
          </>
        ) : (
          <TontineSuccessScreen 
            tontineName={formData.name}
            tontineId={newTontineId}
            onClose={handleClose}
            onInviteContacts={() => {
              // Logic to open invite contacts modal
              handleClose();
              // Could trigger parent to open AddContactModal
            }}
          />
        )}
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

// Tontine Success Screen Component
const TontineSuccessScreen = ({ tontineName, tontineId, onClose, onInviteContacts }) => (
  <div className="p-6 text-center">
    <div className="mb-8">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
          ✓
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">Tontine créée avec succès ! 🎉</h3>
      <p className="text-gray-600 mb-6">
        Votre tontine <strong>"{tontineName}"</strong> a été créée et est maintenant active.
      </p>
      
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 text-left">
        <h4 className="font-medium text-emerald-800 mb-3">Prochaines étapes</h4>
        <div className="space-y-2 text-sm text-emerald-700">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Invitez vos contacts à rejoindre la tontine</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Configurez les paramètres de paiement</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Commencez les discussions avec vos membres</span>
          </div>
        </div>
      </div>
    </div>

    <div className="space-y-3">
      <button 
        onClick={onInviteContacts}
        className="w-full bg-emerald-500 text-white py-3 rounded-xl font-medium hover:bg-emerald-600 flex items-center justify-center space-x-2"
      >
        <span>👥</span>
        <span>Inviter des contacts maintenant</span>
      </button>
      
      <button 
        onClick={onClose}
        className="w-full border-2 border-emerald-500 text-emerald-600 py-3 rounded-xl font-medium hover:bg-emerald-50"
      >
        Terminer et voir ma tontine
      </button>
    </div>

    <div className="mt-6 text-xs text-gray-500">
      ID de la tontine: {tontineId}
    </div>
  </div>
);

//======= NOUVEAU MODAL DE SELECTION DU TYPE D'OBJECTIF =======

// Goal Type Selection Modal
export const GoalTypeSelectionModal = ({ isOpen, onClose, onSelectType }) => {
  if (!isOpen) return null;

  const goalTypes = [
    {
      id: 'personal',
      title: 'Objectif Personnel',
      description: 'Économisez pour un projet personnel (maison, voiture, voyage, etc.)',
      icon: '🎯',
      color: 'from-blue-500 to-blue-600',
      features: ['Épargne individuelle', 'Suivi de progression', 'Rappels automatiques']
    },
    {
      id: 'tontine',
      title: 'Tontine',
      description: 'Système d\'épargne rotatif avec un groupe d\'amis ou famille',
      icon: '🏛️',
      color: 'from-emerald-500 to-emerald-600',
      features: ['Épargne collective', 'Tours de réception', 'Gestion de groupe']
    },
    {
      id: 'fund',
      title: 'Cagnotte',
      description: 'Créez une cagnotte pour un événement ou une urgence',
      icon: '💰',
      color: 'from-purple-500 to-purple-600',
      features: ['Contributions multiples', 'But spécifique', 'Partage facile']
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Créer un objectif</h2>
              <p className="opacity-90 mt-1">Choisissez le type d'objectif que vous souhaitez créer</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Goal Types */}
        <div className="p-6 space-y-4">
          {goalTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                onSelectType(type.id);
                onClose();
              }}
              className="w-full text-left border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-r ${type.color} rounded-full flex items-center justify-center text-2xl shadow-lg`}>
                  {type.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">
                    {type.title}
                  </h3>
                  <p className="text-gray-600 mt-1 mb-3">
                    {type.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {type.features.map((feature, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div className="text-gray-400 group-hover:text-emerald-500 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <p className="text-sm text-gray-500 text-center">
            Vous pourrez modifier ces paramètres plus tard dans les paramètres de votre objectif
          </p>
        </div>
      </div>
    </div>
  );
};

// Personal Goal Modal
export const PersonalGoalModal = ({ isOpen, onClose, onGoalCreated }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    deadline: '',
    category: 'savings',
    reminderFrequency: 'weekly'
  });

  const categories = [
    { id: 'savings', name: 'Épargne générale', icon: '💰', color: 'bg-green-500' },
    { id: 'house', name: 'Achat maison', icon: '🏠', color: 'bg-blue-500' },
    { id: 'car', name: 'Achat véhicule', icon: '🚗', color: 'bg-red-500' },
    { id: 'travel', name: 'Voyage', icon: '✈️', color: 'bg-purple-500' },
    { id: 'education', name: 'Éducation', icon: '📚', color: 'bg-indigo-500' },
    { id: 'health', name: 'Santé', icon: '⚕️', color: 'bg-pink-500' },
    { id: 'business', name: 'Business', icon: '💼', color: 'bg-yellow-500' },
    { id: 'other', name: 'Autre', icon: '🎯', color: 'bg-gray-500' }
  ];

  const handleSubmit = () => {
    const newGoal = {
      id: `goal_${Date.now()}`,
      type: 'personal',
      title: formData.title,
      description: formData.description,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: 0,
      deadline: formData.deadline,
      category: formData.category,
      reminderFrequency: formData.reminderFrequency,
      progress: 0,
      createdAt: new Date().toISOString()
    };

    if (onGoalCreated) {
      onGoalCreated(newGoal);
    }

    // Reset form
    setFormData({
      title: '',
      description: '',
      targetAmount: '',
      deadline: '',
      category: 'savings',
      reminderFrequency: 'weekly'
    });
    setStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Objectif Personnel</h2>
              <p className="opacity-90 text-sm">Étape {step} sur 2</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de votre objectif *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ex: Achat d'une voiture"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              {/* Target Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant cible (FCFA) *
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1 000 000"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date limite (optionnel)
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Décrivez votre objectif..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50"
                  onClick={onClose}
                >
                  Annuler
                </button>
                <button 
                  className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50"
                  disabled={!formData.title || !formData.targetAmount}
                  onClick={() => setStep(2)}
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Catégorie
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setFormData({...formData, category: category.id})}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        formData.category === category.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{category.icon}</span>
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reminder Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Fréquence des rappels
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'daily', name: 'Quotidien' },
                    { id: 'weekly', name: 'Hebdomadaire' },
                    { id: 'monthly', name: 'Mensuel' },
                    { id: 'none', name: 'Aucun rappel' }
                  ].map((freq) => (
                    <button
                      key={freq.id}
                      onClick={() => setFormData({...formData, reminderFrequency: freq.id})}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${
                        formData.reminderFrequency === freq.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {freq.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50"
                  onClick={() => setStep(1)}
                >
                  Retour
                </button>
                <button 
                  className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600"
                  onClick={handleSubmit}
                >
                  Créer l'objectif
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Fund/Cagnotte Modal
export const FundModal = ({ isOpen, onClose, onFundCreated }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    deadline: '',
    purpose: 'event',
    isPublic: true,
    allowAnonymous: false
  });

  const purposes = [
    { id: 'event', name: 'Événement', icon: '🎉', color: 'bg-pink-500' },
    { id: 'emergency', name: 'Urgence/Accident', icon: '🚨', color: 'bg-red-500' },
    { id: 'medical', name: 'Frais médicaux', icon: '⚕️', color: 'bg-blue-500' },
    { id: 'education', name: 'Éducation', icon: '📚', color: 'bg-indigo-500' },
    { id: 'charity', name: 'Charité', icon: '❤️', color: 'bg-green-500' },
    { id: 'project', name: 'Projet commun', icon: '🛠️', color: 'bg-orange-500' },
    { id: 'travel', name: 'Voyage de groupe', icon: '✈️', color: 'bg-purple-500' },
    { id: 'other', name: 'Autre', icon: '💰', color: 'bg-gray-500' }
  ];

  const handleSubmit = () => {
    const newFund = {
      id: `fund_${Date.now()}`,
      type: 'fund',
      title: formData.title,
      description: formData.description,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: 0,
      deadline: formData.deadline,
      purpose: formData.purpose,
      isPublic: formData.isPublic,
      allowAnonymous: formData.allowAnonymous,
      contributors: [],
      contributions: [],
      progress: 0,
      createdAt: new Date().toISOString(),
      shareCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    };

    if (onFundCreated) {
      onFundCreated(newFund);
    }

    // Reset form
    setFormData({
      title: '',
      description: '',
      targetAmount: '',
      deadline: '',
      purpose: 'event',
      isPublic: true,
      allowAnonymous: false
    });
    setStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Créer une Cagnotte</h2>
              <p className="opacity-90 text-sm">Étape {step} sur 2</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la cagnotte *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="ex: Mariage de Marie et Paul"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              {/* Target Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objectif (FCFA) *
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="500 000"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date limite *
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                  placeholder="Expliquez le but de cette cagnotte..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50"
                  onClick={onClose}
                >
                  Annuler
                </button>
                <button 
                  className="flex-1 bg-purple-500 text-white py-3 rounded-xl font-medium hover:bg-purple-600 disabled:opacity-50"
                  disabled={!formData.title || !formData.targetAmount || !formData.deadline || !formData.description}
                  onClick={() => setStep(2)}
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Purpose Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Catégorie
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {purposes.map((purpose) => (
                    <button
                      key={purpose.id}
                      onClick={() => setFormData({...formData, purpose: purpose.id})}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        formData.purpose === purpose.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{purpose.icon}</span>
                        <span className="text-sm font-medium">{purpose.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacy Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Paramètres de confidentialité
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm">Rendre cette cagnotte publique</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.allowAnonymous}
                      onChange={(e) => setFormData({...formData, allowAnonymous: e.target.checked})}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm">Autoriser les contributions anonymes</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50"
                  onClick={() => setStep(1)}
                >
                  Retour
                </button>
                <button 
                  className="flex-1 bg-purple-500 text-white py-3 rounded-xl font-medium hover:bg-purple-600"
                  onClick={handleSubmit}
                >
                  Créer la cagnotte
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

//======= FIN DES NOUVEAUX MODAUX =======

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

const ChevronRightIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

// New Modals

// Notifications Modal
export const NotificationsModal = ({ isOpen, onClose }) => {
  const mockNotifications = [
    {
      id: 1,
      type: 'payment',
      title: 'Paiement reçu',
      message: 'Mariam K. a effectué son versement pour TFK',
      time: '2h',
      icon: '💰',
      read: false
    },
    {
      id: 2,
      type: 'reminder',
      title: 'Rappel de versement',
      message: 'N\'oubliez pas votre versement pour GAA demain',
      time: '1j',
      icon: '⏰',
      read: false
    },
    {
      id: 3,
      type: 'message',
      title: 'Nouveau message',
      message: 'Ibrahim T. a posté dans ÉQB',
      time: '1j',
      icon: '💬',
      read: true
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Notifications</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {mockNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-4 rounded-xl border transition-all ${
                notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{notification.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <span className="text-xs text-gray-400 mt-2 block">{notification.time}</span>
                </div>
                {!notification.read && (
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button className="w-full text-blue-600 text-sm hover:underline">
            Marquer tout comme lu
          </button>
        </div>
      </div>
    </div>
  );
};

// Members List Modal
export const MembersListModal = ({ isOpen, onClose, members }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Contacts Tonty</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="mt-2 opacity-90">Membres connectés: {members.filter(m => m.status === 'En ligne').length}</p>
        </div>

        <div className="p-4 space-y-3">
          {members.map(member => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${member.color} rounded-full flex items-center justify-center text-white font-bold relative`}>
                  {member.avatar}
                  {member.status === 'En ligne' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{member.name}</p>
                  <p className={`text-sm ${member.status === 'En ligne' ? 'text-green-600' : 'text-gray-500'}`}>
                    {member.status === 'En ligne' ? 'En ligne' : member.lastSeen}
                  </p>
                </div>
              </div>
              <button className="text-blue-600 text-sm hover:underline">
                Contacter
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Upcoming Tours Modal
export const UpcomingToursModal = ({ isOpen, onClose, tours }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Mes Tours à Venir</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="mt-2 opacity-90">Paiements et réceptions programmés</p>
        </div>

        <div className="p-4 space-y-3">
          {tours.map(tour => (
            <div key={tour.id} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${tour.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                    {tour.tontine}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{tour.tontine}</p>
                    <p className="text-sm text-gray-500">{tour.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    tour.type === 'À recevoir' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tour.type}
                  </p>
                  <p className="font-bold text-gray-800">{tour.amount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Deposit Modal
export const DepositModal = ({ isOpen, onClose, onBalanceChange }) => {
  const [step, setStep] = useState(1); // 1: amount & method, 2: phone, 3: SMS code, 4: success
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionResult, setTransactionResult] = useState(null);

  const paymentMethods = [
    { id: 'wave', name: 'Wave', icon: '🐧', color: 'bg-blue-500', time: '1-3 minutes' },
    { id: 'orange', name: 'Orange Money', icon: '🟠', color: 'bg-orange-500', time: '2-5 minutes' },
    { id: 'mtn', name: 'MTN Mobile Money', icon: '🟡', color: 'bg-yellow-500', time: '1-3 minutes' },
    { id: 'moov', name: 'Moov Mobile Money', icon: '🔵', color: 'bg-blue-600', time: '3-7 minutes' }
  ];

  const handleSendSMS = async () => {
    setIsLoading(true);
    // Simulate SMS sending
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 2000);
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);
    // Simulate code verification
    setTimeout(() => {
      try {
        // Effectuer le dépôt
        const depositAmount = parseFloat(amount);
        const methodName = paymentMethods.find(m => m.id === selectedMethod)?.name || 'Mobile Money';
        
        if (onBalanceChange) {
          const result = onBalanceChange(depositAmount, 'deposit', methodName);
          setTransactionResult(result);
          setStep(4);
        } else {
          // Fallback if no balance context
          setStep(4);
        }
      } catch (error) {
        console.error('Deposit error:', error);
        alert('Erreur lors du dépôt: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  const resetModal = () => {
    setStep(1);
    setAmount('');
    setSelectedMethod('');
    setPhoneNumber('');
    setSmsCode('');
    setIsLoading(false);
    setTransactionResult(null);
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetModal, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Déposer de l'argent</h2>
            <button onClick={handleClose} className="text-white hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress indicator */}
          <div className="mt-4">
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
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant à déposer (FCFA)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="25 000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Méthode de paiement
                </label>
                <div className="space-y-3">
                  {paymentMethods.map(method => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedMethod === method.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${method.color} rounded-full flex items-center justify-center text-white text-xl`}>
                            {method.icon}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{method.name}</p>
                            <p className="text-sm text-gray-500">Arrivée dans {method.time}</p>
                          </div>
                        </div>
                        {selectedMethod === method.id && (
                          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                className="w-full bg-emerald-500 text-white py-3 rounded-xl font-medium hover:bg-emerald-600 disabled:opacity-50"
                disabled={!amount || !selectedMethod}
                onClick={() => setStep(2)}
              >
                Continuer
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  📱
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Vérification par SMS</h3>
                <p className="text-gray-600">Entrez votre numéro de téléphone pour recevoir un code de confirmation</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="+225 XX XX XX XX XX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <h4 className="font-medium text-emerald-800 mb-2">Récapitulatif</h4>
                <div className="space-y-1 text-sm text-emerald-700">
                  <div className="flex justify-between">
                    <span>Montant:</span>
                    <span>{amount} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Méthode:</span>
                    <span>{paymentMethods.find(m => m.id === selectedMethod)?.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button 
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50"
                  onClick={() => setStep(1)}
                >
                  Retour
                </button>
                <button 
                  className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-medium hover:bg-emerald-600 disabled:opacity-50"
                  disabled={!phoneNumber || isLoading}
                  onClick={handleSendSMS}
                >
                  {isLoading ? 'Envoi...' : 'Envoyer SMS'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  🔒
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Code de vérification</h3>
                <p className="text-gray-600">Entrez le code à 6 chiffres envoyé au {phoneNumber}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code de vérification
                </label>
                <input
                  type="text"
                  maxLength="6"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg text-center tracking-widest focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="000000"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div className="text-center">
                <button className="text-emerald-600 text-sm hover:underline">
                  Renvoyer le code
                </button>
              </div>

              <div className="flex space-x-3">
                <button 
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50"
                  onClick={() => setStep(2)}
                >
                  Retour
                </button>
                <button 
                  className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-medium hover:bg-emerald-600 disabled:opacity-50"
                  disabled={smsCode.length !== 6 || isLoading}
                  onClick={handleVerifyCode}
                >
                  {isLoading ? 'Vérification...' : 'Vérifier'}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                    ✓
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Dépôt bien pris en compte !</h3>
                <p className="text-gray-600 mb-4">Veuillez patienter, vos fonds seront crédités bientôt.</p>
                
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left">
                  <h4 className="font-medium text-emerald-800 mb-3">Détails de la transaction</h4>
                  <div className="space-y-2 text-sm text-emerald-700">
                    <div className="flex justify-between">
                      <span>Montant:</span>
                      <span className="font-medium">{amount} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Méthode:</span>
                      <span className="font-medium">{paymentMethods.find(m => m.id === selectedMethod)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Numéro:</span>
                      <span className="font-medium">{phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimation d'arrivée:</span>
                      <span className="font-medium">{paymentMethods.find(m => m.id === selectedMethod)?.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ID Transaction:</span>
                      <span className="font-medium text-xs">TXN{Date.now().toString().slice(-8)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                className="w-full bg-emerald-500 text-white py-3 rounded-xl font-medium hover:bg-emerald-600"
                onClick={handleClose}
              >
                Terminer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Withdraw Modal
export const WithdrawModal = ({ isOpen, onClose, onBalanceChange, currentBalance = 1000000 }) => {
  const [step, setStep] = useState(1); // 1: amount & method, 2: phone, 3: SMS code, 4: success
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionResult, setTransactionResult] = useState(null);

  const paymentMethods = [
    { id: 'wave', name: 'Wave', icon: '🐧', color: 'bg-blue-500', time: '1-3 minutes' },
    { id: 'orange', name: 'Orange Money', icon: '🟠', color: 'bg-orange-500', time: '2-5 minutes' },
    { id: 'mtn', name: 'MTN Mobile Money', icon: '🟡', color: 'bg-yellow-500', time: '1-3 minutes' },
    { id: 'moov', name: 'Moov Mobile Money', icon: '🔵', color: 'bg-blue-600', time: '3-7 minutes' }
  ];

  const handleSendSMS = async () => {
    setIsLoading(true);
    // Simulate SMS sending
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 2000);
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);
    // Simulate code verification
    setTimeout(() => {
      try {
        // Effectuer le retrait
        const withdrawAmount = parseFloat(amount);
        const methodName = paymentMethods.find(m => m.id === selectedMethod)?.name || 'Mobile Money';
        
        if (onBalanceChange) {
          const result = onBalanceChange(withdrawAmount, 'withdraw', methodName);
          setTransactionResult(result);
          setStep(4);
        } else {
          // Fallback if no balance context
          setStep(4);
        }
      } catch (error) {
        console.error('Withdraw error:', error);
        alert('Erreur lors du retrait: ' + error.message);
        setStep(1); // Retour au début en cas d'erreur
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  const resetModal = () => {
    setStep(1);
    setAmount('');
    setSelectedMethod('');
    setPhoneNumber('');
    setSmsCode('');
    setIsLoading(false);
    setTransactionResult(null);
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetModal, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Retirer de l'argent</h2>
            <button onClick={handleClose} className="text-white hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="mt-2 opacity-90">Solde disponible: {new Intl.NumberFormat('fr-FR').format(currentBalance)} FCFA</p>
          
          {/* Progress indicator */}
          <div className="mt-4">
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
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant à retirer (FCFA)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50 000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Méthode de retrait
                </label>
                <div className="space-y-3">
                  {paymentMethods.map(method => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${method.color} rounded-full flex items-center justify-center text-white text-xl`}>
                            {method.icon}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{method.name}</p>
                            <p className="text-sm text-gray-500">Arrivée dans {method.time}</p>
                          </div>
                        </div>
                        {selectedMethod === method.id && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50"
                disabled={!amount || !selectedMethod || parseFloat(amount) > currentBalance || parseFloat(amount) <= 0}
                onClick={() => {
                  const withdrawAmount = parseFloat(amount);
                  if (withdrawAmount > currentBalance) {
                    alert('Solde insuffisant pour effectuer ce retrait');
                    return;
                  }
                  if (withdrawAmount <= 0) {
                    alert('Le montant doit être supérieur à 0');
                    return;
                  }
                  setStep(2);
                }}
              >
                {parseFloat(amount) > currentBalance ? 'Solde insuffisant' : 'Continuer'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  📱
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Vérification par SMS</h3>
                <p className="text-gray-600">Entrez votre numéro de téléphone pour recevoir un code de confirmation</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+225 XX XX XX XX XX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-medium text-blue-800 mb-2">Récapitulatif</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <div className="flex justify-between">
                    <span>Montant:</span>
                    <span>{amount} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Méthode:</span>
                    <span>{paymentMethods.find(m => m.id === selectedMethod)?.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button 
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50"
                  onClick={() => setStep(1)}
                >
                  Retour
                </button>
                <button 
                  className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50"
                  disabled={!phoneNumber || isLoading}
                  onClick={handleSendSMS}
                >
                  {isLoading ? 'Envoi...' : 'Envoyer SMS'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  🔒
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Code de vérification</h3>
                <p className="text-gray-600">Entrez le code à 6 chiffres envoyé au {phoneNumber}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code de vérification
                </label>
                <input
                  type="text"
                  maxLength="6"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg text-center tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="000000"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div className="text-center">
                <button className="text-blue-600 text-sm hover:underline">
                  Renvoyer le code
                </button>
              </div>

              <div className="flex space-x-3">
                <button 
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50"
                  onClick={() => setStep(2)}
                >
                  Retour
                </button>
                <button 
                  className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50"
                  disabled={smsCode.length !== 6 || isLoading}
                  onClick={handleVerifyCode}
                >
                  {isLoading ? 'Vérification...' : 'Vérifier'}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    ✓
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Retrait bien pris en compte !</h3>
                <p className="text-gray-600 mb-4">Veuillez patienter, vous allez recevoir votre argent bientôt.</p>
                
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left">
                  <h4 className="font-medium text-green-800 mb-3">Détails de la transaction</h4>
                  <div className="space-y-2 text-sm text-green-700">
                    <div className="flex justify-between">
                      <span>Montant:</span>
                      <span className="font-medium">{amount} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Méthode:</span>
                      <span className="font-medium">{paymentMethods.find(m => m.id === selectedMethod)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Numéro:</span>
                      <span className="font-medium">{phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimation d'arrivée:</span>
                      <span className="font-medium">{paymentMethods.find(m => m.id === selectedMethod)?.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ID Transaction:</span>
                      <span className="font-medium text-xs">TXN{Date.now().toString().slice(-8)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600"
                onClick={handleClose}
              >
                Terminer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};