import React from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { SparklesIcon, UploadCloudIcon, ListBulletIcon, DocumentTextIcon, ChevronRightIcon, BookOpenIcon } from './icons/Icons';

interface LandingPageProps {
  onNavigate: (view: 'login' | 'signup') => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; }> = ({ icon, title, children }) => (
    <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg border border-light-gray dark:border-gray-700 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="bg-crayon-blue/10 p-3 rounded-full mb-4">
            {icon}
        </div>
        <h3 className="text-lg font-bold mb-2 text-dark-gray dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{children}</p>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-dark-gray dark:text-gray-200 font-sans">
        <header className="py-4">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <SparklesIcon className="w-8 h-8 text-crayon-blue" />
                    <h1 className="text-xl font-bold text-dark-gray dark:text-white">StudyGenie</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => onNavigate('login')}>Login</Button>
                    <Button onClick={() => onNavigate('signup')}>Get Started</Button>
                </div>
            </div>
        </header>

        <main>
            {/* Hero Section */}
            <section className="text-center py-20 px-4">
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
                    <div className="text-left">
                        <h2 className="text-4xl md:text-6xl font-extrabold text-dark-gray dark:text-white leading-tight">
                            Unlock Your <span className="text-crayon-blue">Learning Potential</span> with AI
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                            Transform any study material—PDFs, notes, or screenshots—into summaries, quizzes, and flashcards instantly.
                        </p>
                        <Button size="lg" onClick={() => onNavigate('signup')} className="mt-8">
                            Start Learning Now <ChevronRightIcon className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                     <div className="relative w-full max-w-sm mx-auto">
                        <BookOpenIcon className="w-full h-auto text-crayon-blue p-4 md:p-0" />
                    </div>
                </div>
            </section>
            
            {/* Features Section */}
            <section id="features" className="py-20 bg-white dark:bg-gray-800 border-y border-light-gray dark:border-gray-700">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                         <h2 className="text-3xl font-bold">Your All-in-One Study Toolkit</h2>
                         <p className="mt-2 text-gray-600 dark:text-gray-400">Everything you need to study smarter, not harder.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard icon={<UploadCloudIcon className="w-6 h-6 text-crayon-blue"/>} title="Versatile Uploads">
                            Easily upload PDFs, paste text, or use screenshots of your notes. We handle the rest.
                        </FeatureCard>
                        <FeatureCard icon={<DocumentTextIcon className="w-6 h-6 text-crayon-green"/>} title="Instant Summaries">
                            Get concise, easy-to-digest summaries of even the most complex topics in seconds.
                        </FeatureCard>
                        <FeatureCard icon={<ListBulletIcon className="w-6 h-6 text-crayon-yellow"/>} title="Quizzes & Flashcards">
                            Auto-generate interactive quizzes and flashcards to test your knowledge and reinforce learning.
                        </FeatureCard>
                        <FeatureCard icon={<SparklesIcon className="w-6 h-6 text-crayon-red"/>} title="Interactive AI Tutor">
                            Ask questions and get clear, instant explanations from an AI tutor that knows your material.
                        </FeatureCard>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-12">Three Simple Steps to Success</h2>
                    <div className="grid md:grid-cols-3 gap-8 text-left">
                       <Card>
                           <Card.Header><Card.Title><span className="text-crayon-blue font-extrabold mr-2">1.</span>Provide Material</Card.Title></Card.Header>
                           <Card.Content className="text-gray-600 dark:text-gray-300">Input your study content. Paste raw text, upload a PDF document, or capture a screenshot from your screen.</Card.Content>
                       </Card>
                       <Card>
                           <Card.Header><Card.Title><span className="text-crayon-blue font-extrabold mr-2">2.</span>Generate Aids</Card.Title></Card.Header>
                           <Card.Content className="text-gray-600 dark:text-gray-300">With one click, our AI generates a summary, a multiple-choice quiz, and a full set of flashcards tailored to your material.</Card.Content>
                       </Card>
                       <Card>
                           <Card.Header><Card.Title><span className="text-crayon-blue font-extrabold mr-2">3.</span>Start Studying</Card.Title></Card.Header>
                           <Card.Content className="text-gray-600 dark:text-gray-300">Review the summary, test yourself with the quiz, master concepts with flashcards, and clarify doubts with the AI tutor.</Card.Content>
                       </Card>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 bg-crayon-blue text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold">Ready to Ace Your Exams?</h2>
                    <p className="mt-2 text-blue-100 max-w-2xl mx-auto">Stop cramming and start understanding. Let StudyGenie be your personal AI study partner.</p>
                    <Button size="lg" onClick={() => onNavigate('signup')} className="mt-8 bg-blue text-crayon-blue hover:bg-blue-100">
                        Generate Your First Study Guide
                    </Button>
                </div>
            </section>
        </main>
        
        <footer className="py-6 border-t border-light-gray dark:border-gray-700">
            <div className="container mx-auto px-4 text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} StudyGenie. All rights reserved.</p>
            </div>
        </footer>
    </div>
  );
};

export default LandingPage;