import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';

type PersonalityMode = 'serious' | 'goofy' | 'creative' | 'adaptive' | 'professional' | 'casual';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function App() {
  const [personality, setPersonality] = useState<PersonalityMode>('adaptive');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m TwoSoul, your AI family assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

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

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: inputText,
        timestamp: new Date()
      };
      
      setMessages([...messages, newMessage]);
      setInputText('');

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `[${personality.toUpperCase()}] I received your message: "${inputText}". This is a demo response!`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
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
            <Text style={styles.headerSubtitle}>{personality.charAt(0).toUpperCase() + personality.slice(1)} Mode</Text>
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
          <ScrollView style={styles.messagesContainer}>
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.type === 'user' ? styles.userMessage : styles.assistantMessage,
                  message.type === 'assistant' && { backgroundColor: currentColor + '20' }
                ]}
              >
                <Text style={[
                  styles.messageText,
                  message.type === 'user' && styles.userMessageText
                ]}>
                  {message.content}
                </Text>
                <Text style={styles.messageTime}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))}
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
              style={[styles.sendButton, { backgroundColor: currentColor }]}
              onPress={handleSend}
            >
              <Text style={styles.sendButtonText}>Send</Text>
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
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
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
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  userMessageText: {
    color: 'white',
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

