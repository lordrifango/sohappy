import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const TutorialContext = createContext();

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

export const TutorialProvider = ({ children }) => {
  const { t } = useTranslation();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false);

  // Tutorial steps configuration
  const tutorialSteps = [
    {
      id: 'welcome',
      title: t('tutorial.welcome_title'),
      message: t('tutorial.welcome_message'),
      target: null, // No specific target for welcome
      position: 'center'
    },
    {
      id: 'dashboard',
      title: t('tutorial.dashboard_title'),
      message: t('tutorial.dashboard_message'),
      target: '.dashboard-balance', // Target the balance card
      position: 'bottom'
    },
    {
      id: 'objectives',
      title: t('tutorial.objectives_title'),
      message: t('tutorial.objectives_message'),
      target: '.floating-action-button', // Target the FAB
      position: 'left'
    },
    {
      id: 'balance',
      title: t('tutorial.balance_title'),
      message: t('tutorial.balance_message'),
      target: '.balance-actions', // Target deposit/withdraw buttons
      position: 'top'
    },
    {
      id: 'social',
      title: t('tutorial.social_title'),
      message: t('tutorial.social_message'),
      target: '.bottom-navigation', // Target the social tab
      position: 'top'
    }
  ];

  const startTutorial = () => {
    setIsActive(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    setIsActive(false);
    setHasCompletedTutorial(true);
    localStorage.setItem('tonty_tutorial_completed', 'true');
  };

  const completeTutorial = () => {
    setIsActive(false);
    setHasCompletedTutorial(true);
    localStorage.setItem('tonty_tutorial_completed', 'true');
    
    // Update user profile to mark tutorial as completed
    updateTutorialCompletion();
  };

  const updateTutorialCompletion = async () => {
    try {
      const sessionId = localStorage.getItem('tonty_session_id');
      if (!sessionId) return;

      const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
      
      await fetch(`${backendUrl}/api/profile/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          has_completed_tutorial: true
        })
      });
    } catch (error) {
      console.error('Error updating tutorial completion:', error);
    }
  };

  const checkTutorialStatus = () => {
    const completed = localStorage.getItem('tonty_tutorial_completed');
    if (completed === 'true') {
      setHasCompletedTutorial(true);
    }
  };

  useEffect(() => {
    checkTutorialStatus();
  }, []);

  const value = {
    isActive,
    currentStep,
    tutorialSteps,
    hasCompletedTutorial,
    startTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
      {isActive && <TutorialOverlay />}
    </TutorialContext.Provider>
  );
};

// Tutorial Overlay Component
const TutorialOverlay = () => {
  const { t } = useTranslation();
  const { 
    currentStep, 
    tutorialSteps, 
    nextStep, 
    previousStep, 
    skipTutorial 
  } = useTutorial();
  const [targetElement, setTargetElement] = useState(null);
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0 });

  const currentStepData = tutorialSteps[currentStep];

  useEffect(() => {
    if (currentStepData.target) {
      const element = document.querySelector(currentStepData.target);
      setTargetElement(element);
      
      if (element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        // Calculate position based on target and desired position
        let top, left;
        
        switch (currentStepData.position) {
          case 'bottom':
            top = rect.bottom + scrollTop + 10;
            left = rect.left + scrollLeft + (rect.width / 2) - 200; // Center tooltip
            break;
          case 'top':
            top = rect.top + scrollTop - 10 - 200; // Tooltip height approximation
            left = rect.left + scrollLeft + (rect.width / 2) - 200;
            break;
          case 'left':
            top = rect.top + scrollTop + (rect.height / 2) - 100;
            left = rect.left + scrollLeft - 420;
            break;
          case 'right':
            top = rect.top + scrollTop + (rect.height / 2) - 100;
            left = rect.right + scrollLeft + 10;
            break;
          default:
            top = rect.top + scrollTop + rect.height + 10;
            left = rect.left + scrollLeft;
        }
        
        // Ensure tooltip stays within viewport
        top = Math.max(10, Math.min(top, window.innerHeight - 220));
        left = Math.max(10, Math.min(left, window.innerWidth - 420));
        
        setOverlayPosition({ top, left });
        
        // Scroll element into view
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }
    } else {
      // Center the tooltip for steps without targets (like welcome)
      setOverlayPosition({
        top: window.innerHeight / 2 - 150,
        left: window.innerWidth / 2 - 200
      });
    }
  }, [currentStep, currentStepData]);

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-60" />
      
      {/* Highlight target element */}
      {targetElement && (
        <div
          className="absolute border-4 border-violet-500 rounded-lg pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top + window.pageYOffset - 4,
            left: targetElement.getBoundingClientRect().left + window.pageXOffset - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
          }}
        />
      )}
      
      {/* Tutorial tooltip */}
      <div
        className="absolute bg-white rounded-2xl shadow-2xl p-6 w-96 border border-gray-200"
        style={{
          top: overlayPosition.top,
          left: overlayPosition.left
        }}
      >
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index <= currentStep ? 'bg-violet-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <button
            onClick={skipTutorial}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            {t('tutorial.skip')}
          </button>
        </div>
        
        {/* Content */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            {currentStepData.title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {currentStepData.message}
          </p>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={previousStep}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {t('tutorial.previous')}
          </button>
          
          <div className="text-sm text-gray-500 flex items-center">
            {currentStep + 1} / {tutorialSteps.length}
          </div>
          
          <button
            onClick={nextStep}
            className="px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
          >
            {currentStep === tutorialSteps.length - 1 ? t('tutorial.finish') : t('tutorial.next')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Tutorial Completion Modal
export const TutorialCompletionModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {t('tutorial.completed')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('tutorial.completed_message')}
        </p>
        <button
          onClick={onClose}
          className="w-full bg-violet-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-violet-600 transition-colors"
        >
          {t('common.continue')}
        </button>
      </div>
    </div>
  );
};