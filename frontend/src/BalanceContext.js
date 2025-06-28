import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const BalanceContext = createContext();

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
};

export const BalanceProvider = ({ children }) => {
  const { userPhone, userCountry, isAuthenticated } = useAuth();
  const [balance, setBalance] = useState(1000000); // Solde initial par défaut
  const [transactions, setTransactions] = useState([]);

  // Clé unique pour chaque utilisateur basée sur son téléphone
  const getUserKey = () => {
    if (!userPhone || !userCountry) return null;
    return `tonty_user_${userCountry}_${userPhone}`;
  };

  // Charger le solde depuis localStorage quand l'utilisateur se connecte
  useEffect(() => {
    if (isAuthenticated && userPhone && userCountry) {
      const userKey = getUserKey();
      if (userKey) {
        const savedBalance = localStorage.getItem(`${userKey}_balance`);
        const savedTransactions = localStorage.getItem(`${userKey}_transactions`);
        
        if (savedBalance) {
          setBalance(parseFloat(savedBalance));
        }
        
        if (savedTransactions) {
          try {
            setTransactions(JSON.parse(savedTransactions));
          } catch (error) {
            console.error('Error parsing saved transactions:', error);
            setTransactions([]);
          }
        }
      }
    }
  }, [isAuthenticated, userPhone, userCountry]);

  // Sauvegarder le solde dans localStorage
  const saveBalance = (newBalance) => {
    const userKey = getUserKey();
    if (userKey) {
      localStorage.setItem(`${userKey}_balance`, newBalance.toString());
    }
  };

  // Sauvegarder les transactions dans localStorage
  const saveTransactions = (newTransactions) => {
    const userKey = getUserKey();
    if (userKey) {
      localStorage.setItem(`${userKey}_transactions`, JSON.stringify(newTransactions));
    }
  };

  // Déposer de l'argent
  const deposit = (amount, method = 'Mobile Money') => {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      throw new Error('Montant invalide');
    }

    const newBalance = balance + depositAmount;
    const transaction = {
      id: Date.now().toString(),
      type: 'deposit',
      amount: depositAmount,
      method: method,
      date: new Date().toISOString(),
      description: `Dépôt via ${method}`
    };

    setBalance(newBalance);
    const newTransactions = [transaction, ...transactions];
    setTransactions(newTransactions);

    saveBalance(newBalance);
    saveTransactions(newTransactions);

    return { success: true, newBalance, transaction };
  };

  // Retirer de l'argent
  const withdraw = (amount, method = 'Mobile Money') => {
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      throw new Error('Montant invalide');
    }

    if (withdrawAmount > balance) {
      throw new Error('Solde insuffisant');
    }

    const newBalance = balance - withdrawAmount;
    const transaction = {
      id: Date.now().toString(),
      type: 'withdraw',
      amount: withdrawAmount,
      method: method,
      date: new Date().toISOString(),
      description: `Retrait via ${method}`
    };

    setBalance(newBalance);
    const newTransactions = [transaction, ...transactions];
    setTransactions(newTransactions);

    saveBalance(newBalance);
    saveTransactions(newTransactions);

    return { success: true, newBalance, transaction };
  };

  // Formatage du solde avec séparateurs
  const formatBalance = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  // Conversion de devise (approximative)
  const convertBalance = (currency) => {
    switch(currency) {
      case 'USD':
        return Math.round(balance * 0.00165); // 1 FCFA ≈ 0.00165 USD
      case 'EUR':
        return Math.round(balance * 0.00152); // 1 FCFA ≈ 0.00152 EUR
      default:
        return balance;
    }
  };

  const value = {
    balance,
    transactions,
    deposit,
    withdraw,
    formatBalance,
    convertBalance
  };

  return (
    <BalanceContext.Provider value={value}>
      {children}
    </BalanceContext.Provider>
  );
};