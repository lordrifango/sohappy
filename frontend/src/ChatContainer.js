import React, { useState, useEffect } from 'react';
import { Chat, Channel, ChannelList, MessageList, MessageInput, Thread, Window } from 'stream-chat-react';
import { useStreamClient } from './StreamContext';
import 'stream-chat-react/dist/css/v2/index.css';

const filters = { type: 'messaging', members: { $in: ['user_id'] } };
const sort = { last_message_at: -1 };

const ChatContainer = ({ tontineId = null, channelId = null, channelType = null, onClose }) => {
  const { chatClient, streamToken, isConnecting } = useStreamClient();
  const [channel, setChannel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chatClient || !streamToken) return;

    const initializeChat = async () => {
      try {
        setIsLoading(true);
        
        if (tontineId) {
          // Load specific tontine channel
          const tontineChannel = chatClient.channel('team', `tontine_${tontineId}`);
          await tontineChannel.watch();
          setChannel(tontineChannel);
        } else if (channelId && channelType === 'direct') {
          // Load specific direct channel
          const directChannel = chatClient.channel('messaging', channelId);
          await directChannel.watch();
          setChannel(directChannel);
        } else {
          // For general chat, don't set a specific channel - let user select from list
          setChannel(null);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, [chatClient, streamToken, tontineId, channelId, channelType]);

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

  if (!chatClient) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-gray-600">Impossible de se connecter au chat</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const customFilters = { 
    type: 'messaging', 
    members: { $in: [streamToken.user_id] } 
  };

  return (
    <div className="bg-white rounded-lg shadow-lg" style={{ height: '600px' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">
          {tontineId ? 'Chat Tontine' : channelId ? 'Chat Direct' : 'Messages'}
        </h3>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Chat Content */}
      <div className="flex" style={{ height: '540px' }}>
        <Chat client={chatClient} theme="messaging light">
          {/* Channel List */}
          {!tontineId && (
            <div className="w-1/3 border-r">
              <ChannelList
                filters={customFilters}
                sort={sort}
                onSelect={setChannel}
                options={{ state: true, watch: true, presence: true }}
              />
            </div>
          )}

          {/* Messages Area */}
          <div className={tontineId ? 'w-full' : 'w-2/3'}>
            {channel ? (
              <Channel channel={channel}>
                <Window>
                  <MessageList />
                  <MessageInput />
                </Window>
                <Thread />
              </Channel>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">Sélectionnez une conversation</p>
                </div>
              </div>
            )}
          </div>
        </Chat>
      </div>
    </div>
  );
};

export default ChatContainer;