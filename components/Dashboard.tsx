
import React, { useMemo } from 'react';
import { Card } from './ui/Card';
import type { User, StudySession } from '../types';
import * as dataService from '../services/dataService';
import { FireIcon, HistoryIcon, ChevronRightIcon } from './icons/Icons';
import QuizAnalytics from './QuizAnalytics';

interface UserDashboardProps {
    user: User;
    studyHistory: StudySession[];
    onLoadSession: (sessionId: string) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, studyHistory, onLoadSession }) => {
    const studyStreak = useMemo(() => dataService.calculateStudyStreak(studyHistory), [studyHistory]);
    const topSubjects = useMemo(() => dataService.getTopSubjects(studyHistory), [studyHistory]);
    const allQuizResults = useMemo(() => studyHistory.flatMap(session => session.quizResults), [studyHistory]);

    const getBestScore = (session: StudySession) => {
        if (!session.quizResults || session.quizResults.length === 0) {
            return null;
        }
        const best = Math.max(...session.quizResults.map(r => r.score / r.total));
        return (best * 100).toFixed(0);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold">Welcome back, {user.name}!</h2>
                <p className="text-gray-500 mt-1">Here's a summary of your learning journey.</p>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <Card.Header>
                        <Card.Title className="flex items-center gap-2"><FireIcon className="w-6 h-6 text-crayon-red"/> Study Streak</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <p className="text-4xl font-bold">{studyStreak} <span className="text-2xl font-medium text-gray-500">days</span></p>
                        <p className="text-sm text-gray-500 mt-1">{studyStreak > 0 ? "Keep up the great work!" : "Start a new session to build your streak."}</p>
                    </Card.Content>
                </Card>
                <Card>
                    <Card.Header>
                        <Card.Title>Total Sessions</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <p className="text-4xl font-bold">{studyHistory.length}</p>
                    </Card.Content>
                </Card>
                <Card>
                    <Card.Header>
                        <Card.Title>Quizzes Taken</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <p className="text-4xl font-bold">{allQuizResults.length}</p>
                    </Card.Content>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Study History */}
                <Card className="lg:col-span-1">
                    <Card.Header>
                        <Card.Title className="flex items-center gap-2"><HistoryIcon className="w-6 h-6"/> Study History</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        {studyHistory.length > 0 ? (
                            <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                {studyHistory.map(session => {
                                    const bestScore = getBestScore(session);
                                    return (
                                    <li key={session.id}>
                                        <button 
                                            onClick={() => onLoadSession(session.id)}
                                            className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md hover:bg-crayon-blue/10 dark:hover:bg-crayon-blue/20 group transition-colors"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold text-sm truncate">{session.title}</p>
                                                    <p className="text-xs text-gray-500">{new Date(session.date).toLocaleString()}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {bestScore && (
                                                        <span className="text-sm font-bold text-crayon-blue">{bestScore}%</span>
                                                    )}
                                                    <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-crayon-blue transition-colors" />
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                )})}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-8">No study sessions recorded yet.</p>
                        )}
                    </Card.Content>
                </Card>
                
                {/* Top Subjects */}
                 <Card className="lg:col-span-2">
                    <Card.Header>
                        <Card.Title>Your Interests</Card.Title>
                        <Card.Description>Based on your study session titles.</Card.Description>
                    </Card.Header>
                    <Card.Content>
                        {topSubjects.length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                                {topSubjects.map(([subject, count]) => (
                                     <div key={subject} className="bg-crayon-blue/10 text-crayon-blue text-sm font-semibold px-3 py-1.5 rounded-full">
                                        {subject}
                                     </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-8">We'll highlight your top subjects here as you study.</p>
                        )}
                    </Card.Content>
                </Card>
            </div>

            {/* Quiz Analytics */}
            <QuizAnalytics quizResults={allQuizResults} />

        </div>
    );
};

export default UserDashboard;