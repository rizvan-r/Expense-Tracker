import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_tracker_saved_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Sync user profile into `public.users` table in Supabase
  const syncUserProfile = async (authUser) => {
    if (!isSupabaseConfigured || !authUser) return;

    try {
      const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User';
      const avatarUrl = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || '';

      // 1. Fetch user profile from public.users
      const { data: existingUser, error: fetchErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (existingUser) {
        // Update user metadata (full_name, avatar_url, email)
        const { data: updated, error: updateErr } = await supabase
          .from('users')
          .update({
            full_name: existingUser.full_name || fullName,
            avatar_url: avatarUrl || existingUser.avatar_url,
            email: authUser.email
          })
          .eq('id', authUser.id)
          .select()
          .maybeSingle();

        const profileData = (!updateErr && updated) ? updated : existingUser;
        setUserProfile(profileData);
        try {
          localStorage.setItem('ai_tracker_saved_user_profile', JSON.stringify(profileData));
        } catch (e) {}
      } else {
        // 2. Insert new user into public.users with complete default columns
        const newUserObj = {
          id: authUser.id,
          email: authUser.email,
          full_name: fullName,
          avatar_url: avatarUrl,
          monthly_income: 85000,
          monthly_budget: 55000,
          currency: '₹',
          occupation: 'Professional',
          financial_strategy: 'Moderate Wealth Builder',
          savings_goal_target: 200000,
          emergency_fund_target: 150000,
          avatar_color: '#6366f1',
          created_at: new Date().toISOString()
        };

        const { data: inserted, error: insertErr } = await supabase
          .from('users')
          .upsert(newUserObj, { onConflict: 'id' })
          .select()
          .maybeSingle();

        const profileData = (!insertErr && inserted) ? inserted : newUserObj;
        setUserProfile(profileData);
        try {
          localStorage.setItem('ai_tracker_saved_user_profile', JSON.stringify(profileData));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Error syncing user profile to Supabase users table:', err);
    }
  };

  // Initialize session and set up auth state listener
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      setAuthError(null);
      if (isSupabaseConfigured) {
        try {
          const { data: { session: initialSession }, error } = await supabase.auth.getSession();
          if (error) throw error;

          if (initialSession && mounted) {
            setSession(initialSession);
            setUser(initialSession.user);
            if (initialSession.provider_token) {
              localStorage.setItem('ai_tracker_google_provider_token', initialSession.provider_token);
            }
            await syncUserProfile(initialSession.user);
          }
        } catch (err) {
          console.warn('Supabase auth session error:', err);
          setAuthError(err.message || 'Session verification failed.');
        } finally {
          if (mounted) setIsLoading(false);
        }

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
          if (!mounted) return;

          setSession(newSession);
          if (newSession?.user) {
            setUser(newSession.user);
            if (newSession.provider_token) {
              localStorage.setItem('ai_tracker_google_provider_token', newSession.provider_token);
            }
            await syncUserProfile(newSession.user);
          } else {
            setUser(null);
            setUserProfile(null);
            localStorage.removeItem('ai_tracker_saved_user_profile');
          }
          setIsLoading(false);
        });

        return () => {
          authListener?.subscription?.unsubscribe();
        };
      } else {
        const savedAuth = localStorage.getItem('ai_tracker_is_authenticated') === 'true';
        if (savedAuth) {
          const fallbackUser = userProfile || {
            id: 'local-user-1',
            email: 'user@example.com',
            full_name: 'Richu Sharma',
            monthly_income: 85000,
            monthly_budget: 55000,
            currency: '₹',
            occupation: 'Software Engineer',
            financial_strategy: 'Moderate Wealth Builder'
          };
          setUser({
            id: fallbackUser.id,
            email: fallbackUser.email,
            user_metadata: { full_name: fallbackUser.full_name }
          });
          if (!userProfile) setUserProfile(fallbackUser);
        }
        setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, [isSupabaseConfigured]);

  // Google OAuth Login Flow
  const loginWithGoogle = async () => {
    setAuthError(null);

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          scopes: 'email profile',
          queryParams: {
            access_type: 'online',
          },
        },
      });

      if (error) {
        setAuthError(error.message || 'Google OAuth Login failed');
        throw error;
      }
      return data;
    } else {
      localStorage.setItem('ai_tracker_is_authenticated', 'true');
      const fallback = userProfile || {
        id: `user-${Date.now()}`,
        email: 'user@example.com',
        full_name: 'Google User',
        monthly_income: 85000,
        monthly_budget: 55000,
        currency: '₹',
        occupation: 'Professional',
        financial_strategy: 'Moderate Wealth Builder'
      };
      setUserProfile(fallback);
      setUser({ id: fallback.id, email: fallback.email, user_metadata: { full_name: fallback.full_name } });
      return { success: true };
    }
  };

  // Email & Password Login
  const loginWithSupabase = async (email, password) => {
    setAuthError(null);

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
        throw error;
      }
      setSession(data.session);
      setUser(data.user);
      await syncUserProfile(data.user);
      return data;
    } else {
      localStorage.setItem('ai_tracker_is_authenticated', 'true');
      const fallback = {
        id: `user-${Date.now()}`,
        email: email,
        full_name: email.split('@')[0],
        monthly_income: 85000,
        monthly_budget: 55000,
        currency: '₹',
        occupation: 'Professional',
        financial_strategy: 'Moderate Wealth Builder'
      };
      setUserProfile(fallback);
      setUser({ id: fallback.id, email: fallback.email, user_metadata: { full_name: fallback.full_name } });
      return { success: true };
    }
  };

  // Sign Up Flow
  const signUpWithSupabase = async (email, password, fullName) => {
    setAuthError(null);

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });
      if (error) {
        setAuthError(error.message);
        throw error;
      }
      if (data.user) {
        setUser(data.user);
        await syncUserProfile(data.user);
      }
      return data;
    } else {
      localStorage.setItem('ai_tracker_is_authenticated', 'true');
      const fallback = {
        id: `user-${Date.now()}`,
        email: email,
        full_name: fullName || email.split('@')[0],
        monthly_income: 85000,
        monthly_budget: 55000,
        currency: '₹',
        occupation: 'Professional',
        financial_strategy: 'Moderate Wealth Builder'
      };
      setUserProfile(fallback);
      setUser({ id: fallback.id, email: fallback.email, user_metadata: { full_name: fallback.full_name } });
      return { success: true };
    }
  };

  // Update Profile details in Supabase
  const updateProfile = async (updatedFields) => {
    setUserProfile(prev => {
      const next = { ...prev, ...updatedFields };
      try {
        localStorage.setItem('ai_tracker_saved_user_profile', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    if (isSupabaseConfigured && (user?.id || session?.user?.id)) {
      const targetUserId = user?.id || session?.user?.id;
      try {
        const { error } = await supabase
          .from('users')
          .update(updatedFields)
          .eq('id', targetUserId);
        if (error) {
          console.warn('Supabase profile update warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase profile update exception:', err);
      }
    }
  };

  // Sign Out Flow
  const logout = async () => {
    setAuthError(null);
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('SignOut error:', e);
      }
    }
    localStorage.removeItem('ai_tracker_is_authenticated');
    localStorage.removeItem('ai_tracker_saved_user_profile');
    setSession(null);
    setUser(null);
    setUserProfile(null);
  };

  // Active profile computed state
  const activeProfile = userProfile || {
    id: user?.id || 'guest',
    full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
    email: user?.email || 'user@example.com',
    monthly_income: 85000,
    monthly_budget: 55000,
    currency: '₹',
    occupation: 'Professional',
    financial_strategy: 'Moderate Wealth Builder',
    avatar_color: '#10b981'
  };

  const currentUserInfo = user ? {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || user.user_metadata?.name || activeProfile?.full_name || 'User',
    avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || activeProfile?.avatar_url || '',
    created_at: user.created_at || activeProfile?.created_at || new Date().toISOString()
  } : null;

  return (
    <AuthContext.Provider value={{
      isAuthenticated: Boolean(user),
      user: currentUserInfo,
      session,
      userProfile,
      isLoading,
      authError,
      activeProfile,
      profiles: userProfile ? [userProfile] : [],
      loginWithGoogle,
      loginWithSupabase,
      signUpWithSupabase,
      updateProfile,
      logout,
      isSupabaseConfigured
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
