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
        <div className="relative group hidden sm:block">
        <button className="h-10 px-4 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg flex items-center gap-2 text-sm font-medium hover:bg-gray-200 transition-colors">
            <Menu size={16} />
            Danh mục
        </button>
        {/* Dropdown Menu */}
        <div className="absolute top-full left-0 w-56 bg-white shadow-xl rounded-lg py-2 hidden group-hover:block border border-gray-100 z-50">
            {CATEGORIES.map(cat => (
            <div 
                key={cat.id} 
                onClick={() => onCategoryClick(cat.id)}
                className="group/sub relative px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
            >
                <span className="text-sm text-gray-700">{cat.name}</span>
                <ChevronRight size={14} className="text-gray-400" />
            </div>
            ))}
        </div>
        </div>
        
        <input 
            type="text" 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm kiếm sản phẩm (Full-text search)..." 
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