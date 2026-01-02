// import { resolve } from 'path';
import { supabase } from "../config/supabase";
import { UserService } from "./backendService";
export const AuthService = {
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    localStorage.setItem("token", data.session.access_token);
    return data.user;
  },

  register: async (email, password, userData = {}) => {
    // Pass user metadata in the options object so Supabase stores it in user metadata
    const options = { data: userData };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });
    if (error) throw error;

    if (data.session) {
      localStorage.setItem("token", data.session.access_token);
      localStorage.setItem("user", data.user);
    }
    const res = await UserService.update(data.user.id, userData);
    console.log("Debug user:" + res);
    return data.user;
  },

  sendOtp: async (email) => {
    console.log("Đang gửi OTP đến:", email);
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true,
      },
    });
    if (error) {
      console.error("Lỗi gửi OTP:", error);
      throw error;
    }
    return data;
  },

  verifyOtp: async ({ email, token }) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) {
      console.error("Lỗi xác thực:", error);
      throw error;
    }
    if (data.session) {
      localStorage.setItem("token", data.session.access_token);
    }
    return data;
  },

  updateUserPasswordAndProfile: async (password, userData) => {
    const { data, error } = await supabase.auth.updateUser({
      password: password,
      data: userData,
    });
    if (error) throw error;
    if (data?.user?.id) {
      try {
        await UserService.update(data.user.id, userData);
      } catch (backendError) {
        console.error("Lỗi lưu DB backend:", backendError);
      }
    }
    return data;
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem("token");
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return data.user;
  },

  updateProfile: async (userData) => {
    const { data, error } = await supabase.auth.updateUser({
      data: userData,
    });
    if (error) throw error;
    if (data?.user?.id) {
      try {
        await UserService.update(data.user.id, userData);
      } catch (backendError) {
        console.error("Lỗi lưu DB backend:", backendError);
      }
    }
    return data.user;
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  sendPasswordResetOtp: async (email) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false,
      },
    });
    if (error) throw error;
    return data;
  },

  verifyPasswordResetOtp: async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) throw error;
    if (data.session) {
      localStorage.setItem("token", data.session.access_token);
    }
    return data;
  },

  updatePassword: async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data.user;
  },

  // Session management
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // OAuth Login
  loginWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
    return data;
  },

  loginWithFacebook: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
    return data;
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        localStorage.setItem("token", session.access_token);
      } else {
        localStorage.removeItem("token");
      }
      callback(event, session);
    });
    return data.subscription;
  },
};
