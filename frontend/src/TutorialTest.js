import React from 'react';
import { TutorialProvider, useTutorial } from './TutorialContext';

const TutorialTestComponent = () => {
  const { startTutorial, isActive, currentStep, tutorialSteps } = useTutorial();

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Test du Tutoriel</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">État du tutoriel:</h2>
        <p>Actif: {isActive ? 'Oui' : 'Non'}</p>
        <p>Étape actuelle: {currentStep + 1} / {tutorialSteps.length}</p>
        <p>Étape: {tutorialSteps[currentStep]?.id || 'N/A'}</p>
      </div>

      <button 
        onClick={startTutorial}
        className="bg-violet-500 text-white px-6 py-3 rounded-lg hover:bg-violet-600 mb-6"
      >
        🎓 Démarrer le tutoriel
      </button>

      {/* Simulated app elements with proper classes */}
      <div className="space-y-6">
        <div className="balance-actions bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold">💰 Carte de Solde (balance-actions)</h3>
          <p>Cette carte simule la carte de solde principal avec boutons intégrés</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold">📱 Navigation</h3>
          <div className="bottom-navigation bg-gray-50 p-4 rounded flex justify-center space-x-8 mt-4">
            <span>🏠 Mes Objectifs</span>
            <span>👥 Réseau Tonty</span>
          </div>
        </div>
      </div>

      {/* Floating action button */}
      <div 
        className="floating-action-button fixed bottom-8 right-8 w-14 h-14 bg-violet-500 rounded-full flex items-center justify-center text-white shadow-lg"
      >
        <span className="text-2xl">+</span>
      </div>
    </div>
  );
};

export const TutorialTestPage = () => {
  return (
    <TutorialProvider>
      <TutorialTestComponent />
    </TutorialProvider>
  );
};