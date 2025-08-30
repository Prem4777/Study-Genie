import React from 'react';
import { BookOpenIcon, ChartBarIcon, DocumentTextIcon, SparklesIcon, UserCircleIcon } from './icons/Icons';
import { AppView } from '../App';
import type { User } from '../types';

interface HeaderProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onReset: () => void;
  hasContent: boolean;
  user: User | null;
  onLogout: () => void;
}

const NavButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-crayon-blue text-white'
        : 'text-gray-500 hover:bg-crayon-blue/10 hover:text-crayon-blue'
    } disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);


const Header: React.FC<HeaderProps> = ({ currentView, setView, onReset, hasContent, user, onLogout }) => {
  return (
    <header className="bg-white dark:bg-gray-800 sticky top-0 z-10 border-b border-light-gray dark:border-gray-700 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
             <SparklesIcon className="w-8 h-8 text-crayon-blue" />
            <h1 className="text-xl font-bold text-dark-gray dark:text-white">StudyGenie</h1>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-2">
              <NavButton onClick={() => { onReset(); setView(AppView.INPUT); }} isActive={currentView === AppView.INPUT}>
                <DocumentTextIcon className="w-5 h-5" />
                New Material
              </NavButton>
              <NavButton onClick={() => setView(AppView.STUDY)} isActive={currentView === AppView.STUDY} disabled={!hasContent}>
                  <BookOpenIcon className="w-5 h-5" />
                  Study
              </NavButton>
              <NavButton onClick={() => setView(AppView.DASHBOARD)} isActive={currentView === AppView.DASHBOARD}>
                  <ChartBarIcon className="w-5 h-5" />
                  Dashboard
              </NavButton>
            </nav>
            <div className="w-px h-6 bg-light-gray dark:bg-gray-600"></div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                  <UserCircleIcon className="w-6 h-6 text-gray-400"/>
                  <span className="font-medium text-dark-gray dark:text-gray-200">{user?.name}</span>
              </div>
              <button onClick={onLogout} className="text-sm text-gray-500 hover:text-crayon-blue font-medium">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;