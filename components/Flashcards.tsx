import React, { useState, useEffect, useMemo } from 'react';
import type { Flashcard, User } from '../types';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { LanguageIcon, ArrowLeftCircleIcon, ArrowRightCircleIcon } from './icons/Icons';
import { translateFlashcards } from '../services/geminiService';
import * as dataService from '../services/dataService';

interface FlashcardsProps {
  cards: Flashcard[];
  sessionId: string;
  user: User;
}

const LANGUAGES = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh-CN', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'mr', name: 'Marathi' },
];

const DOTS = '...';
const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

const Flashcards: React.FC<FlashcardsProps> = ({ cards, sessionId, user }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [translatedCards, setTranslatedCards] = useState<Flashcard[] | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('');
  const [stateLoaded, setStateLoaded] = useState(false);
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  const paginationRange = useMemo(() => {
    const totalCount = cards.length;
    const siblingCount = 1;
    const currentPage = currentIndex + 1;
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalCount || totalCount <= 7) {
      return range(1, totalCount);
    }
    
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalCount);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalCount;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = range(1, leftItemCount);
      return [...leftRange, DOTS, totalCount];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = range(totalCount - rightItemCount + 1, totalCount);
      return [firstPageIndex, DOTS, ...rightRange];
    }
     
    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }
    return range(1, totalCount);
  }, [cards.length, currentIndex]);

  // Load state from DB on mount
  useEffect(() => {
    const loadState = async () => {
      const savedState = await dataService.getToolState(user.id, sessionId, 'flashcards');
      if (savedState && typeof savedState.currentIndex === 'number' && savedState.currentIndex < cards.length) {
        setCurrentIndex(savedState.currentIndex);
      }
      setStateLoaded(true);
    };
    if (cards.length > 0) {
        loadState();
    } else {
        setStateLoaded(true);
    }
  }, [sessionId, user.id, cards.length]);
  
  // Save state to DB on change
  useEffect(() => {
    if (stateLoaded && !isAnimating) {
      dataService.saveToolState(user.id, sessionId, 'flashcards', { currentIndex });
    }
  }, [currentIndex, stateLoaded, user.id, sessionId, isAnimating]);

  const handleTranslate = async (langCode: string) => {
    setTargetLanguage(langCode);
    if (!langCode) {
      setTranslatedCards(null);
      return;
    }
    setIsTranslating(true);
    try {
      const translated = await translateFlashcards(cards, langCode);
      setTranslatedCards(translated);
    } catch (error) {
      console.error("Translation failed:", error);
      alert("Failed to translate flashcards.");
      setTranslatedCards(null);
    } finally {
      setIsTranslating(false);
    }
  };
  
  const navigate = (direction: 'next' | 'prev' | number) => {
    if (isAnimating || isTranslating) return;

    let nextIndex;
    let isNextAnimation;

    if (direction === 'next') {
        nextIndex = (currentIndex + 1) % cards.length;
        isNextAnimation = true;
    } else if (direction === 'prev') {
        nextIndex = (currentIndex - 1 + cards.length) % cards.length;
        isNextAnimation = false;
    } else {
        nextIndex = direction;
        if (nextIndex === currentIndex) return;
        isNextAnimation = nextIndex > currentIndex;
    }
    
    setIsAnimating(true);
    setIsFlipped(false);
    
    setAnimationClass(`animate-slideOut [--slide-out-to:${isNextAnimation ? '-150%' : '150%'}]`);
    
    setTimeout(() => {
      setCurrentIndex(nextIndex);
      setAnimationClass(`animate-slideIn [--slide-in-from:${isNextAnimation ? '150%' : '-150%'}]`);
      
      setTimeout(() => {
        setAnimationClass('');
        setIsAnimating(false);
      }, 300);
    }, 300);
  };
  
  if (!stateLoaded) {
    return <div className="flex justify-center items-center h-64"><Spinner/></div>
  }

  if (!cards || cards.length === 0) {
      return <div>No flashcards available.</div>
  }

  const cardsToDisplay = translatedCards || cards;
  const currentCard = cardsToDisplay[currentIndex];

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
       <div className="w-full flex justify-between items-center">
        <h2 className="text-2xl font-bold">Flashcards</h2>
        <div className="flex items-center gap-2 flex-shrink-0">
             {translatedCards && (
                <Button variant="secondary" size="sm" onClick={() => handleTranslate('')}>Show Original</Button>
            )}
            <div className="relative inline-block text-left">
                <select
                    value={targetLanguage}
                    onChange={(e) => handleTranslate(e.target.value)}
                    disabled={isTranslating}
                    className="appearance-none rounded-md bg-white dark:bg-gray-700 py-2 pl-3 pr-8 border border-light-gray dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-crayon-blue"
                >
                    <option value="">Translate...</option>
                    {LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                </select>
                <LanguageIcon className="w-5 h-5 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
        </div>
       </div>

      <div className="w-full max-w-lg h-72 relative flex items-center justify-center perspective-1000">
        {/* Background Cards for stack effect */}
        <div className="absolute w-[90%] h-[90%] bg-white dark:bg-gray-800 rounded-xl border border-light-gray dark:border-gray-700 shadow-md transform -rotate-3 transition-transform"></div>
        <div className="absolute w-[95%] h-[95%] bg-white dark:bg-gray-800 rounded-xl border border-light-gray dark:border-gray-700 shadow-md transform rotate-3 transition-transform"></div>

        <div className={`absolute w-full h-full ${animationClass}`}>
            {isTranslating ? (
                <div className="w-full h-full flex items-center justify-center p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-light-gray dark:border-gray-700">
                    <Spinner className="text-crayon-blue" />
                </div>
            ) : (
            <div
              className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
              onClick={() => !isAnimating && setIsFlipped(!isFlipped)}
            >
              <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-light-gray dark:border-gray-700 cursor-pointer">
                <p className="text-xl md:text-2xl font-semibold text-center text-dark-gray dark:text-gray-200">{currentCard.question}</p>
              </div>
              <div className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center p-6 rounded-xl shadow-lg bg-crayon-green/20 dark:bg-crayon-green/30 border border-crayon-green/40 cursor-pointer">
                <p className="text-lg md:text-xl text-center text-dark-gray dark:text-gray-200">{currentCard.answer}</p>
              </div>
            </div>
            )}
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-2 flex-wrap h-8">
        {paginationRange?.map((page, index) => {
          if (page === DOTS) {
            return <span key={DOTS + index} className="px-2 self-center text-gray-500">...</span>;
          }
          const pageIndex = (page as number) - 1;
          return (
            <button
              key={page}
              onClick={() => navigate(pageIndex)}
              disabled={isAnimating || isTranslating}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-light dark:focus:ring-offset-bg-dark focus:ring-crayon-blue ${
                currentIndex === pageIndex
                  ? 'bg-crayon-blue text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-8 w-full">
        <button onClick={() => navigate('prev')} disabled={isAnimating || isTranslating} className="text-gray-400 hover:text-crayon-blue transition-colors disabled:opacity-50">
          <ArrowLeftCircleIcon className="w-12 h-12" />
        </button>
        <button onClick={() => navigate('next')} disabled={isAnimating || isTranslating} className="text-gray-400 hover:text-crayon-blue transition-colors disabled:opacity-50">
          <ArrowRightCircleIcon className="w-12 h-12" />
        </button>
      </div>
    </div>
  );
};

const style = `
.perspective-1000 { perspective: 1000px; }
.transform-style-preserve-3d { transform-style: preserve-3d; }
.rotate-y-180 { transform: rotateY(180deg); }
.backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = style;
document.head.appendChild(styleSheet);


export default Flashcards;