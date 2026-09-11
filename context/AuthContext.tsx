import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User, AuthFormData } from '@/types';
import {
  AUTH_CONFIRM_PATH,
  AUTH_RESET_PATH,
  getAuthRedirectUrl,
  parseAuthCallbackParams,
} from '@/utils/authLinks';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  passwordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (data: AuthFormData) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  passwordRecovery: false,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
  resetPassword: async () => ({}),
  updatePassword: async () => ({}),
});

const seenAuthUrls = new Set<string>();

async function consumeAuthUrl(
  url: string | null,
  onRecovery: () => void
): Promise<void> {
  if (!url || seenAuthUrls.has(url)) return;
  const parsed = parseAuthCallbackParams(url);
  if (!parsed.code && !parsed.accessToken) return;
  seenAuthUrls.add(url);

  const isRecovery = parsed.type === 'recovery' || url.includes('reset-password');
  if (isRecovery) {
    onRecovery();
  }

  try {
    if (parsed.code) {
      await supabase.auth.exchangeCodeForSession(parsed.code);
    } else if (parsed.accessToken && parsed.refreshToken) {
      await supabase.auth.setSession({
        access_token: parsed.accessToken,
        refresh_token: parsed.refreshToken,
      });
    }
  } catch (error) {
    console.error('Error handling auth redirect:', error);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    let sessionReady = false;
    let linkReady = Platform.OS === 'web';

    const finishLoading = () => {
      if (sessionReady && linkReady) {
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUserFromSupabaseUser(session.user);
      }
      sessionReady = true;
      finishLoading();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        setUserFromSupabaseUser(nextSession.user);
      } else {
        setUser(null);
      }
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true);
      } else if (event === 'SIGNED_OUT') {
        setPasswordRecovery(false);
      }
      sessionReady = true;
      finishLoading();
    });

    if (Platform.OS !== 'web') {
      Linking.getInitialURL()
        .then((url) => consumeAuthUrl(url, () => setPasswordRecovery(true)))
        .finally(() => {
          linkReady = true;
          finishLoading();
        });

      const linkSub = Linking.addEventListener('url', ({ url }) => {
        consumeAuthUrl(url, () => setPasswordRecovery(true));
      });

      return () => {
        subscription.unsubscribe();
        linkSub.remove();
      };
    }

    return () => subscription.unsubscribe();
  }, []);

  const setUserFromSupabaseUser = (supabaseUser: SupabaseUser) => {
    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      full_name: supabaseUser.user_metadata?.full_name || '',
      phone: supabaseUser.user_metadata?.phone || '',
      avatar_url: supabaseUser.user_metadata?.avatar_url || '',
      created_at: supabaseUser.created_at,
      updated_at: supabaseUser.updated_at || supabaseUser.created_at,
    });
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'Erro inesperado ao fazer login' };
    }
  };

  const signUp = async ({ email, password, fullName, phone }: AuthFormData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthRedirectUrl(AUTH_CONFIRM_PATH),
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user && !data.session) {
        return { error: 'Verifique seu email para confirmar a conta' };
      }

      return {};
    } catch (error) {
      return { error: 'Erro inesperado ao criar conta' };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setPasswordRecovery(false);
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Error in signOut:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getAuthRedirectUrl(AUTH_RESET_PATH),
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'Erro inesperado ao enviar email de recuperação' };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        return { error: error.message };
      }
      setPasswordRecovery(false);
      return {};
    } catch (error) {
      return { error: 'Erro inesperado ao atualizar a senha' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        passwordRecovery,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
