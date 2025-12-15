// src/components/common/SearchBar.jsx
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      // Chuyển hướng sang trang search với tham số query
      navigate(`/search?q=${encodeURIComponent(keyword)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
      <input
        type="text"
        placeholder="Tìm kiếm sản phẩm..."
        className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <button 
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
      >
        <Search size={20} />
      </button>
    </form>
  );
};
export default SearchBar;