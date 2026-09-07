import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { api } from './services';

type PersonalityMode = 'serious' | 'goofy' | 'creative' | 'adaptive' | 'professional' | 'casual';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'error';
  content: string;
  timestamp: Date;
}

// Generate a persistent user ID
const USER_ID = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;

export default function App() {
  const [personality, setPersonality] = useState<PersonalityMode>('adaptive');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m TwoSoul, your AI family assistant powered by Universal Soul AI. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const personalityColors = {
    serious: '#1e40af',
    goofy: '#f59e0b',
    creative: '#a855f7',
    adaptive: '#10b981',
    professional: '#374151',
    casual: '#ec4899'
  };

  const personalityEmojis = {
    serious: '🎓',
    goofy: '🤪',
    creative: '🎨',
    adaptive: '🌟',
    professional: '💼',
    casual: '😊'
  };

  // Check API connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const checkConnection = async () => {
    try {
      await api.healthCheck();
      setIsConnected(true);
      console.log('Connected to Universal Soul AI API');
    } catch (error) {
      setIsConnected(false);
      console.error('API connection failed:', error);
      Alert.alert(
        'Connection Error',
        'Cannot connect to Universal Soul AI API. Make sure the backend server is running at ' + api.getBaseUrl(),
        [{ text: 'OK' }]
      );
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessageContent = inputText.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Call Universal Soul AI API
      const response = await api.sendMessage({
        message: userMessageContent,
        user_id: USER_ID,
        personality_mode: personality,
      });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.message,
        timestamp: new Date(response.timestamp)
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Failed to get AI response:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please make sure the API server is running.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentColor = personalityColors[personality];

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentColor }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerEmoji}>{personalityEmojis[personality]}</Text>
          <View>
            <Text style={styles.headerTitle}>TwoSoul</Text>
            <View style={styles.headerSubtitleContainer}>
              <Text style={styles.headerSubtitle}>{personality.charAt(0).toUpperCase() + personality.slice(1)} Mode</Text>
              <View style={[styles.connectionIndicator, isConnected ? styles.connected : styles.disconnected]} />
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.minimizeButton}
          onPress={() => setIsMinimized(!isMinimized)}
        >
          <Text style={styles.minimizeText}>{isMinimized ? '▼' : '▲'}</Text>
        </TouchableOpacity>
      </View>

      {!isMinimized && (
        <>
          {/* Personality Selector */}
          <ScrollView horizontal style={styles.personalitySelector} showsHorizontalScrollIndicator={false}>
            {(Object.keys(personalityColors) as PersonalityMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.personalityButton,
                  { backgroundColor: personalityColors[mode] },
                  personality === mode && styles.personalityButtonActive
                ]}
                onPress={() => setPersonality(mode)}
              >
                <Text style={styles.personalityEmoji}>{personalityEmojis[mode]}</Text>
                <Text style={styles.personalityText}>{mode}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.type === 'user' ? styles.userMessage : styles.assistantMessage,
                  message.type === 'assistant' && { backgroundColor: currentColor + '20' },
                  message.type === 'error' && styles.errorMessage
                ]}
              >
                <Text style={[
                  styles.messageText,
                  message.type === 'user' && styles.userMessageText,
                  message.type === 'error' && styles.errorMessageText
                ]}>
                  {message.content}
                </Text>
                <Text style={styles.messageTime}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))}
            {isLoading && (
              <View style={[styles.messageBubble, styles.assistantMessage, { backgroundColor: currentColor + '20' }]}>
                <ActivityIndicator size="small" color={currentColor} />
                <Text style={[styles.messageText, { marginTop: 8 }]}>Thinking...</Text>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor="#999"
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: currentColor },
                (isLoading || !isConnected) && styles.sendButtonDisabled
              ]}
              onPress={handleSend}
              disabled={isLoading || !isConnected}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.sendButtonText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Minimized View */}
      {isMinimized && (
        <View style={styles.minimizedView}>
          <Text style={styles.minimizedText}>TwoSoul is minimized. Tap ▼ to expand.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connected: {
    backgroundColor: '#10b981',
  },
  disconnected: {
    backgroundColor: '#ef4444',
  },
  minimizeButton: {
    padding: 8,
  },
  minimizeText: {
    color: 'white',
    fontSize: 20,
  },
  personalitySelector: {
    maxHeight: 80,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  personalityButton: {
    margin: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 80,
  },
  personalityButtonActive: {
    borderWidth: 3,
    borderColor: '#000',
  },
  personalityEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  personalityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
  },
  errorMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  userMessageText: {
    color: 'white',
  },
  errorMessageText: {
    color: '#991b1b',
  },
  messageTime: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  minimizedView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  minimizedText: {
    fontSize: 16,
    color: '#666',
  },
});

