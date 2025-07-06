import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [userPhone, setUserPhone] = useState(null);
  const [userCountry, setUserCountry] = useState(null);
  const [loading, setLoading] = useState(true);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  // Check existing session on app load
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const storedSessionId = localStorage.getItem('tonty_session_id');
      if (!storedSessionId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${backendUrl}/api/auth/check-session/${storedSessionId}`);
      const data = await response.json();

      if (data.valid) {
        setIsAuthenticated(true);
        setSessionId(storedSessionId);
        setUserPhone(data.phone);
        setUserCountry(data.country_code);
      } else {
        localStorage.removeItem('tonty_session_id');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      localStorage.removeItem('tonty_session_id');
    } finally {
      setLoading(false);
    }
  };

  const login = (sessionId, phone, countryCode) => {
    console.log('Login called with:', { sessionId, phone, countryCode });
    setIsAuthenticated(true);
    setSessionId(sessionId);
    setUserPhone(phone);
    setUserCountry(countryCode);
    localStorage.setItem('tonty_session_id', sessionId);
    
    // Force re-render by triggering a state update
    setLoading(false);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setSessionId(null);
    setUserPhone(null);
    setUserCountry(null);
    localStorage.removeItem('tonty_session_id');
  };

  const value = {
    isAuthenticated,
    sessionId,
    userPhone,
    userCountry,
    loading,
    login,
    logout,
    checkExistingSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};