import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { TontineCard } from './components';

const ProjectListDetailed = ({ 
  tontines = [], 
  onTontineSelect, 
  onBackClick,
  isPremium = false,
  totalObjectivesCount = 0,
  limits = { totalObjectives: 3 }
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-full">
      {/* Header avec bouton retour */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBackClick}
          className="flex items-center space-x-2 text-violet-600 hover:text-violet-700 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="font-medium">Retour</span>
        </button>
      </div>

      {/* Titre de la page */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('dashboard.my_objectives')}</h1>
        <p className="text-gray-600">
          {isPremium ? (
            `${totalObjectivesCount} objectifs créés - Illimité`
          ) : (
            `${totalObjectivesCount}/${limits.totalObjectives} objectifs créés`
          )}
        </p>
      </div>

      {/* Barre de progression */}
      {!isPremium && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">{t('dashboard.objectives_created')}</span>
            <span className="text-sm font-bold text-gray-800">
              {totalObjectivesCount}/{limits.totalObjectives}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                (totalObjectivesCount / limits.totalObjectives) * 100 >= 100 ? 'bg-red-400' : 'bg-violet-500'
              }`}
              style={{ width: `${Math.min((totalObjectivesCount / limits.totalObjectives) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            {`${limits.totalObjectives - totalObjectivesCount} ${t('dashboard.objectives_remaining')}`}
          </p>
        </div>
      )}

      {/* Liste détaillée des objectifs */}
      <div>
        {tontines.length > 0 ? (
          <div className="space-y-4">
            {tontines.map((tontine) => (
              <TontineCard 
                key={tontine.id} 
                tontine={tontine} 
                onClick={() => onTontineSelect(tontine)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
            <div className="text-gray-400 mb-4">
              <span className="text-4xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Aucun objectif créé
            </h3>
            <p className="text-gray-600 mb-6">
              Créez votre premier objectif en utilisant le bouton + en bas à droite
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectListDetailed;