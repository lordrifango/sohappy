import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const PremiumContext = createContext();

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};

export const PremiumProvider = ({ children }) => {
  const { userPhone, userCountry, isAuthenticated } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpiryDate, setPremiumExpiryDate] = useState(null);
  const [userTontines, setUserTontines] = useState([]);
  const [userGoals, setUserGoals] = useState([]);
  const [userFunds, setUserFunds] = useState([]);

  // Limites pour utilisateurs gratuits
  const FREE_LIMITS = {
    tontines: 3,
    personalGoals: 1,
    funds: 1,
    transactionHistory: 30 // jours
  };

  // Clé unique pour chaque utilisateur
  const getUserKey = () => {
    if (!userPhone || !userCountry) return null;
    return `tonty_user_${userCountry}_${userPhone}`;
  };

  // Charger le statut premium depuis localStorage
  useEffect(() => {
    if (isAuthenticated && userPhone && userCountry) {
      const userKey = getUserKey();
      if (userKey) {
        const savedPremiumStatus = localStorage.getItem(`${userKey}_premium`);
        const savedExpiryDate = localStorage.getItem(`${userKey}_premium_expiry`);
        const savedTontines = localStorage.getItem(`${userKey}_tontines`);
        const savedGoals = localStorage.getItem(`${userKey}_goals`);
        const savedFunds = localStorage.getItem(`${userKey}_funds`);

        if (savedPremiumStatus === 'true' && savedExpiryDate) {
          const expiryDate = new Date(savedExpiryDate);
          if (expiryDate > new Date()) {
            setIsPremium(true);
            setPremiumExpiryDate(expiryDate);
          } else {
            // Abonnement expiré
            setIsPremium(false);
            setPremiumExpiryDate(null);
            localStorage.removeItem(`${userKey}_premium`);
            localStorage.removeItem(`${userKey}_premium_expiry`);
          }
        }

        // Charger les données utilisateur
        if (savedTontines) {
          try {
            setUserTontines(JSON.parse(savedTontines));
          } catch (error) {
            console.error('Error parsing tontines:', error);
          }
        }

        if (savedGoals) {
          try {
            setUserGoals(JSON.parse(savedGoals));
          } catch (error) {
            console.error('Error parsing goals:', error);
          }
        }

        if (savedFunds) {
          try {
            setUserFunds(JSON.parse(savedFunds));
          } catch (error) {
            console.error('Error parsing funds:', error);
          }
        }
      }
    }
  }, [isAuthenticated, userPhone, userCountry]);

  // Activer le premium
  const activatePremium = (durationMonths = 1) => {
    const userKey = getUserKey();
    if (userKey) {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
      
      setIsPremium(true);
      setPremiumExpiryDate(expiryDate);
      
      localStorage.setItem(`${userKey}_premium`, 'true');
      localStorage.setItem(`${userKey}_premium_expiry`, expiryDate.toISOString());
    }
  };

  // Vérifier si l'utilisateur peut créer plus d'éléments
  const canCreateTontine = () => {
    return isPremium || userTontines.length < FREE_LIMITS.tontines;
  };

  const canCreateGoal = () => {
    return isPremium || userGoals.length < FREE_LIMITS.personalGoals;
  };

  const canCreateFund = () => {
    return isPremium || userFunds.length < FREE_LIMITS.funds;
  };

  // Ajouter des éléments avec sauvegarde
  const addTontine = (tontine) => {
    const newTontines = [...userTontines, tontine];
    setUserTontines(newTontines);
    
    const userKey = getUserKey();
    if (userKey) {
      localStorage.setItem(`${userKey}_tontines`, JSON.stringify(newTontines));
    }
  };

  const addGoal = (goal) => {
    const newGoals = [...userGoals, goal];
    setUserGoals(newGoals);
    
    const userKey = getUserKey();
    if (userKey) {
      localStorage.setItem(`${userKey}_goals`, JSON.stringify(newGoals));
    }
  };

  const addFund = (fund) => {
    const newFunds = [...userFunds, fund];
    setUserFunds(newFunds);
    
    const userKey = getUserKey();
    if (userKey) {
      localStorage.setItem(`${userKey}_funds`, JSON.stringify(newFunds));
    }
  };

  // Calculer les jours restants de premium
  const getPremiumDaysLeft = () => {
    if (!isPremium || !premiumExpiryDate) return 0;
    const now = new Date();
    const diffTime = premiumExpiryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const value = {
    isPremium,
    premiumExpiryDate,
    activatePremium,
    getPremiumDaysLeft,
    
    // Limites et vérifications
    FREE_LIMITS,
    canCreateTontine,
    canCreateGoal,
    canCreateFund,
    
    // Données utilisateur
    userTontines,
    userGoals,
    userFunds,
    addTontine,
    addGoal,
    addFund,
    
    // Statistiques
    tontinesCount: userTontines.length,
    goalsCount: userGoals.length,
    fundsCount: userFunds.length
  };

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
};