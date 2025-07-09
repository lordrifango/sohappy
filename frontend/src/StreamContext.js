import React, { createContext, useContext, useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { useAuth } from './AuthContext';

const StreamContext = createContext();

export const useStreamClient = () => {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error('useStreamClient must be used within a StreamProvider');
  }
  return context;
};

export const StreamProvider = ({ children }) => {
  const [chatClient, setChatClient] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [streamToken, setStreamToken] = useState(null);
  const { sessionId } = useAuth();

  useEffect(() => {
    const initializeStream = async () => {
      if (!sessionId || isConnecting) return;

      setIsConnecting(true);
      
      try {
        // Get Stream token from backend
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ session_id: sessionId }),
        });

        if (!response.ok) {
          throw new Error('Failed to get Stream token');
        }

        const tokenData = await response.json();
        setStreamToken(tokenData);

        // Initialize Stream client
        const client = StreamChat.getInstance(process.env.REACT_APP_STREAM_API_KEY);
        
        // Connect user with proper user object
        await client.connectUser(
          {
            id: tokenData.user_id,
            name: tokenData.username,
            // Add additional user properties for better chat experience
            image: tokenData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(tokenData.username)}&background=random`,
            role: 'user',
          },
          tokenData.token
        );

        setChatClient(client);
        console.log('Stream client initialized successfully', {
          user_id: tokenData.user_id,
          username: tokenData.username,
          stream_api_key: process.env.REACT_APP_STREAM_API_KEY
        });
      } catch (error) {
        console.error('Error initializing Stream client:', error);
      } finally {
        setIsConnecting(false);
      }
    };

    initializeStream();

    // Cleanup on unmount or sessionId change
    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
        setChatClient(null);
      }
    };
  }, [sessionId]);

  // Disconnect when session is lost
  useEffect(() => {
    if (!sessionId && chatClient) {
      chatClient.disconnectUser();
      setChatClient(null);
      setStreamToken(null);
    }
  }, [sessionId, chatClient]);

  const createTontineChannel = async (tontineId, tontineName, members = []) => {
    if (!chatClient || !streamToken) {
      throw new Error('Stream client not initialized');
    }

    try {
      // Ensure all member IDs are in the correct format
      const memberIds = members.map(member => {
        if (typeof member === 'string') {
          return member.startsWith('user_') ? member : `user_${member}`;
        }
        return member.id || member.user_id || `user_${member}`;
      });

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/channel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          channel_type: 'team',
          channel_id: `tontine_${tontineId}`,
          channel_name: `Chat ${tontineName}`,
          members: memberIds,
          tontine_id: tontineId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create tontine channel');
      }

      const channelData = await response.json();
      console.log('Channel created successfully:', channelData);
      
      // Get the channel from Stream with proper initialization
      const channel = chatClient.channel('team', `tontine_${tontineId}`);
      
      // Initialize the channel state and get latest data
      await channel.watch();
      
      // Ensure current user is a member with proper permissions
      const currentUserId = streamToken.user_id;
      if (!channel.state.members[currentUserId]) {
        await channel.addMembers([currentUserId]);
      }
      
      // Send a welcome message to initiate the channel
      await channel.sendMessage({
        text: `🎉 Bienvenue dans le chat de la tontine "${tontineName}" ! Vous pouvez maintenant discuter avec les autres membres.`,
        user_id: currentUserId,
      });
      
      return channel;
    } catch (error) {
      console.error('Error creating tontine channel:', error);
      throw error;
    }
  };

  const createDirectChannel = async (otherUserId, otherUserName) => {
    if (!chatClient || !streamToken) {
      throw new Error('Stream client not initialized');
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/channel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          channel_type: 'messaging',
          members: [otherUserId],
          channel_name: `Chat avec ${otherUserName}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create direct channel');
      }

      const channelData = await response.json();
      console.log('Direct channel created successfully:', channelData);
      
      // Get the channel from Stream
      const channel = chatClient.channel('messaging', channelData.channel_id);
      await channel.watch();
      
      return channel;
    } catch (error) {
      console.error('Error creating direct channel:', error);
      throw error;
    }
  };

  const getUserChannels = async () => {
    if (!chatClient || !streamToken) {
      throw new Error('Stream client not initialized');
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/channels/${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get user channels');
      }

      const data = await response.json();
      return data.channels;
    } catch (error) {
      console.error('Error getting user channels:', error);
      throw error;
    }
  };

  const value = {
    chatClient,
    streamToken,
    isConnecting,
    createTontineChannel,
    createDirectChannel,
    getUserChannels,
  };

  return <StreamContext.Provider value={value}>{children}</StreamContext.Provider>;
};