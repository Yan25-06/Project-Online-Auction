import React, { useState, useEffect } from "react";
import { User, Gavel, Heart, LogOut, ChevronDown } from "lucide-react"; // Thêm icon LogOut, ChevronDown
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useWatchList } from "../../context/WatchListContext";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { watchList } = useWatchList();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  // useEffect(() => {
  //   const storedUser = localStorage.getItem("user");
  //   if (storedUser) {
  //     try {
  //       setUser(JSON.parse(storedUser));
  //     } catch (error) {
  //       console.error("Lỗi đọc dữ liệu user", error);
  //     }
  //   }
  // }, []);

  // 2. Hàm xử lý Đăng xuất
  const handleLogout = () => {
    logout();

    // Reset state
    setShowDropdown(false);

    // Chuyển về trang login hoặc trang chủ
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Gavel size={24} />
              </div>
              <span className="text-xl font-bold text-blue-900 hidden md:block">
                Auction<span className="text-blue-600">Pro</span>
              </span>
            </div>
          </Link>

          <SearchBar />

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {/* Watchlist */}
            {watchList.length > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
                <Heart size={16} className="fill-red-600" /> {watchList.length}
              </div>
            )}

            {/* --- PHẦN XỬ LÝ LOGIC ĐĂNG NHẬP --- */}
            {user ? (
              // TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP
              <div className="relative flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end mr-1">
                  <span className="text-xs text-gray-500">Xin chào,</span>
                  {/* Ưu tiên hiển thị fullName, nếu không có thì lấy email */}
                  <span className="text-sm font-bold text-blue-900">
                    {user.user_metadata.full_name || user.email}
                  </span>
                </div>

                {/* Avatar (Giả lập) */}
                <div className="h-9 w-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {/* Lấy chữ cái đầu của tên */}
                  {(user.user_metadata.full_name || "U").charAt(0).toUpperCase()}
                </div>

                {/* Nút Đăng xuất */}
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-600 transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium text-sm"
                >
                  <User size={20} />
                  <span className="hidden sm:inline">Đăng nhập</span>
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
