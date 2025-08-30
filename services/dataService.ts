import { supabase } from './supabaseClient';
import type { QuizResult, StudySession, StudyMaterialInput, StudyAids } from '../types';

export type { StudyMaterialInput };

// Fetch all study sessions for a user, including their related quiz results
export const getStudyHistory = async (userId: string): Promise<StudySession[]> => {
    const { data, error } = await supabase
        .from('study_sessions')
        .select(`
            id,
            title,
            created_at,
            study_material,
            study_aids,
            quiz_results (
                score,
                total,
                created_at
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching study history:', error);
        throw error;
    }

    // Map the Supabase response to our app's data structure
    return data.map(session => ({
        id: session.id.toString(),
        title: session.title,
        date: session.created_at,
        studyMaterial: session.study_material,
        studyAids: session.study_aids,
        quizResults: session.quiz_results.map((r: any) => ({
            score: r.score,
            total: r.total,
            date: r.created_at,
        })),
    }));
};

// Add a new study session
export const addStudySession = async (userId: string, sessionData: { title: string; studyMaterial: StudyMaterialInput; studyAids: StudyAids }): Promise<StudySession> => {
    const { data, error } = await supabase
        .from('study_sessions')
        .insert({
            user_id: userId,
            title: sessionData.title,
            study_material: sessionData.studyMaterial,
            study_aids: sessionData.studyAids,
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding study session:', error);
        throw error;
    }

    return {
        id: data.id.toString(),
        title: data.title,
        date: data.created_at,
        studyMaterial: data.study_material,
        studyAids: data.study_aids,
        quizResults: [],
    };
};

// Add a new quiz result to a session
export const addQuizResult = async (sessionId: string, result: Omit<QuizResult, 'date'>): Promise<void> => {
    const { error } = await supabase
        .from('quiz_results')
        .insert({
            session_id: sessionId,
            score: result.score,
            total: result.total,
        });

    if (error) {
        console.error('Error adding quiz result:', error);
        throw error;
    }
};

// Functions for saving/loading transient tool state
type Tool = 'quiz' | 'flashcards' | 'tutor';

export const getToolState = async (userId: string, sessionId: string, tool: Tool): Promise<any | null> => {
    const { data, error } = await supabase
        .from('tool_states')
        .select('state')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .eq('tool', tool)
        .maybeSingle();
    
    if (error) {
        console.error(`Error getting ${tool} state:`, error);
        return null;
    }
    return data ? data.state : null;
};

export const saveToolState = async (userId: string, sessionId: string, tool: Tool, state: any): Promise<void> => {
    const { error } = await supabase
        .from('tool_states')
        .upsert({
            user_id: userId,
            session_id: sessionId,
            tool: tool,
            state: state,
        }, { onConflict: 'user_id, session_id, tool' });

    if (error) {
        console.error(`Error saving ${tool} state:`, error);
    }
};

export const clearToolState = async (userId: string, sessionId: string, tool: Tool): Promise<void> => {
    const { error } = await supabase
        .from('tool_states')
        .delete()
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .eq('tool', tool);

    if (error) {
        console.error(`Error clearing ${tool} state:`, error);
    }
};


// The following functions operate on data already fetched from the backend.
export const calculateStudyStreak = (sessions: StudySession[]): number => {
    if (sessions.length === 0) return 0;

    const uniqueDays = [...new Set(sessions.map(s => new Date(s.date).toDateString()))]
        .map(dateStr => new Date(dateStr).getTime())
        .sort((a, b) => b - a);
    
    if (uniqueDays.length === 0) return 0;
    
    let streak = 0;
    let today = new Date();
    today.setHours(0,0,0,0);
    let yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = new Date(uniqueDays[0]).getTime() === today.getTime();
    const isYesterday = new Date(uniqueDays[0]).getTime() === yesterday.getTime();
    
    if (isToday || isYesterday) {
        streak = 1;
        for (let i = 0; i < uniqueDays.length - 1; i++) {
            const currentDay = new Date(uniqueDays[i]);
            const nextDay = new Date(uniqueDays[i+1]);
            
            const expectedNextDay = new Date(currentDay);
            expectedNextDay.setDate(currentDay.getDate() - 1);
            
            if (nextDay.getTime() === expectedNextDay.getTime()) {
                streak++;
            } else {
                break;
            }
        }
    }
    
    return streak;
};

export const getTopSubjects = (sessions: StudySession[]): [string, number][] => {
    const wordCounts: { [key: string]: number } = {};
    const stopWords = new Set(['a', 'an', 'the', 'in', 'on', 'of', 'for', 'with', 'and', 'chapter', 'session']);

    sessions.forEach(session => {
        const words = session.title.toLowerCase().match(/\b(\w+)\b/g) || [];
        words.forEach(word => {
            if (!stopWords.has(word) && isNaN(parseInt(word))) {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
            }
        });
    });

    return Object.entries(wordCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
};