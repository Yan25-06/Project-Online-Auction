// src/context/WatchListContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const WatchListContext = createContext();

export const WatchListProvider = ({ children }) => {
  const [watchList, setWatchList] = useState([]);

  // Load từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem("watchList");
    if (saved) {
      try {
        setWatchList(JSON.parse(saved));
      } catch {
        setWatchList([]);
      }
    }
  }, []);

  // Lưu vào localStorage
  useEffect(() => {
    localStorage.setItem("watchList", JSON.stringify(watchList));
  }, [watchList]);

  // Thêm / xóa product ID
  const toggleWatchList = (productId) => {
    setWatchList((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <WatchListContext.Provider value={{ watchList, toggleWatchList }}>
      {children}
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
