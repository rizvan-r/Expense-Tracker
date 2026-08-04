import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { sendAIChatMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bot, Send, User, Sparkles, ArrowLeft } from 'lucide-react-native';

const QUICK_PROMPTS = [
  'Can I afford a ₹15,000 purchase?',
  'How do I maximize 80C tax savings?',
  'Tips to lower dining out expenses',
  'What is the 50/30/20 budget rule?',
];

export default function AIChatScreen({ navigation }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: `Hello ${user?.full_name || 'there'}! I'm SpendAI, your financial advisor. Ask me anything about budget advice, tax savings, or purchase affordability checks!`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  const handleSend = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = { id: Date.now().toString(), sender: 'user', text: query.trim() };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      // Build past chat history array format
      const history = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await sendAIChatMessage(query.trim(), history, {
        user_name: user?.full_name || 'User',
      });

      const replyText = res?.response || res?.message || 'I could not process that request right now.';
      const aiMsg = { id: (Date.now() + 1).toString(), sender: 'ai', text: replyText };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI Chat Error:', err);
      const errMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Sorry, I had trouble connecting to the SpendAI backend server. Please verify FastAPI is running.',
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Bot size={22} color="#9333ea" />
          <Text style={styles.headerTitle}> SpendAI Financial Coach</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Messages ScrollView */}
      <ScrollView
        style={styles.chatBox}
        contentContainerStyle={styles.chatContent}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageRow,
              msg.sender === 'user' ? styles.userRow : styles.aiRow,
            ]}
          >
            {msg.sender === 'ai' && (
              <View style={styles.aiAvatar}>
                <Bot size={16} color="#9333ea" />
              </View>
            )}
            <View
              style={[
                styles.bubble,
                msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text style={msg.sender === 'user' ? styles.userBubbleText : styles.aiBubbleText}>
                {msg.text}
              </Text>
            </View>
            {msg.sender === 'user' && (
              <View style={styles.userAvatar}>
                <User size={16} color="#059669" />
              </View>
            )}
          </View>
        ))}

        {loading && (
          <View style={[styles.messageRow, styles.aiRow]}>
            <View style={styles.aiAvatar}>
              <Bot size={16} color="#9333ea" />
            </View>
            <View style={[styles.bubble, styles.aiBubble]}>
              <ActivityIndicator color="#9333ea" size="small" />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Prompts */}
      <View style={styles.quickPromptContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.quickChip}
              onPress={() => handleSend(prompt)}
            >
              <Sparkles size={12} color="#059669" style={{ marginRight: 4 }} />
              <Text style={styles.quickChipText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask SpendAI financial questions..."
          placeholderTextColor="#94a3b8"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => handleSend()}
          disabled={loading || !inputText.trim()}
        >
          <Send size={18} color="#9333ea" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatBox: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#9333ea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  bubble: {
    maxWidth: '78%',
    padding: 12,
    borderRadius: 10,
  },
  userBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#059669',
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderBottomLeftRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  userBubbleText: {
    color: '#059669',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  aiBubbleText: {
    color: '#0f172a',
    fontSize: 14,
    lineHeight: 20,
  },
  quickPromptContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  quickChipText: {
    color: '#475569',
    fontSize: 12,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#0f172a',
    fontSize: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#9333ea',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
