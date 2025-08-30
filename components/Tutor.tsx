
import React, { useState, useRef, useEffect } from 'react';
import type { Message, User } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { PaperAirplaneIcon, UserCircleIcon, SparklesIcon } from './icons/Icons';
import { Spinner } from './ui/Spinner';
import type { Chat, GenerateContentResponse } from '@google/genai';
import * as dataService from '../services/dataService';

interface TutorProps {
    chat: Chat;
    sessionId: string;
    user: User;
}

const Tutor: React.FC<TutorProps> = ({ chat, sessionId, user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stateLoaded, setStateLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadState = async () => {
        const savedState = await dataService.getToolState(user.id, sessionId, 'tutor');
        if (savedState && Array.isArray(savedState.messages)) {
            setMessages(savedState.messages);
        } else {
            setMessages([{ sender: 'ai', text: 'Hello! Ask me anything about your study material.' }]);
        }
        setStateLoaded(true);
    };
    loadState();
  }, [user.id, sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    if (stateLoaded) {
      dataService.saveToolState(user.id, sessionId, 'tutor', { messages });
    }
  }, [messages, stateLoaded, user.id, sessionId]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const result: GenerateContentResponse = await chat.sendMessage({ message: input });
        const aiMessage: Message = { sender: 'ai', text: result.text };
        setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
        console.error("Tutor chat error:", error);
        const errorMessage: Message = { sender: 'ai', text: "Sorry, I encountered an error. Please try again." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };
  
  if (!stateLoaded) {
      return (
        <Card className="flex flex-col h-[70vh]">
            <Card.Header>
                <Card.Title>AI Tutor</Card.Title>
                <Card.Description>Ask questions and get instant help.</Card.Description>
            </Card.Header>
            <Card.Content className="flex-1 flex items-center justify-center">
                <Spinner/>
            </Card.Content>
        </Card>
      );
  }

  return (
    <Card className="flex flex-col h-[70vh]">
      <Card.Header>
        <Card.Title>AI Tutor</Card.Title>
        <Card.Description>Ask questions and get instant help.</Card.Description>
      </Card.Header>
      <Card.Content className="flex-1 overflow-y-auto pr-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'ai' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-crayon-yellow flex items-center justify-center text-white"><SparklesIcon className="w-5 h-5"/></div>}
            <div className={`max-w-md p-3 rounded-xl ${msg.sender === 'ai' ? 'bg-gray-100 dark:bg-gray-700' : 'bg-crayon-blue text-white'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
             {msg.sender === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-light-gray dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300"><UserCircleIcon className="w-6 h-6"/></div>}
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-crayon-yellow flex items-center justify-center text-white"><SparklesIcon className="w-5 h-5"/></div>
                <div className="max-w-md p-3 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center">
                    <Spinner />
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </Card.Content>
      <div className="p-4 border-t border-light-gray dark:border-gray-700">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            className="flex-1 p-2 border border-light-gray rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-crayon-blue focus:outline-none"
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            <PaperAirplaneIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Tutor;