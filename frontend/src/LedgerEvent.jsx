import React from 'react';

// Icônes pour les différents types d'événements
const getEventIcon = (iconName) => {
  const icons = {
    'cash': '💰',
    'arrow-right': '➡️', 
    'flag': '🏁',
    'lock-closed': '🔒',
    'calendar': '📅',
    'users': '👥',
    'check': '✅',
    'star': '⭐'
  };
  
  return icons[iconName] || '📌';
};

// Composant LedgerEvent - Événement système immuable
const LedgerEvent = ({ event }) => {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Il y a quelques minutes';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) {
        return 'Hier';
      } else if (diffInDays < 7) {
        return `Il y a ${diffInDays} jours`;
      } else {
        return date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl border-l-4 border-violet-500 p-4 mb-3 relative">
      {/* Conteneur principal avec bordure gauche violette pour marquer l'immuabilité */}
      <div className="flex items-start space-x-3">
        {/* Icône contextuelle */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-lg">
            {getEventIcon(event.icon_name)}
          </div>
        </div>
        
        {/* Contenu de l'événement */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Contenu textuel factuel */}
              <p className="text-gray-800 font-medium text-sm leading-relaxed">
                {event.content}
              </p>
              
              {/* Horodatage précis */}
              <p className="text-gray-500 text-xs mt-2 font-medium">
                {formatTimestamp(event.timestamp)}
              </p>
            </div>
            
            {/* Icône de cadenas avec tooltip pour indiquer l'immuabilité */}
            <div className="flex-shrink-0 ml-2">
              <div 
                className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                title="Cet événement est inscrit de façon permanente dans le registre du groupe et ne peut être ni modifié, ni supprimé."
              >
                🔒
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Indicateur discret d'événement système */}
      <div className="absolute top-2 right-2">
        <div className="w-2 h-2 bg-violet-500 rounded-full opacity-60"></div>
      </div>
    </div>
  );
};

export default LedgerEvent;