import { supabase } from './supabaseClient';
import type { User } from '../types';
import type { AuthError, User as SupabaseUser } from '@supabase/supabase-js';

export const signup = async (name: string, email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
      },
    },
  });

  if (error) {
    return { user: null, error };
  }
  
  if (data.user) {
    // The user's name is now stored in the user_metadata during signup.
    // There is no longer a need to insert into a separate 'profiles' table,
    // which was the source of the error due to missing database permissions (RLS).
    // This simplification makes the app's setup much more robust.
    const user: User = { 
        id: data.user.id, 
        name: data.user.user_metadata.name as string || name,
        email: data.user.email! 
    };
    return { user, error: null };
  }
  
  return { user: null, error: new Error("An unknown error occurred during signup.") as AuthError };
};

export const login = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { error };
};

export const logout = async (): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.signOut();
  return { error };
};


export const getUserProfile = async (user: SupabaseUser): Promise<User | null> => {
    // The user profile is derived directly from the authenticated user object.
    // The name is stored in user_metadata during signup.
    // This removes the need for a separate 'profiles' table and its RLS policies.
    if (user && user.email) {
        return {
            id: user.id,
            name: user.user_metadata.name || 'User', // Fallback name
            email: user.email,
        };
    }
    return null;
};