import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { StudyMaterialInput, FilePart } from '../types';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { DocumentTextIcon, DocumentArrowUpIcon, PhotoIcon } from './icons/Icons';

interface MaterialInputProps {
  onGenerate: (title: string, material: StudyMaterialInput, difficulty: 'Easy' | 'Medium' | 'Hard') => void;
  isLoading: boolean;
  error: string | null;
}

type InputMode = 'text' | 'pdf' | 'screenshot';
type Difficulty = 'Easy' | 'Medium' | 'Hard';

const ModeButton: React.FC<{
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ isActive, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 p-3 font-medium border-b-2 transition-colors ${
      isActive
        ? 'border-crayon-blue text-crayon-blue'
        : 'border-transparent text-gray-500 hover:text-dark-gray dark:hover:text-white'
    }`}
  >
    {children}
  </button>
);

const MaterialInput: React.FC<MaterialInputProps> = ({ onGenerate, isLoading, error }) => {
  const [mode, setMode] = useState<InputMode>('text');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteAreaRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };
  
  const handlePaste = useCallback((event: ClipboardEvent) => {
      if (mode !== 'screenshot') return;
      
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
              const file = items[i].getAsFile();
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPastedImage(e.target?.result as string);
                };
                reader.readAsDataURL(file);
                event.preventDefault();
                break;
              }
          }
      }
  }, [mode]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
        document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);


  const dataUrlToBase64 = (dataUrl: string) => dataUrl.split(',')[1];
  
  const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(dataUrlToBase64(reader.result as string));
    reader.onerror = error => reject(error);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const studyInput: StudyMaterialInput = { text: '', files: [] };

    if (mode === 'text') {
      studyInput.text = text;
    } else if (mode === 'pdf' && pdfFile) {
      const base64Data = await fileToBase64(pdfFile);
      studyInput.files?.push({ mimeType: pdfFile.type, data: base64Data });
    } else if (mode === 'screenshot' && pastedImage) {
      const base64Data = dataUrlToBase64(pastedImage);
      const mimeType = pastedImage.match(/data:(image\/\w+);base64,/)?.[1] || 'image/png';
      studyInput.files?.push({ mimeType: mimeType, data: base64Data });
    }
    
    onGenerate(title, studyInput, difficulty);
  };
  
  const isInputAvailable = text.trim() !== '' || pdfFile !== null || pastedImage !== null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-dark-gray dark:text-white">Start Your Study Session</h2>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Provide your study material and set your preferences below.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-xl border border-light-gray dark:border-gray-700 shadow-sm p-2">
        <div className="px-4 pt-4 space-y-4">
          <div>
            <label htmlFor="session-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Study Session Title
            </label>
            <input
                type="text"
                id="session-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Chapter 5: Photosynthesis"
                className="w-full p-2 border border-light-gray rounded-lg shadow-sm focus:ring-2 focus:ring-crayon-blue focus:border-crayon-blue bg-bg-light/50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition"
                disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex border-b border-light-gray dark:border-gray-700">
          <ModeButton isActive={mode === 'text'} onClick={() => setMode('text')}><DocumentTextIcon className="w-5 h-5"/> Text</ModeButton>
          <ModeButton isActive={mode === 'pdf'} onClick={() => setMode('pdf')}><DocumentArrowUpIcon className="w-5 h-5"/> PDF</ModeButton>
          <ModeButton isActive={mode === 'screenshot'} onClick={() => setMode('screenshot')}><PhotoIcon className="w-5 h-5"/> Screenshot</ModeButton>
        </div>

        <div className="p-4 min-h-[320px] flex flex-col justify-center items-center">
          {mode === 'text' && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your study material here..."
              className="w-full h-80 p-4 border border-light-gray rounded-lg shadow-sm focus:ring-2 focus:ring-crayon-blue focus:border-crayon-blue bg-bg-light/50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 resize-y transition"
              disabled={isLoading}
            />
          )}
          {mode === 'pdf' && (
             <div className="text-center">
                <input type="file" accept="application/pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    <DocumentArrowUpIcon className="w-5 h-5 mr-2"/> Select PDF
                </Button>
                {pdfFile && <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Selected: {pdfFile.name} <button type="button" onClick={()=>setPdfFile(null)} className="ml-2 text-crayon-red font-semibold">(&times;)</button></p>}
             </div>
          )}
          {mode === 'screenshot' && (
            <div ref={pasteAreaRef} className="w-full flex flex-col items-center justify-center gap-4 text-center p-4 border-2 border-dashed border-light-gray dark:border-gray-600 rounded-lg h-full">
               {pastedImage ? (
                  <div className="relative">
                    <img src={pastedImage} alt="Pasted screenshot" className="max-h-64 rounded-lg shadow-md" />
                     <Button type="button" variant="destructive" size="sm" onClick={() => setPastedImage(null)} className="mt-4">Clear Screenshot</Button>
                  </div>
               ) : (
                <div className="text-gray-500 dark:text-gray-400">
                    <PhotoIcon className="w-12 h-12 mx-auto mb-2"/>
                    <p className="font-semibold">Paste your screenshot here</p>
                    <p className="text-sm">(Ctrl+V or Cmd+V)</p>
                </div>
               )}
            </div>
          )}
        </div>

        <div className="px-4 pb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quiz Difficulty</label>
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(level => (
                    <button
                        type="button"
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`w-full px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                            difficulty === level
                                ? 'bg-crayon-blue text-white shadow'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'
                        }`}
                        disabled={isLoading}
                    >
                        {level}
                    </button>
                ))}
            </div>
        </div>

        {error && <p className="text-crayon-red text-sm text-center px-4">{error}</p>}
        <div className="flex justify-center p-4 border-t border-light-gray dark:border-gray-700">
          <Button type="submit" disabled={isLoading || !isInputAvailable} size="lg">
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                Generating...
              </>
            ) : (
              'Generate Study Aids'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MaterialInput;