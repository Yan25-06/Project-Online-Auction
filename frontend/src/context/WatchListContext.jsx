// src/context/WatchListContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { WatchlistService } from "../services/backendService";

const WatchListContext = createContext();

export const WatchListProvider = ({ children }) => {
  const [watchList, setWatchList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load 
  useEffect(() => {
    const initWatchList = async () => {
      if (user) {
        setIsLoading(true);
        try {
          // Gọi API lấy danh sách yêu thích của user
          // Giả sử API trả về mảng object: [{ product_id: 1, ... }, { product_id: 5, ... }]
          const res = await WatchlistService.findByUser(user.id);
          const products = res.data.map((item) => item.product); 
          setWatchList(products);
        } catch (err) {
          console.error("❌ Lỗi tải Watchlist từ server:", err);
        } finally {
          setIsLoading(false);
        }
      } 
      // TRƯỜNG HỢP B: CHƯA ĐĂNG NHẬP -> Lấy từ LocalStorage
      else {
        setWatchList([]);
      }
    };

    initWatchList();
  }, [user]);

  // Thêm / xóa product ID
  const toggleWatchList = async (product) => {
    const isExist = watchList.some(item => item.id === product.id);

    // BƯỚC 1: CẬP NHẬT UI NGAY LẬP TỨC (Optimistic Update)
    // Giúp app cảm giác cực nhanh, không cần chờ server phản hồi
    setWatchList((prev) => {
      if (isExist) return prev.filter(item => item.id !== product.id); // Xóa
      return [...prev, product]; // Thêm
    });

    // BƯỚC 2: GỌI API ĐỒNG BỘ (Nếu đã đăng nhập)
    if (user) {
      try {
        if (isExist) {
          // --- XÓA KHỎI SERVER ---
          await WatchlistService.remove(product.id);
        } else {
          // --- THÊM VÀO SERVER ---
          await WatchlistService.add(product.id);
        }
      } catch (err) {
        console.error("❌ Lỗi đồng bộ server:", err);
        
        // BƯỚC 3: ROLLBACK (Nếu API lỗi thì hoàn tác UI về cũ)
        setWatchList((prev) => {
          if (isExist) return [...prev, product]; // Thêm lại cái vừa xóa
          return prev.filter(item => item.id !== product.id); // Xóa cái vừa thêm
        });
        
        alert("Có lỗi xảy ra, không thể cập nhật danh sách yêu thích!");
      }
    }
  };

  return (
    <WatchListContext.Provider value={{ watchList, toggleWatchList }}>
      {!isLoading ? children : <div className="h-screen flex items-center justify-center">Đang tải...</div>}    
    </WatchListContext.Provider>
  );
};

export const useWatchList = () => {
  const context = useContext(WatchListContext);
  if (!context) {
    throw new Error("useWatchList must be used inside WatchListProvider");
  }
  return context;
};
