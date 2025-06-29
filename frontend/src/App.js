import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { BalanceProvider, useBalance } from './BalanceContext';
import { PremiumProvider, usePremium } from './PremiumContext';
import { PhoneLoginScreen, SMSVerificationScreen } from './AuthComponents';
import { 
  Header, 
  Dashboard, 
  TontineCard, 
  MembersList, 
  SocialFeed, 
  BottomNavigation, 
  FloatingActionButton, 
  GoalTypeSelectionModal,
  PersonalGoalModal,
  FundModal,
  CreateTontineModal, 
  AddContactModal, 
  SupportModal,
  NotificationsModal,
  MembersListModal,
  UpcomingToursModal,
  DepositModal,
  WithdrawModal,
  PremiumModal,
  PricingPage
} from './components';

const TontyApp = () => {
  const { balance, formatBalance, deposit, withdraw } = useBalance();
  const { 
    isPremium, 
    canCreateTontine, 
    canCreateGoal, 
    canCreateFund, 
    addTontine, 
    addGoal, 
    addFund,
    tontinesCount,
    goalsCount,
    fundsCount,
    FREE_LIMITS,
    activatePremium
  } = usePremium();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTontine, setSelectedTontine] = useState(null);
  
  // Modaux d'objectifs
  const [isGoalTypeSelectionOpen, setIsGoalTypeSelectionOpen] = useState(false);
  const [isPersonalGoalOpen, setIsPersonalGoalOpen] = useState(false);
  const [isFundOpen, setIsFundOpen] = useState(false);
  const [isCreateTontineOpen, setIsCreateTontineOpen] = useState(false);
  
  // Premium modals
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [premiumModalType, setPremiumModalType] = useState('');
  const [isPricingPageOpen, setIsPricingPageOpen] = useState(false);
  
  // Autres modaux
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMembersListOpen, setIsMembersListOpen] = useState(false);
  const [isUpcomingToursOpen, setIsUpcomingToursOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  
  const [notifications, setNotifications] = useState(3);
  const [currency, setCurrency] = useState('FCFA'); // FCFA -> USD -> EUR -> FCFA

  // Mock data pour les tontines (réduit à 3 pour respecter la limite gratuite)
  const mockTontines = [
    {
      id: 'tfk',
      name: 'TFK',
      fullName: 'Tontine Familiale Konaté',
      amount: '250 000',
      currency: 'FCFA',
      nextPayment: '15 Février 2025',
      membersCount: 8,
      startDate: '15 Janvier 2025',
      endDate: '15 Août 2025',
      remaining: 'Environ 1 mois restant',
      progress: 75,
      color: 'bg-green-500',
      type: 'tontine'
    },
    {
      id: 'gaa',
      name: 'GAA',
      fullName: 'Groupe Amis Abidjan',
      amount: '100 000',
      currency: 'FCFA',
      nextPayment: '1 Mars 2025',
      membersCount: 11,
      startDate: '1 Février 2025',
      endDate: '1 Décembre 2025',
      remaining: 'Environ 5 mois restants',
      progress: 45,
      color: 'bg-blue-500',
      type: 'tontine'
    },
    {
      id: 'eqb',
      name: 'ÉQB',
      fullName: 'Épargne Quartier Bamako',
      amount: '500 000',
      currency: 'FCFA',
      nextPayment: '15 Avril 2025',
      membersCount: 15,
      startDate: '15 Mars 2025',
      endDate: '15 Mai 2026',
      remaining: 'Environ 10 mois restants',
      progress: 30,
      color: 'bg-purple-500',
      type: 'tontine'
    }
  ];

  // Mock data pour les membres
  const mockMembers = {
    tfk: [
      { id: 1, name: 'Mariam Konaté', role: 'Administrateur', status: 'Actif', badges: ['Digne de confiance', 'Principal'], avatar: 'MK', color: 'bg-red-500' },
      { id: 2, name: 'Aminata Koné', role: 'Membre', status: 'Actif', badges: ['Digne de confiance', 'Principal'], avatar: 'AK', color: 'bg-orange-500' },
      { id: 3, name: 'Fatou Diallo', role: 'Membre', status: 'Actif', badges: ['Principal'], avatar: 'FD', color: 'bg-red-600' },
      { id: 4, name: 'Ibrahim Touré', role: 'Membre', status: 'Actif', badges: ['Principal'], avatar: 'IT', color: 'bg-orange-400' },
      { id: 5, name: 'Moussa Camara', role: 'Membre', status: 'Actif', badges: ['Principal'], avatar: 'MC', color: 'bg-yellow-400' },
      { id: 6, name: 'Sekou Sylla', role: 'Membre', status: 'En retard', badges: [], avatar: 'SS', color: 'bg-yellow-300' },
      { id: 7, name: 'Kadiatou Bah', role: 'Membre', status: 'Excusé', badges: [], avatar: 'KB', color: 'bg-green-400' },
      { id: 8, name: 'Oumar Barry', role: 'Membre', status: 'En retard', badges: [], avatar: 'OB', color: 'bg-green-500' }
    ]
  };

  const handleTontineSelect = (tontine) => {
    setSelectedTontine(tontine);
    setActiveTab('members');
  };

  const handleBackToDashboard = () => {
    setSelectedTontine(null);
    setActiveTab('dashboard');
  };

  const handleCurrencyToggle = () => {
    const currencies = ['FCFA', 'USD', 'EUR'];
    const currentIndex = currencies.indexOf(currency);
    const nextIndex = (currentIndex + 1) % currencies.length;
    setCurrency(currencies[nextIndex]);
  };

  const handleGoalTypeSelection = (type) => {
    // Vérifier les limites avant d'ouvrir les modaux
    if (type === 'personal') {
      if (canCreateGoal()) {
        setIsPersonalGoalOpen(true);
      } else {
        setPremiumModalType('personalGoal');
        setIsPremiumModalOpen(true);
      }
    } else if (type === 'fund') {
      if (canCreateFund()) {
        setIsFundOpen(true);
      } else {
        setPremiumModalType('fund');
        setIsPremiumModalOpen(true);
      }
    } else if (type === 'tontine') {
      if (canCreateTontine()) {
        setIsCreateTontineOpen(true);
      } else {
        setPremiumModalType('tontine');
        setIsPremiumModalOpen(true);
      }
    }
    setIsGoalTypeSelectionOpen(false);
  };

  const handlePersonalGoalCreated = (newGoal) => {
    addGoal(newGoal);
    console.log('Personal goal created:', newGoal);
  };
  
  const handleTontineCreated = (newTontine) => {
    addTontine(newTontine);
  };

  const handleFundCreated = (newFund) => {
    addFund(newFund);
    console.log('Cagnotte créée:', newFund);
    // Afficher un message de succès
    alert('🎉 Cagnotte créée avec succès ! Elle est maintenant visible dans vos objectifs.');
  };

  // Obtenir tous les objectifs (tontines créées + mock tontines + objectifs personnels + cagnottes)
  const { userTontines, userGoals, userFunds } = usePremium();
  
  // Transformer les objectifs personnels et cagnottes pour l'affichage
  const transformedGoals = userGoals.map(goal => ({
    ...goal,
    type: 'personal_goal',
    name: goal.title,
    fullName: goal.title,
    amount: goal.targetAmount,
    currency: 'FCFA',
    nextPayment: 'Objectif personnel',
    remaining: `Échéance: ${goal.deadline}`,
    progress: goal.progress || 0,
    color: 'bg-indigo-500'
  }));

  const transformedFunds = userFunds.map(fund => ({
    ...fund,
    type: 'fund',
    name: fund.title,
    fullName: fund.title,
    amount: fund.targetAmount,
    currency: 'FCFA',
    nextPayment: 'Cagnotte',
    remaining: `Échéance: ${fund.deadline}`,
    progress: fund.progress || 0,
    color: 'bg-pink-500'
  }));

  // Combiner tous les objectifs avec un maximum de 3 mock tontines pour les non-premium
  const allObjectives = [
    ...userTontines.map(t => ({...t, type: 'tontine'})), 
    ...transformedGoals,
    ...transformedFunds,
    ...mockTontines
  ];

  // Handlers pour les modaux premium
  const handleUpgradeToPremium = () => {
    setIsPremiumModalOpen(false);
    setIsPricingPageOpen(true);
  };

  const handleSelectPremium = () => {
    // Simuler l'activation du premium (en réalité, cela passerait par un processus de paiement)
    activatePremium(1); // 1 mois
    setIsPricingPageOpen(false);
    
    // Afficher une notification de succès
    alert('🎉 Félicitations ! Vous êtes maintenant Premium ! Profitez de toutes les fonctionnalités illimitées.');
  };

  // Fonction pour gérer les changements de solde
  const handleBalanceChange = (amount, type, method) => {
    try {
      if (type === 'deposit') {
        return deposit(amount, method);
      } else if (type === 'withdraw') {
        return withdraw(amount, method);
      }
    } catch (error) {
      throw error;
    }
  };


  // Mock contacts data
  const mockContacts = [
    { id: 1, name: 'Amadou Diallo', status: 'En ligne', avatar: 'AD', color: 'bg-green-500', lastSeen: 'maintenant' },
    { id: 2, name: 'Awa Traoré', status: 'En ligne', avatar: 'AT', color: 'bg-blue-500', lastSeen: 'maintenant' },
    { id: 3, name: 'Boubacar Koné', status: 'Hors ligne', avatar: 'BK', color: 'bg-gray-500', lastSeen: 'il y a 5 min' },
    { id: 4, name: 'Fatou Camara', status: 'En ligne', avatar: 'FC', color: 'bg-purple-500', lastSeen: 'maintenant' },
    { id: 5, name: 'Ibrahim Sylla', status: 'Hors ligne', avatar: 'IS', color: 'bg-red-500', lastSeen: 'il y a 1h' }
  ];

  // Mock upcoming tours data
  const mockUpcomingTours = [
    { id: 1, tontine: 'TFK', type: 'À payer', amount: '250 000 FCFA', date: '15 Février 2025', color: 'bg-red-500' },
    { id: 2, tontine: 'GAA', type: 'À recevoir', amount: '100 000 FCFA', date: '1 Mars 2025', color: 'bg-green-500' },
    { id: 3, tontine: 'ÉQB', type: 'À payer', amount: '500 000 FCFA', date: '15 Avril 2025', color: 'bg-red-500' },
    { id: 4, tontine: 'TFC', type: 'À payer', amount: '350 000 FCFA', date: '1 Mars 2025', color: 'bg-red-500' },
    { id: 5, tontine: 'FCB', type: 'À recevoir', amount: '200 000 FCFA', date: '15 Mars 2025', color: 'bg-green-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        notifications={notifications} 
        onNotificationClick={() => setIsNotificationsOpen(true)}
      />
      
      <main className="pb-20">
        <Routes>
          <Route path="/" element={
            <>
              {activeTab === 'dashboard' && (
                <Dashboard 
                  tontines={allObjectives}
                  onTontineSelect={handleTontineSelect}
                  currency={currency}
                  onCurrencyToggle={handleCurrencyToggle}
                  onMembersClick={() => setIsMembersListOpen(true)}
                  onUpcomingToursClick={() => setIsUpcomingToursOpen(true)}
                  onDepositClick={() => setIsDepositOpen(true)}
                  onWithdrawClick={() => setIsWithdrawOpen(true)}
                  balance={balance}
                  formatBalance={formatBalance}
                  isPremium={isPremium}
                  tontinesCount={tontinesCount}
                  goalsCount={goalsCount}
                  fundsCount={fundsCount}
                  limits={FREE_LIMITS}
                  onUpgrade={() => setIsPricingPageOpen(true)}
                />
              )}
              
              {activeTab === 'members' && selectedTontine && (
                <MembersList 
                  tontine={selectedTontine}
                  members={mockMembers[selectedTontine.id] || []}
                  onBack={handleBackToDashboard}
                />
              )}
              
              {activeTab === 'social' && (
                <SocialFeed tontines={allTontines} />
              )}
            </>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <BottomNavigation 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'dashboard') {
            setSelectedTontine(null);
          }
        }}
      />

      <FloatingActionButton 
        onCreateGoal={() => setIsGoalTypeSelectionOpen(true)}
        onAddContact={() => setIsAddContactOpen(true)}
        onSupport={() => setIsSupportOpen(true)}
      />

      {/* Modals */}
      <GoalTypeSelectionModal 
        isOpen={isGoalTypeSelectionOpen}
        onClose={() => setIsGoalTypeSelectionOpen(false)}
        onSelectType={handleGoalTypeSelection}
      />

      <PersonalGoalModal 
        isOpen={isPersonalGoalOpen}
        onClose={() => setIsPersonalGoalOpen(false)}
        onGoalCreated={handlePersonalGoalCreated}
      />

      <FundModal 
        isOpen={isFundOpen}
        onClose={() => setIsFundOpen(false)}
        onFundCreated={handleFundCreated}
      />

      <CreateTontineModal 
        isOpen={isCreateTontineOpen}
        onClose={() => setIsCreateTontineOpen(false)}
        onTontineCreated={handleTontineCreated}
      />
      
      <AddContactModal 
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
      />
      
      <SupportModal 
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      <NotificationsModal 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <MembersListModal 
        isOpen={isMembersListOpen}
        onClose={() => setIsMembersListOpen(false)}
        members={mockContacts}
      />

      <UpcomingToursModal 
        isOpen={isUpcomingToursOpen}
        onClose={() => setIsUpcomingToursOpen(false)}
        tours={mockUpcomingTours}
      />

      <DepositModal 
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onBalanceChange={handleBalanceChange}
      />

      <WithdrawModal 
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onBalanceChange={handleBalanceChange}
        currentBalance={balance}
      />

      {/* Premium Modals */}
      <PremiumModal 
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        limitType={premiumModalType}
        onUpgrade={handleUpgradeToPremium}
      />

      <PricingPage 
        isOpen={isPricingPageOpen}
        onClose={() => setIsPricingPageOpen(false)}
        onSelectPremium={handleSelectPremium}
      />
    </div>
  );
};

// Authentication Wrapper Component
const AuthWrapper = () => {
  const { isAuthenticated, loading, login } = useAuth();
  const [authStep, setAuthStep] = useState('phone'); // 'phone' or 'verify'
  const [phoneData, setPhoneData] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authStep === 'phone') {
      return (
        <PhoneLoginScreen 
          onCodeSent={(data) => {
            setPhoneData(data);
            setAuthStep('verify');
          }}
        />
      );
    } else {
      return (
        <SMSVerificationScreen 
          phoneData={phoneData}
          onVerificationSuccess={(data) => {
            login(data.sessionId, data.phone, data.countryCode);
          }}
          onBackToPhone={() => {
            setAuthStep('phone');
            setPhoneData(null);
          }}
        />
      );
    }
  }

  return <PremiumProvider><BalanceProvider><TontyApp /></BalanceProvider></PremiumProvider>;
};

// Main App Component
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthWrapper />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;