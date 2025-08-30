
import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { StudyAids, StudyMaterialInput, FilePart, Flashcard } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const studyAidsSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A detailed, point-wise summary of the provided text, formatted using markdown bullet points (e.g., '* Point 1'). IMPORTANT: Do not use any bold formatting (**text**)."
    },
    quiz: {
      type: Type.ARRAY,
      description: "A multiple-choice quiz with 10 questions based on the text.",
      items: {
        type: Type.OBJECT,
        properties: {
          question: {
            type: Type.STRING,
            description: "The quiz question."
          },
          options: {
            type: Type.ARRAY,
            description: "An array of 4 possible answers.",
            items: { type: Type.STRING }
          },
          correctAnswer: {
            type: Type.STRING,
            description: "The correct answer from the options array."
          }
        },
        required: ["question", "options", "correctAnswer"]
      }
    },
    flashcards: {
      type: Type.ARRAY,
      description: "A set of 15 flashcards with a question and a concise answer.",
      items: {
        type: Type.OBJECT,
        properties: {
          question: {
            type: Type.STRING,
            description: "The question for the front of the flashcard."
          },
          answer: {
            type: Type.STRING,
            description: "The answer for the back of the flashcard."
          }
        },
        required: ["question", "answer"]
      }
    },
    difficulty: {
      type: Type.STRING,
      description: "The difficulty of the generated quiz.",
      enum: ["Easy", "Medium", "Hard"]
    }
  },
  required: ["summary", "quiz", "flashcards", "difficulty"]
};

type PromptPart = { text: string } | { inlineData: FilePart };

export const generateStudyAids = async (material: StudyMaterialInput, difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<StudyAids> => {
  const prompt = `Based on the following study material (which may include text and/or files like PDFs and images), please generate:
    1. A detailed, comprehensive summary presented in a point-wise format using markdown bullet points. IMPORTANT: Do not use any bold formatting in the summary.
    2. A 10-question multiple-choice quiz with a difficulty level of: ${difficulty}.
    3. 15 flashcards.
    
    Text Material (if any):
    ---
    ${material.text}
    ---
    
    Analyze all provided content to create the study aids. Provide the output in the specified JSON format, including the specified '${difficulty}' value for the 'difficulty' field.`;

  try {
    const contentParts: PromptPart[] = [
      { text: prompt }
    ];

    if (material.files) {
      material.files.forEach(file => {
        contentParts.push({
          inlineData: file
        });
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: contentParts },
      config: {
        responseMimeType: "application/json",
        responseSchema: studyAidsSchema,
      },
    });

    const jsonString = response.text;
    const parsed = JSON.parse(jsonString);

    // Basic validation
    if (!parsed.summary || !Array.isArray(parsed.quiz) || !Array.isArray(parsed.flashcards)) {
      throw new Error("Invalid data structure received from API.");
    }
    
    // Ensure difficulty is set, defaulting to the requested one if missing from response
    if (!parsed.difficulty) {
        parsed.difficulty = difficulty;
    }

    return parsed as StudyAids;
  } catch (error) {
    console.error("Error generating study aids:", error);
    throw new Error("Failed to parse study aids from Gemini API.");
  }
};

export const createTutorChat = (studyMaterial: string): Chat => {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are a helpful and encouraging AI tutor. Your knowledge is strictly limited to the following study material. Do not answer questions outside of this context. Be concise and clear in your explanations.
        
        --- STUDY MATERIAL ---
        ${studyMaterial}
        --- END STUDY MATERIAL ---`,
    },
  });
  return chat;
};


export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    const prompt = `Translate the following text to ${targetLanguage}. IMPORTANT: Return ONLY the translated text, without any introductory phrases, explanations, or markdown formatting.

    Text to translate:
    ---
    ${text}
    ---`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error translating text:", error);
        throw new Error("Failed to translate text from Gemini API.");
    }
};

export const translateFlashcards = async (cards: Flashcard[], targetLanguage: string): Promise<Flashcard[]> => {
    const prompt = `Translate the 'question' and 'answer' values for each object in the following JSON array to ${targetLanguage}. Return the translated array in the exact same JSON structure. Do not add any extra commentary or text.

    JSON to translate:
    ---
    ${JSON.stringify(cards)}
    ---`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                // @ts-ignore We can reuse the flashcards part of the main schema
                responseSchema: studyAidsSchema.properties.flashcards,
            },
        });

        const jsonString = response.text;
        const parsed = JSON.parse(jsonString);
        return parsed as Flashcard[];

    } catch (error) {
        console.error("Error translating flashcards:", error);
        throw new Error("Failed to translate flashcards from Gemini API.");
    }
};