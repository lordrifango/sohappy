import React, { useState, useEffect } from 'react';
import { 
  Chat, 
  Channel, 
  ChannelList, 
  Window, 
  ChannelHeader, 
  MessageList, 
  MessageInput, 
  Thread,
  ChannelSearch,
  MessageSearchBar,
  ChannelListHeader,
  LoadingIndicator
} from 'stream-chat-react';
import { useStreamClient } from './StreamContext';
import 'stream-chat-react/dist/css/v2/index.css';

const ChatContainer = ({ tontineId = null, channelId = null, channelType = null, onClose }) => {
  const { chatClient, streamToken, isConnecting } = useStreamClient();
  const [channel, setChannel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [showChannelList, setShowChannelList] = useState(true);

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
          setSelectedChannel(tontineChannel);
          setShowChannelList(false); // Hide channel list for specific tontine
        } else if (channelId && channelType === 'direct') {
          // Load specific direct channel
          const directChannel = chatClient.channel('messaging', channelId);
          await directChannel.watch();
          setChannel(directChannel);
          setSelectedChannel(directChannel);
          setShowChannelList(false); // Hide channel list for direct message
        } else {
          // For general chat, show channel list
          setChannel(null);
          setSelectedChannel(null);
          setShowChannelList(true);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, [chatClient, streamToken, tontineId, channelId, channelType]);

  // Custom channel preview component
  const ChannelPreview = ({ channel, setActiveChannel }) => {
    const handleChannelClick = () => {
      setActiveChannel(channel);
      setSelectedChannel(channel);
      setShowChannelList(false); // Hide channel list when channel is selected
    };

    return (
      <div 
        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
        onClick={handleChannelClick}
      >
        <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
          {channel.data.name ? channel.data.name[0].toUpperCase() : '#'}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              {channel.data.name || 'Canal sans nom'}
            </h4>
            <span className="text-xs text-gray-500">
              {channel.state.last_message_at && 
                new Date(channel.state.last_message_at).toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })
              }
            </span>
          </div>
          <p className="text-sm text-gray-500 truncate">
            {channel.state.messages?.length > 0 
              ? channel.state.messages[channel.state.messages.length - 1]?.text || 'Aucun message'
              : 'Aucun message'
            }
          </p>
        </div>
      </div>
    );
  };

  // Custom message component
  const CustomMessage = ({ message, isOwn }) => {
    return (
      <div className={`mb-4 ${isOwn ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block p-3 rounded-lg max-w-xs ${
          isOwn 
            ? 'bg-purple-500 text-white' 
            : 'bg-gray-200 text-gray-900'
        }`}>
          <p className="text-sm">{message.text}</p>
          <p className="text-xs mt-1 opacity-75">
            {new Date(message.created_at).toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>
    );
  };

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

  if (!chatClient) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">Impossible de se connecter au chat</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Filters for channels
  const filters = {
    type: 'messaging',
    members: { $in: [streamToken.user_id] }
  };

  const tontineFilters = {
    type: 'team',
    members: { $in: [streamToken.user_id] }
  };

  const sort = { last_message_at: -1 };
  const options = { state: true, watch: true, presence: true };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
        <div className="flex items-center space-x-3">
          {!showChannelList && selectedChannel && (
            <button
              onClick={() => {
                setShowChannelList(true);
                setSelectedChannel(null);
              }}
              className="text-violet-600 hover:text-violet-800 flex items-center space-x-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Retour</span>
            </button>
          )}
          <h1 className="text-xl font-semibold text-gray-800">
            {!showChannelList && selectedChannel 
              ? (selectedChannel.data.name || 'Chat') 
              : (tontineId ? 'Chat Tontine' : 'Messages')
            }
          </h1>
        </div>
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

      {/* Main Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        <Chat client={chatClient} theme="messaging light">
          {/* Channel List - Hidden on mobile when channel is selected */}
          {showChannelList && (
            <div className={`${selectedChannel ? 'hidden md:block' : 'block'} w-full md:w-80 border-r border-gray-200 bg-gray-50`}>
              <div className="p-4 border-b bg-white">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Messages</h2>
                <ChannelSearch />
              </div>
              
              {/* Direct Messages */}
              <div className="p-4 border-b bg-white">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Messages privés</h3>
                <ChannelList
                  filters={filters}
                  sort={sort}
                  options={options}
                  Preview={ChannelPreview}
                />
              </div>

              {/* Tontine Channels */}
              <div className="p-4 bg-white">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Chats Tontine</h3>
                <ChannelList
                  filters={tontineFilters}
                  sort={sort}
                  options={options}
                  Preview={ChannelPreview}
                />
              </div>
            </div>
          )}

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${!showChannelList ? 'block' : 'hidden md:block'}`}>
            {selectedChannel ? (
              <Channel channel={selectedChannel}>
                <Window>
                  <ChannelHeader />
                  <MessageList />
                  <MessageInput />
                </Window>
                <Thread />
              </Channel>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Bienvenue sur Tonty Chat</h3>
                  <p className="text-gray-600">Sélectionnez une conversation pour commencer</p>
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