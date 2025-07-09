import React, { useState, useEffect } from 'react';
import { 
  Chat, 
  Channel, 
  Window, 
  ChannelHeader, 
  MessageList, 
  MessageInput, 
  Thread,
  LoadingIndicator
} from 'stream-chat-react';
import { useStreamClient } from './StreamContext';
import 'stream-chat-react/dist/css/v2/index.css';

const TontineChat = ({ tontineId, tontineName, members = [], isVisible = true, onClose }) => {
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
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingIndicator />
          <p className="text-gray-600 mt-2">Chargement du chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!chatClient || !channel) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Impossible de se connecter au chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Custom Header */}
      <div className="flex items-center justify-between p-4 border-b bg-purple-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-purple-800">
              {tontineName}
            </h1>
            <p className="text-sm text-purple-600">
              {members.length > 0 ? `${members.length} membres` : 'Membres de la tontine'}
            </p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-purple-500 hover:text-purple-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        <Chat client={chatClient} theme="messaging light">
          <Channel channel={channel}>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput />
            </Window>
            <Thread />
          </Channel>
        </Chat>
      </div>
    </div>
  );
};

export default TontineChat;