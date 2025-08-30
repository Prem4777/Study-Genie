
import React, { useState, useMemo } from 'react';
import type { StudyAids, QuizResult, User } from '../types';
import Summary from './Summary';
import Quiz from './Quiz';
import Flashcards from './Flashcards';
import Tutor from './Tutor';
import { Card } from './ui/Card';
import { BookOpenIcon, DocumentTextIcon, AcademicCapIcon, ChatBubbleLeftRightIcon } from './icons/Icons';
import { createTutorChat } from '../services/geminiService';
import type { Chat } from '@google/genai';

interface StudyToolsProps {
  sessionId: string;
  studyAids: StudyAids;
  studyMaterial: string;
  onQuizComplete: (result: QuizResult) => void;
  user: User;
}

type Tab = 'summary' | 'flashcards' | 'quiz' | 'tutor';

const StudyTools: React.FC<StudyToolsProps> = ({ sessionId, studyAids, studyMaterial, onQuizComplete, user }) => {
  const [activeTab, setActiveTab] = useState<Tab>('summary');

  const tutorChat = useMemo(() => createTutorChat(studyMaterial), [studyMaterial]);
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return <Summary content={studyAids.summary} />;
      case 'flashcards':
        return <Flashcards cards={studyAids.flashcards} sessionId={sessionId} user={user} />;
      case 'quiz':
        return <Quiz questions={studyAids.quiz} onComplete={onQuizComplete} sessionId={sessionId} user={user} difficulty={studyAids.difficulty} />;
      case 'tutor':
        return <Tutor chat={tutorChat} sessionId={sessionId} user={user} />;
      default:
        return null;
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'summary', label: 'Summary', icon: <DocumentTextIcon className="w-5 h-5" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <BookOpenIcon className="w-5 h-5" /> },
    { id: 'quiz', label: 'Quiz', icon: <AcademicCapIcon className="w-5 h-5" /> },
    { id: 'tutor', label: 'AI Tutor', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="md:w-1/4 lg:w-1/5">
        <nav className="flex md:flex-col gap-2 sticky top-24">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-start text-left gap-3 w-full p-3 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-crayon-blue text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
          {renderTabContent()}
      </div>
    </div>
  );
};

export default StudyTools;