
import React, { useState, useCallback, useEffect } from 'react';
import type { QuizQuestion, QuizResult, User } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { CheckCircleIcon, XCircleIcon, SparklesIcon } from './icons/Icons';
import * as dataService from '../services/dataService';
import { Spinner } from './ui/Spinner';

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (result: QuizResult) => void;
  sessionId: string;
  user: User;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

// Custom hook for debouncing a value
function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const Quiz: React.FC<QuizProps> = ({ questions, onComplete, sessionId, user, difficulty }) => {
  const [stateLoaded, setStateLoaded] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load state from DB on component mount
  useEffect(() => {
    const loadState = async () => {
      const savedState = await dataService.getToolState(user.id, sessionId, 'quiz');
      if (savedState && typeof savedState.currentQuestionIndex === 'number') {
        setCurrentQuestionIndex(savedState.currentQuestionIndex);
        setSelectedAnswers(savedState.selectedAnswers || {});
      }
      setStateLoaded(true);
    };
    loadState();
  }, [sessionId, user.id]);

  // Debounce state changes to avoid excessive DB writes
  const debouncedState = useDebounce({ currentQuestionIndex, selectedAnswers }, 1000);
  
  // Save state to DB when debounced state changes
  useEffect(() => {
    if (stateLoaded && !isSubmitted) {
      dataService.saveToolState(user.id, sessionId, 'quiz', debouncedState);
    }
  }, [debouncedState, stateLoaded, isSubmitted, user.id, sessionId]);

  const handleSelectAnswer = (option: string) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: option
    }));
  };

  const handleSubmit = useCallback(async () => {
    setIsSubmitted(true);
    const score = questions.reduce((acc, question, index) => {
      return selectedAnswers[index] === question.correctAnswer ? acc + 1 : acc;
    }, 0);
    onComplete({
      score,
      total: questions.length,
      date: new Date().toISOString()
    });
    await dataService.clearToolState(user.id, sessionId, 'quiz');
  }, [questions, selectedAnswers, onComplete, user.id, sessionId]);

  const handleRestart = async () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    await dataService.clearToolState(user.id, sessionId, 'quiz');
  };
  
  if (!stateLoaded) {
    return <Card><Card.Content className="flex justify-center items-center h-64"><Spinner/></Card.Content></Card>
  }

  if (!questions || questions.length === 0) {
    return <Card><Card.Content>No quiz questions available.</Card.Content></Card>;
  }

  if (isSubmitted) {
    const score = questions.reduce((acc, q, i) => selectedAnswers[i] === q.correctAnswer ? acc + 1 : acc, 0);
    return (
      <Card>
        <Card.Header>
          <Card.Title>Quiz Results</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold">You Scored</h3>
            <p className="text-5xl font-extrabold text-crayon-blue my-2">{score} / {questions.length}</p>
          </div>
          <div className="divide-y divide-light-gray dark:divide-gray-700 border-t border-light-gray dark:border-gray-700">
            {questions.map((q, index) => (
              <div key={index} className="py-4">
                <p className="font-semibold mb-3">{index + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((option) => {
                    const isCorrect = option === q.correctAnswer;
                    const isSelected = option === selectedAnswers[index];

                    let optionClass = 'w-full text-left p-3 rounded-lg border flex items-center justify-between transition-colors text-sm ';

                    if (isCorrect) {
                      optionClass += 'bg-crayon-green/20 border-crayon-green/50 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      optionClass += 'bg-crayon-red/20 border-crayon-red/50';
                    } else {
                      optionClass += 'bg-gray-50 dark:bg-gray-700/50 border-transparent text-gray-600 dark:text-gray-300';
                    }

                    return (
                      <div key={option} className={optionClass}>
                        <span>{option}</span>
                        {isCorrect && <CheckCircleIcon className="w-5 h-5 text-crayon-green" />}
                        {isSelected && !isCorrect && <XCircleIcon className="w-5 h-5 text-crayon-red" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-4 border-t border-light-gray dark:border-gray-700">
            <Button onClick={handleRestart}>Try Again</Button>
          </div>
        </Card.Content>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Card>
      <Card.Header>
        <div className="flex justify-between items-center">
            <div>
              <Card.Title>Quiz Time!</Card.Title>
              <Card.Description>Question {currentQuestionIndex + 1} of {questions.length}</Card.Description>
            </div>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
              difficulty === 'Easy' ? 'bg-crayon-green/20 text-crayon-green-800 dark:text-crayon-green-100' :
              difficulty === 'Medium' ? 'bg-crayon-yellow/30 text-yellow-800 dark:text-yellow-100' :
              'bg-crayon-red/20 text-crayon-red-800 dark:text-crayon-red-100'
            }`}>
              {difficulty}
            </span>
        </div>
      </Card.Header>
      <Card.Content className="space-y-6">
        <p className="text-lg font-semibold">{currentQuestion.question}</p>
        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === option;
            return (
              <button
                key={option}
                onClick={() => handleSelectAnswer(option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-crayon-blue bg-crayon-blue/10 ring-2 ring-crayon-blue'
                    : 'border-light-gray dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-light-gray dark:border-gray-700">
          <Button variant="secondary" onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))} disabled={currentQuestionIndex === 0}>Previous</Button>
          {currentQuestionIndex === questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={Object.keys(selectedAnswers).length !== questions.length}>Submit Quiz</Button>
          ) : (
            <Button onClick={() => setCurrentQuestionIndex(p => Math.min(questions.length - 1, p + 1))} disabled={!selectedAnswers[currentQuestionIndex]}>Next</Button>
          )}
        </div>
      </Card.Content>
    </Card>
  );
};

export default Quiz;