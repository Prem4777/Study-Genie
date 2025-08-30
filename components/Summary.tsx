
import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { LanguageIcon } from './icons/Icons';
import { translateText } from '../services/geminiService';

interface SummaryProps {
  content: string;
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

const Summary: React.FC<SummaryProps> = ({ content }) => {
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('');
  
  const handleTranslate = async (langCode: string) => {
    setTargetLanguage(langCode);
    if (!langCode) {
        setTranslatedContent(null);
        setError(null);
        return;
    }
    setIsTranslating(true);
    setError(null);
    try {
        const translation = await translateText(content, langCode);
        setTranslatedContent(translation);
    } catch (e) {
        setError('Translation failed. Please try again.');
        setTranslatedContent(null);
    } finally {
        setIsTranslating(false);
    }
  };

  const contentToDisplay = translatedContent || content;

  const renderFormattedContent = (text: string) => {
    // Remove any bold markdown asterisks and filter out empty lines
    const cleanedText = text.replace(/\*\*/g, '');
    const lines = cleanedText.split('\n').filter(line => line.trim() !== '');

    return (
      <div className="space-y-3">
        {lines.map((line, index) => {
          const trimmedLine = line.trim();
          // Check for markdown list format
          if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
            const listItemContent = trimmedLine.substring(2);
            return (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-[7px] flex-shrink-0 w-2 h-2 rounded-full bg-crayon-blue dark:bg-crayon-yellow"></div>
                <p className="text-dark-gray dark:text-gray-300 leading-relaxed">{listItemContent}</p>
              </div>
            );
          }
          // Fallback for non-list lines
          return <p key={index} className="leading-relaxed">{trimmedLine}</p>;
        })}
      </div>
    );
  };


  return (
    <Card>
      <Card.Header>
        <div className="flex justify-between items-start">
            <div>
                <Card.Title>Summary</Card.Title>
                <Card.Description>A detailed, point-wise overview of your study material.</Card.Description>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                {translatedContent && (
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
      </Card.Header>
      <Card.Content>
        {isTranslating ? (
            <div className="flex justify-center items-center h-40">
                <Spinner className="text-crayon-blue" /> 
            </div>
        ) : error ? (
            <p className="text-crayon-red">{error}</p>
        ) : (
            <div className="max-w-none">
              {renderFormattedContent(contentToDisplay)}
            </div>
        )}
      </Card.Content>
    </Card>
  );
};

export default Summary;