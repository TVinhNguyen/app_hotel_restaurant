import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../constants';
import { chatService, ChatMessage } from '../services/chatService';

const ChatScreen = ({ navigation }: any) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const CHAT_STORAGE_KEY = '@chat_messages';

  // Load messages from storage on mount
  useEffect(() => {
    loadMessages();
  }, []);

  // Save messages to storage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages();
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      } else {
        // If no stored messages, show welcome message
        const welcomeMessage = chatService.createMessage(
          'assistant',
          'Xin chào! Tôi là trợ lý AI của khách sạn. Tôi có thể giúp bạn tìm hiểu về phòng, dịch vụ, nhà hàng và các thông tin khác. Bạn cần hỗ trợ gì?'
        );
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // Show welcome message on error
      const welcomeMessage = chatService.createMessage(
        'assistant',
        'Xin chào! Tôi là trợ lý AI của khách sạn. Tôi có thể giúp bạn tìm hiểu về phòng, dịch vụ, nhà hàng và các thông tin khác. Bạn cần hỗ trợ gì?'
      );
      setMessages([welcomeMessage]);
    }
  };

  const saveMessages = async () => {
    try {
      await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const clearChatHistory = async () => {
    try {
      await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
      const welcomeMessage = chatService.createMessage(
        'assistant',
        'Xin chào! Tôi là trợ lý AI của khách sạn. Tôi có thể giúp bạn tìm hiểu về phòng, dịch vụ, nhà hàng và các thông tin khác. Bạn cần hỗ trợ gì?'
      );
      setMessages([welcomeMessage]);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  };

  useEffect(() => {
    // Welcome message
    const welcomeMessage = chatService.createMessage(
      'assistant',
      'Xin chào! Tôi là trợ lý AI của khách sạn. Tôi có thể giúp bạn tìm hiểu về phòng, dịch vụ, nhà hàng và các thông tin khác. Bạn cần hỗ trợ gì?'
    );
    setMessages([welcomeMessage]);
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = chatService.createMessage('user', inputText.trim());
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await chatService.sendMessage(inputText.trim());
      const assistantMessage = chatService.createMessage('assistant', response);
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage = chatService.createMessage(
        'assistant',
        'Xin lỗi, đã có lỗi xảy ra: ' + (error.message || 'Không thể kết nối')
      );
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionPress = (question: string) => {
    setInputText(question);
    setShowSuggestions(false);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {item.content}
        </Text>
        <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
          {item.timestamp.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.aiIconContainer}>
              <Ionicons name="sparkles" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>AI Trợ Lý</Text>
              <Text style={styles.headerSubtitle}>Hỗ trợ 24/7</Text>
            </View>
          </View>
          <TouchableOpacity onPress={clearChatHistory} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={22} color={COLORS.error} />
          </TouchableOpacity>
        </View>

      {/* Messages and Input Container */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          style={styles.messagesListContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          onLayout={() => flatListRef.current?.scrollToEnd()}
        />

        {/* Suggested Questions */}
        {showSuggestions && messages.length <= 1 && (
          <View style={styles.suggestionsContainer}>
            <ScrollView 
              style={styles.suggestionsScrollView}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.suggestionsContent}>
                {chatService.getSuggestedQuestions().map((question, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => handleSuggestionPress(question)}
                  >
                    <Text style={styles.suggestionText}>{question}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>AI đang trả lời...</Text>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Nhập câu hỏi của bạn..."
            placeholderTextColor={COLORS.text.secondary}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? COLORS.surface : COLORS.text.secondary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  chatContainer: {
    flex: 1,
  },
  messagesListContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: SIZES.spacing.sm,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  clearButton: {
    padding: SIZES.spacing.xs,
  },
  aiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.sm,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  messagesList: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    marginVertical: SIZES.spacing.xs,
    padding: SIZES.spacing.sm,
    borderRadius: 16,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  userMessageText: {
    color: COLORS.surface,
  },
  timestamp: {
    fontSize: 10,
    color: COLORS.text.secondary,
    marginTop: SIZES.spacing.xs,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: COLORS.surface,
    opacity: 0.8,
  },
  suggestionsContainer: {
    maxHeight: 200,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  suggestionsScrollView: {
    maxHeight: 200,
  },
  suggestionsContent: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
  },
  suggestionChip: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: SIZES.spacing.sm,
  },
  suggestionText: {
    fontSize: 13,
    color: COLORS.primary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    backgroundColor: COLORS.surface,
  },
  loadingText: {
    marginLeft: SIZES.spacing.sm,
    fontSize: 13,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    fontSize: 14,
    color: COLORS.text.primary,
    marginRight: SIZES.spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
});

export default ChatScreen;
