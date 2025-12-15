import { supabase } from '../config/supabase';

export const AuthService = {
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    localStorage.setItem('token', data.session.access_token);
    return data.user;
  },

  register: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    
    if (data.session) {
      localStorage.setItem('token', data.session.access_token);
    }
    
    return data.user;
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return data.user;
  },

  updateProfile: async (userData) => {
    const { data, error } = await supabase.auth.updateUser(userData);
    if (error) throw error;
    return data.user;
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  updatePassword: async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data.user;
  },

  // Session management
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        localStorage.setItem('token', session.access_token);
      } else {
        localStorage.removeItem('token');
      }
      callback(event, session);
    });
    return data.subscription;
  },
};
