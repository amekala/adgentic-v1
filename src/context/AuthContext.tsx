import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if we're using Safari
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Helper function to refresh session
  const refreshSession = async () => {
    try {
      console.log('Refreshing auth session...');
      // Force session refresh
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }
      
      console.log('Session refreshed:', !!data.session);
      setSession(data.session);
      setUser(data.session?.user || null);
    } catch (err) {
      console.error('Unexpected error during session refresh:', err);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // First try to get the session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          if (isSafari) {
            // Safari might have stricter cookie/storage policies
            console.log('Safari detected, trying alternate auth method...');
            await refreshSession();
          }
        } else {
          setSession(data.session);
          setUser(data.session?.user || null);
        }
      } catch (err) {
        console.error('Unexpected error during session fetch:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        
        setSession(newSession);
        setUser(newSession?.user || null);
        
        // Handle auth events
        if (event === 'SIGNED_IN') {
          toast.success('Signed in successfully');
          
          // Safari-specific handling: manually store some session info
          if (isSafari && newSession) {
            try {
              // Use localStorage as a fallback for Safari
              localStorage.setItem('supabase.auth.token', newSession.access_token);
            } catch (err) {
              console.error('Error with Safari session handling:', err);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          toast.info('Signed out');
          
          // Clear any Safari-specific storage
          if (isSafari) {
            try {
              localStorage.removeItem('supabase.auth.token');
            } catch (err) {
              console.error('Error clearing Safari session data:', err);
            }
          }
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Clear any previous session data to avoid conflicts
      if (isSafari) {
        try {
          localStorage.removeItem('supabase.auth.token');
        } catch (err) {
          console.log('Error clearing previous Safari auth data:', err);
        }
      }
      
      // Sign in with more explicit options
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password
      });
      
      if (!error) {
        toast.success('Signed in successfully');
        
        // Additional session verification for Safari
        if (isSafari) {
          await refreshSession();
        }
        
        navigate('/app');
      } else {
        toast.error(`Sign in failed: ${error.message}`);
      }
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An unexpected error occurred during sign in');
      return { error };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      });
      
      if (!error) {
        toast.success('Account created successfully. Please check your email to confirm your account.');
        navigate('/auth/confirm');
      } else {
        toast.error(`Sign up failed: ${error.message}`);
      }
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('An unexpected error occurred during sign up');
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // First clear any Safari-specific storage
      if (isSafari) {
        try {
          localStorage.removeItem('supabase.auth.token');
        } catch (err) {
          console.error('Error clearing Safari session data during signout:', err);
        }
      }
      
      // Then sign out normally
      await supabase.auth.signOut();
      toast.info('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error signing out');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      signIn, 
      signUp, 
      signOut,
      refreshSession 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
