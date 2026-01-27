import React, { useEffect, useCallback } from 'react';
import {
  getChatState,
  addChatMessage,
  setChatLoading,
  setChatError,
  setChatInput,
  setChatInputFocused,
  setOnChatSendMessage,
  setOnChatInputClick,
  setOnChatMessageSent,
  getPhoneScreenState,
  CHAT_SUGGESTED_PROMPTS,
} from './deviceState';

import { Analytics } from '../lib/analytics';

// API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'https://api.vois.app';

interface ChatDemoProps {
  // Optional callback when chat state changes
  onStateChange?: () => void;
  // Callback when a chat message is actually sent
  onMessageSent?: () => void;
}

export const ChatDemo: React.FC<ChatDemoProps> = ({ onStateChange, onMessageSent }) => {
  // Send a chat message to the API
  const sendMessage = useCallback(async (message: string) => {
    const chatState = getChatState();

    // Don't send if limit reached or already loading
    if (chatState.isLimitReached || chatState.isLoading) {
      return;
    }

    // Notify that a chat message was sent
    onMessageSent?.();
    Analytics.chatMessageSent(chatState.messages.length === 0);

    // Track if this was a suggested question
    if (CHAT_SUGGESTED_PROMPTS.includes(message)) {
      Analytics.chatSuggestedQuestionClicked(message);
    }

    // Add user message to state
    addChatMessage({ role: 'user', content: message });
    setChatLoading(true);
    setChatError(null);
    setChatInput('');
    setChatInputFocused(false);

    try {
      // Build conversation history (last 5 messages)
      const conversationHistory = chatState.messages.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add the new message to history
      conversationHistory.push({ role: 'user', content: message });

      const response = await fetch(`${API_URL}/api/demo/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory,
        }),
      });

      if (response.status === 429) {
        Analytics.chatLimitReached();
        setChatError("You've asked a lot of questions! Sign up to continue.");
        setChatLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Add AI response to state
      addChatMessage({
        role: 'assistant',
        content: data.response,
        citations: data.citations,
      });

    } catch (err: any) {
      console.error('[Chat Demo] Error:', err);
      setChatError('Something went wrong. Try again.');
    } finally {
      setChatLoading(false);
      onStateChange?.();
    }
  }, [onStateChange]);

  // Handle input click - focus the input for typing
  const handleInputClick = useCallback(() => {
    const chatState = getChatState();
    if (chatState.isLimitReached || chatState.isLoading) {
      return;
    }
    setChatInputFocused(true);
  }, []);

  // Register callbacks when component mounts
  useEffect(() => {
    setOnChatSendMessage((message: string) => {
      sendMessage(message);
    });
    setOnChatInputClick(() => {
      handleInputClick();
    });

    return () => {
      setOnChatSendMessage(null);
      setOnChatInputClick(null);
    };
  }, [sendMessage, handleInputClick]);

  // Handle keyboard input when chat input is focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const chatState = getChatState();
      const phoneState = getPhoneScreenState();

      // Only handle keys when on magic screen and input is focused
      if (phoneState.currentScreen !== 'magic' || !chatState.isInputFocused) {
        return;
      }

      // Don't capture keys if user is typing in an actual input element
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Escape') {
        setChatInputFocused(false);
        return;
      }

      if (e.key === 'Enter') {
        const trimmed = chatState.inputText.trim();
        if (trimmed) {
          sendMessage(trimmed);
        }
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        setChatInput(chatState.inputText.slice(0, -1));
        return;
      }

      // Only allow printable characters
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        // Limit input length
        if (chatState.inputText.length < 100) {
          setChatInput(chatState.inputText + e.key);
        }
      }
    };

    // Click outside to unfocus
    const handleClick = (e: MouseEvent) => {
      const chatState = getChatState();
      if (!chatState.isInputFocused) return;

      // Check if click is on the canvas (3D scene)
      const target = e.target as HTMLElement;
      if (target.tagName === 'CANVAS') {
        // Let the canvas click handler decide if we should stay focused
        // (it will re-focus if clicking the input area)
        return;
      }

      // Click outside canvas unfocuses
      setChatInputFocused(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick, true);
    };
  }, [sendMessage]);

  // No visible UI - this component just handles keyboard input
  return null;
};

export default ChatDemo;
