import React from 'react'
import { Search, Menu, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../../data/mockData';
import { useState } from 'react';
const SearchBar = ({ onSearch, currentSearch, goHome, onCategoryClick }) => {
    const [localSearch, setLocalSearch] = useState(currentSearch);
    const handleSearchSubmit = () => {
        onSearch(localSearch);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearchSubmit();
    };
  return (
    <div className="flex-1 w-full max-w-2xl relative">
    <div className="flex shadow-sm rounded-lg">
        <input 
            type="text" 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm kiếm sản phẩm" 
            className="flex-1 h-10 px-4 border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-l-lg sm:rounded-l-none"
        />
        <button 
            onClick={handleSearchSubmit}
            className="h-10 px-6 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
        <Search size={18} />
        </button>
    </div>
    </div>
  )
}

export default SearchBar