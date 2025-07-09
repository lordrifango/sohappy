import React, { useState, useEffect } from 'react';
import { Chat, Channel, MessageList, MessageInput, Window } from 'stream-chat-react';
import { useStreamClient } from './StreamContext';
import 'stream-chat-react/dist/css/v2/index.css';

const TontineChat = ({ tontineId, tontineName, members = [], isVisible = true }) => {
  const { chatClient, streamToken, createTontineChannel, isConnecting } = useStreamClient();
  const [channel, setChannel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chatClient || !streamToken || !tontineId) return;

    const initializeTontineChat = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to get existing channel first
        const existingChannel = chatClient.channel('team', `tontine_${tontineId}`);
        
        try {
          // Check if channel exists by trying to query it
          const channelState = await existingChannel.query();
          
          // Ensure current user is a member
          const currentUserId = streamToken.user_id;
          if (!channelState.members[currentUserId]) {
            await existingChannel.addMembers([currentUserId]);
          }
          
          setChannel(existingChannel);
          console.log('Using existing channel for tontine:', tontineId);
        } catch (watchError) {
          console.log('Channel does not exist, creating new one...');
          // If channel doesn't exist, create it
          const memberIds = members.map(member => {
            if (typeof member === 'string') {
              return member.startsWith('user_') ? member : `user_${member}`;
            }
            return member.id || member.user_id || `user_${member}`;
          });
          
          const newChannel = await createTontineChannel(tontineId, tontineName, memberIds);
          setChannel(newChannel);
          console.log('Created new channel for tontine:', tontineId);
        }
      } catch (error) {
        console.error('Error initializing tontine chat:', error);
        setError('Impossible de charger le chat de la tontine');
      } finally {
        setIsLoading(false);
      }
    };

    initializeTontineChat();
  }, [chatClient, streamToken, tontineId, tontineName, members, createTontineChannel]);

  if (!isVisible) return null;

  if (isConnecting || isLoading) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement du chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!chatClient || !channel) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-gray-600">Impossible de se connecter au chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg" style={{ height: '500px' }}>
      {/* Header */}
      <div className="p-4 border-b bg-purple-50">
        <h3 className="text-lg font-semibold text-purple-800">
          💬 Chat - {tontineName}
        </h3>
        <p className="text-sm text-purple-600">
          {members.length > 0 ? `${members.length} membres` : 'Membres de la tontine'}
        </p>
      </div>

      {/* Chat Content */}
      <div style={{ height: '444px' }}>
        <Chat client={chatClient} theme="messaging light">
          <Channel channel={channel}>
            <Window>
              <MessageList />
              <MessageInput />
            </Window>
          </Channel>
        </Chat>
      </div>
    </div>
  );
};

export default TontineChat;