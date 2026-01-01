import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Image, Platform, StatusBar, ScrollView } from 'react-native';
import {Ionicons} from '@react-native-vector-icons/ionicons';
import colors from '../theme/colors';
import Images from '../constants/images';

interface Message {
  id: string;
  from: 'agent' | 'user';
  text: string;
  timestamp: string;
  read?: boolean;
}

const QUICK_REPLIES = ['Order Status', 'Refund', 'Delivery Issue', 'Other'];

const formatTime = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function ChatScreen({ navigation }: any) {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', from: 'agent', text: 'Hi, how can I help you?', timestamp: formatTime(new Date()), read: true },
  ]);
  const [agentOnline] = useState(true);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const messageIdRef = useRef(2);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.from === 'user';
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && <View style={styles.agentIcon}><Ionicons name="person" size={24} color="#fff" /></View>}
        
        <View>
          <View style={[styles.messageBubble, isUser ? styles.bubbleUser : styles.bubbleAgent]}>
            <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{item.text}</Text>
          </View>
          <View style={[styles.messageFooter, isUser && styles.messageFooterUser]}>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
            {isUser && item.read && <Ionicons name="checkmark-done" size={12} color={colors.primary} style={styles.checkmarkIcon} />}
          </View>
        </View>

        {isUser && <Image source={Images.avatarPlaceholder} style={styles.userAvatar} />}
      </View>
    );
  };

  const renderTypingIndicator = () => {
    return (
      <View style={[styles.messageRow]}>
        <View style={styles.agentIcon}><Ionicons name="person" size={24} color="#fff" /></View>
        <View style={[styles.messageBubble, styles.bubbleAgent]}>
          <View style={styles.typingIndicator}>
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
          </View>
        </View>
      </View>
    );
  };

  const renderQuickReply = (reply: string) => (
    <TouchableOpacity key={reply} style={styles.quickReplyBtn} onPress={() => handleQuickReply(reply)}>
      <Text style={styles.quickReplyText}>{reply}</Text>
    </TouchableOpacity>
  );

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: messageIdRef.current.toString(),
      from: 'user',
      text: inputText,
      timestamp: formatTime(new Date()),
      read: true,
    };
    messageIdRef.current += 1;

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setShowQuickReplies(false);
    setIsTyping(true);

    // Simulate typing and agent response
    setTimeout(() => {
      const agentMessage: Message = {
        id: messageIdRef.current.toString(),
        from: 'agent',
        text: "Thanks for contacting us! Your message has been received. Our support team will get back to you shortly.",
        timestamp: formatTime(new Date()),
        read: false,
      };
      messageIdRef.current += 1;
      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);
    }, 2000);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleQuickReply = (reply: string) => {
    setInputText(reply);
    setShowQuickReplies(false);
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Support Chat</Text>
          <View style={styles.agentStatus}>
            <View style={[styles.statusDot, agentOnline && styles.statusDotOnline]} />
            <Text style={styles.statusText}>{agentOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.messageList}
        renderItem={renderMessage}
        scrollEnabled={true}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={isTyping ? renderTypingIndicator : null}
      />

      {/* Quick Replies */}
      {showQuickReplies && messages.length < 4 && (
        <View style={styles.quickRepliesContainer}>
          <Text style={styles.quickRepliesLabel}>Quick replies:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRepliesScroll}>
            {QUICK_REPLIES.map(renderQuickReply)}
          </ScrollView>
        </View>
      )}

      {/* Input footer */}
      <View style={styles.inputFooter}>
        <TextInput
          placeholder="Type your message..."
          placeholderTextColor="#CBCBCB"
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
          activeOpacity={0.85} 
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const TOP_PAD_ANDROID = StatusBar.currentHeight ? StatusBar.currentHeight : 0;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? TOP_PAD_ANDROID : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  agentStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ccc', marginRight: 6 },
  statusDotOnline: { backgroundColor: '#4CAF50' },
  statusText: { fontSize: 12, color: '#999', fontWeight: '500' },
  messageList: { padding: 16, paddingBottom: 12 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 },
  messageRowUser: { justifyContent: 'flex-end' },
  agentIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  userAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: colors.primary, marginLeft: 12 },
  messageBubble: { maxWidth: '75%', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 18 },
  bubbleAgent: { backgroundColor: '#E8E8E8' },
  bubbleUser: { backgroundColor: colors.primary },
  bubbleText: { fontSize: 15, fontWeight: '500', color: colors.text, lineHeight: 20 },
  bubbleTextUser: { color: '#fff' },
  messageFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginLeft: 12 },
  messageFooterUser: { marginLeft: 0, marginRight: 12, justifyContent: 'flex-end' },
  checkmarkIcon: { marginLeft: 6 },
  timestamp: { fontSize: 11, color: '#CBCBCB', fontWeight: '500' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: 40 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#999', marginHorizontal: 2 },
  quickRepliesContainer: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  quickRepliesLabel: { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 10 },
  quickRepliesScroll: { marginBottom: 8 },
  quickReplyBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.primary, marginRight: 10 },
  quickReplyText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  inputFooter: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0', marginBottom: 70 },
  input: { flex: 1, minHeight: 50, maxHeight: 100, backgroundColor: '#F5F5F5', borderRadius: 24, paddingHorizontal: 18, fontSize: 15, color: colors.text, marginRight: 12, paddingVertical: 12 },
  sendBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: '#ddd' },
});
