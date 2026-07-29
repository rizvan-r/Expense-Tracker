import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { MULTI_PROFILES } from '../services/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const [profiles, setProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_tracker_all_profiles');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : MULTI_PROFILES;
    } catch (e) {
      return MULTI_PROFILES;
    }
  });

  const [activeProfileId, setActiveProfileId] = useState(() => {
    try {
      return localStorage.getItem('ai_tracker_active_profile_id') || MULTI_PROFILES[0].id;
    } catch (e) {
      return MULTI_PROFILES[0].id;
    }
  });

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || MULTI_PROFILES[0];

  // Helper to ensure user record exists in `public.users` table
  const syncUserProfile = async (authUser) => {
    if (!isSupabaseConfigured || !authUser) return;

    try {
      const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User';
      const avatarUrl = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || '';

      const { data, error } = await supabase
        .from('users')
        .upsert(
          {
            id: authUser.id,
            email: authUser.email,
            full_name: fullName,
            avatar_url: avatarUrl,
            created_at: new Date().toISOString()
          },
          { onConflict: 'id' }
        )
        .select()
        .single();

      if (!error && data) {
        setUserProfile(data);
      }
    } catch (err) {
      console.warn('Error syncing user profile to Supabase users table:', err);
    }
  };

  // Initialize session and set up authentication listener
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      setAuthError(null);
      if (isSupabaseConfigured) {
        try {
          // Fetch active session from Supabase
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

        // Listen for realtime auth state changes (login, logout, token refresh)
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
          }
          setIsLoading(false);
        });

        return () => {
          authListener?.subscription?.unsubscribe();
        };
      } else {
        // Fallback: Check local auth state for demo testing
        const savedAuth = localStorage.getItem('ai_tracker_is_authenticated') === 'true';
        if (savedAuth) {
          const curProf = profiles.find(p => p.id === activeProfileId) || profiles[0];
          setUser({
            id: curProf.id,
            email: curProf.email,
            user_metadata: {
              full_name: curProf.full_name,
              avatar_url: ''
            }
          });
        }
        setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, [isSupabaseConfigured]);

  // Google OAuth Login Flow (Standard Unblocked Scopes)
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
      // Local Demo Google Login Fallback
      localStorage.setItem('ai_tracker_is_authenticated', 'true');
      const curProf = profiles.find(p => p.id === activeProfileId) || profiles[0];
      setUser({
        id: curProf.id,
        email: curProf.email,
        user_metadata: {
          full_name: curProf.full_name,
          avatar_url: ''
        }
      });
      return { success: true };
    }
  };

  // Manual Email & Password Login Flow
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
      const existing = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      const targetId = existing ? existing.id : profiles[0].id;
      setActiveProfileId(targetId);
      localStorage.setItem('ai_tracker_is_authenticated', 'true');
      const curProf = profiles.find(p => p.id === targetId) || profiles[0];
      setUser({
        id: curProf.id,
        email: curProf.email,
        user_metadata: { full_name: curProf.full_name }
      });
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
      createProfile({ email, full_name: fullName });
      return { success: true };
    }
  };

  // Demo Profile Login Selector
  const loginWithProfile = (profileId) => {
    if (profiles.some(p => p.id === profileId)) {
      setActiveProfileId(profileId);
      localStorage.setItem('ai_tracker_is_authenticated', 'true');
      const curProf = profiles.find(p => p.id === profileId);
      setUser({
        id: curProf.id,
        email: curProf.email,
        user_metadata: { full_name: curProf.full_name }
      });
    }
  };

  // Create Profile helper
  const createProfile = (newProfData) => {
    const newId = `user-${Date.now()}`;
    const newProf = {
      id: newId,
      full_name: newProfData.full_name || 'New User',
      email: newProfData.email || `${newProfData.full_name?.toLowerCase().replace(/\s+/g, '')}@example.com`,
      monthly_income: Number(newProfData.monthly_income) || 75000,
      monthly_budget: Number(newProfData.monthly_budget) || 45000,
      currency: '₹',
      savings_goal_target: Number(newProfData.savings_goal_target) || 150000,
      emergency_fund_target: Number(newProfData.emergency_fund_target) || 100000,
      occupation: newProfData.occupation || 'Professional',
      financial_strategy: newProfData.financial_strategy || 'Moderate Wealth Builder',
      avatar_color: newProfData.avatar_color || '#10b981'
    };

    setProfiles(prev => [...prev, newProf]);
    setActiveProfileId(newId);
    localStorage.setItem('ai_tracker_is_authenticated', 'true');
    setUser({
      id: newId,
      email: newProf.email,
      user_metadata: { full_name: newProf.full_name }
    });
  };

  // Update Active Profile helper
  const updateProfile = async (updatedFields) => {
    setProfiles(prev => {
      const nextProfiles = prev.map(p => (p.id === activeProfile?.id || p.id === activeProfileId) ? { ...p, ...updatedFields } : p);
      try {
        localStorage.setItem('ai_tracker_all_profiles', JSON.stringify(nextProfiles));
      } catch (e) {}
      return nextProfiles;
    });

    if (userProfile) {
      setUserProfile(prev => ({ ...prev, ...updatedFields }));
    }

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
    setSession(null);
    setUser(null);
    setUserProfile(null);
  };

  // Computed active user information
  const currentUserInfo = user ? {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || user.user_metadata?.name || userProfile?.full_name || activeProfile?.full_name || 'User',
    avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || userProfile?.avatar_url || '',
    created_at: user.created_at || userProfile?.created_at || new Date().toISOString()
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
      profiles,
      loginWithGoogle,
      loginWithSupabase,
      signUpWithSupabase,
      loginWithProfile,
      createProfile,
      updateProfile,
      logout,
      isSupabaseConfigured
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
