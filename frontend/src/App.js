import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { PhoneLoginScreen, SMSVerificationScreen } from './AuthComponents';
import { 
  Header, 
  Dashboard, 
  TontineCard, 
  MembersList, 
  SocialFeed, 
  BottomNavigation, 
  FloatingActionButton, 
  CreateTontineModal, 
  AddContactModal, 
  SupportModal,
  NotificationsModal,
  MembersListModal,
  UpcomingToursModal,
  DepositModal,
  WithdrawModal
} from './components';

const TontyApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTontine, setSelectedTontine] = useState(null);
  const [isCreateTontineOpen, setIsCreateTontineOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMembersListOpen, setIsMembersListOpen] = useState(false);
  const [isUpcomingToursOpen, setIsUpcomingToursOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [currency, setCurrency] = useState('FCFA'); // FCFA -> USD -> EUR -> FCFA
  const [dynamicTontines, setDynamicTontines] = useState([]);
  const [currentBalance, setCurrentBalance] = useState(1000000); // Solde en FCFA

  // Mock data pour les tontines
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
      color: 'bg-green-500'
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
      color: 'bg-blue-500'
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
      color: 'bg-purple-500'
    },
    {
      id: 'tfc',
      name: 'TFC',
      fullName: 'Tontine Famille Coulibaly',
      amount: '350 000',
      currency: 'FCFA',
      nextPayment: '1 Mars 2025',
      membersCount: 7,
      startDate: '1 Février 2025',
      endDate: '1 Août 2025',
      remaining: 'Environ 1 mois restant',
      progress: 80,
      color: 'bg-red-500'
    },
    {
      id: 'fcb',
      name: 'FCB',
      fullName: 'Femmes Commerçantes Bietry',
      amount: '200 000',
      currency: 'FCFA',
      nextPayment: '15 Mars 2025',
      membersCount: 9,
      startDate: '15 Février 2025',
      endDate: '15 Octobre 2025',
      remaining: 'Environ 3 mois restants',
      progress: 55,
      color: 'bg-yellow-500'
    },
    {
      id: 'jek',
      name: 'JEK',
      fullName: 'Jeunes Entrepreneurs Koumassi',
      amount: '150 000',
      currency: 'FCFA',
      nextPayment: '1 Avril 2025',
      membersCount: 8,
      startDate: '1 Mars 2025',
      endDate: '1 Octobre 2025',
      remaining: 'Environ 3 mois restants',
      progress: 40,
      color: 'bg-indigo-500'
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

  const handleTontineCreated = (newTontine) => {
    setDynamicTontines(prev => [newTontine, ...prev]);
  };

  const allTontines = [...dynamicTontines, ...mockTontines];

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
    <BrowserRouter>
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
                    tontines={allTontines}
                    onTontineSelect={handleTontineSelect}
                    currency={currency}
                    onCurrencyToggle={handleCurrencyToggle}
                    onMembersClick={() => setIsMembersListOpen(true)}
                    onUpcomingToursClick={() => setIsUpcomingToursOpen(true)}
                    onDepositClick={() => setIsDepositOpen(true)}
                    onWithdrawClick={() => setIsWithdrawOpen(true)}
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
          onCreateTontine={() => setIsCreateTontineOpen(true)}
          onAddContact={() => setIsAddContactOpen(true)}
          onSupport={() => setIsSupportOpen(true)}
        />

        {/* Modals */}
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
        />

        <WithdrawModal 
          isOpen={isWithdrawOpen}
          onClose={() => setIsWithdrawOpen(false)}
        />
      </div>
    </BrowserRouter>
  );
};

export default TontyApp;