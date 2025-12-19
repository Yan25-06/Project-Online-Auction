import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../config/supabase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Kiểm tra session ngay khi App vừa load (để giữ đăng nhập khi F5)
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);
            } catch (error) {
                console.error("Lỗi check session:", error);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // 2. Lắng nghe sự kiện Login/Logout/Refresh Token tự động
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                // console.log("Auth event:", _event, session); // Bật lên nếu muốn debug
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        // Dọn dẹp listener khi unmount
        return () => subscription.unsubscribe();
    }, []);

    // Hàm logout (wrapper để gọi ở đâu cũng được)
    const logout = async () => {
        await supabase.auth.signOut();
    };

    const value = {
        session,
        user,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Chỉ render App khi đã check xong session để tránh flash giao diện */}
            {!loading ? children : <div className="h-screen flex items-center justify-center">Đang tải...</div>}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
};