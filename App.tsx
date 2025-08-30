
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { QuizResult, User, StudySession } from './types';
import Header from './components/Header';
import MaterialInput from './components/MaterialInput';
import StudyTools from './components/StudyTools';
import UserDashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import * as authService from './services/authService';
import * as dataService from './services/dataService';
import { generateStudyAids } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import { Spinner } from './components/ui/Spinner';

export enum AppView {
  INPUT,
  STUDY,
  DASHBOARD
}

type AuthView = 'landing' | 'login' | 'signup';

function App() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<AuthView>('landing');
  
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [studyHistory, setStudyHistory] = useState<StudySession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const currentSession = useMemo(() => {
    return studyHistory.find(s => s.id === currentSessionId) || null;
  }, [currentSessionId, studyHistory]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await authService.getUserProfile(session.user);
          if (profile) {
            setCurrentUser(profile);
            const userHistory = await dataService.getStudyHistory(profile.id);
            setStudyHistory(userHistory);
            setView(userHistory.length > 0 ? AppView.DASHBOARD : AppView.INPUT);
          } else {
            // This case might happen if profile creation fails after signup.
            // For simplicity, we log out the user.
            await authService.logout();
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
          setAuthView('landing');
        }
        setSessionChecked(true);
      }
    );
    return () => subscription.unsubscribe();
  }, []);
  
  const handleLogout = async () => {
    await authService.logout();
    setView(AppView.INPUT);
    setStudyHistory([]);
    setCurrentSessionId(null);
  };

  const handleGenerate = useCallback(async (title: string, material: dataService.StudyMaterialInput, difficulty: 'Easy' | 'Medium' | 'Hard') => {
    if (!currentUser) return;
    if (!material.text.trim() && (!material.files || material.files.length === 0)) {
      setError('Please enter some study material, upload a PDF, or paste a screenshot.');
      return;
    }
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generateStudyAids(material, difficulty);
      const sessionTitle = title.trim() || `Session on ${new Date().toLocaleDateString()}`;
      
      const newSessionFromDb = await dataService.addStudySession(currentUser.id, { 
        title: sessionTitle,
        studyMaterial: material,
        studyAids: result,
      });

      setStudyHistory(prev => [newSessionFromDb, ...prev]);
      setCurrentSessionId(newSessionFromDb.id);
      setView(AppView.STUDY);
    } catch (err) {
      console.error(err);
      setError('Failed to generate study aids. Please check the console and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const handleReset = useCallback(() => {
    setView(AppView.INPUT);
    setCurrentSessionId(null);
    setError(null);
  }, []);
  
  const handleQuizComplete = async (result: QuizResult) => {
    if (!currentUser || !currentSessionId) return;
    await dataService.addQuizResult(currentSessionId, result);
    const updatedHistory = await dataService.getStudyHistory(currentUser.id);
    setStudyHistory(updatedHistory);
    alert(`Quiz Complete! You scored ${result.score} out of ${result.total}.`);
  };
  
  const handleLoadSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setView(AppView.STUDY);
  };

  const renderContent = () => {
    switch (view) {
      case AppView.STUDY:
        return currentSession && currentUser ? (
          <StudyTools 
            key={currentSession.id}
            sessionId={currentSession.id}
            studyAids={currentSession.studyAids} 
            studyMaterial={currentSession.studyMaterial.text || currentSession.studyAids.summary}
            onQuizComplete={handleQuizComplete}
            user={currentUser}
          />
        ) : (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold">No active session</h2>
                <p className="text-gray-500 mt-2">Please start a new session or load one from your dashboard.</p>
            </div>
        );
      case AppView.DASHBOARD:
        return <UserDashboard 
                  user={currentUser!} 
                  studyHistory={studyHistory} 
                  onLoadSession={handleLoadSession} 
                />;
      case AppView.INPUT:
      default:
        return (
          <MaterialInput
            onGenerate={handleGenerate}
            isLoading={isLoading}
            error={error}
          />
        );
    }
  };
  
  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light dark:bg-bg-dark">
        <Spinner className="w-10 h-10" />
      </div>
    )
  }

  if (!currentUser) {
    switch (authView) {
      case 'login':
        return <Login onSwitchToSignup={() => setAuthView('signup')} />;
      case 'signup':
        return <Signup onSwitchToLogin={() => setAuthView('login')} />;
      case 'landing':
      default:
        return <LandingPage onNavigate={setAuthView} />;
    }
  }

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-dark-gray dark:text-gray-200 font-sans">
      <Header 
        currentView={view} 
        setView={setView} 
        onReset={handleReset} 
        hasContent={!!currentSession}
        user={currentUser}
        onLogout={handleLogout}
      />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
