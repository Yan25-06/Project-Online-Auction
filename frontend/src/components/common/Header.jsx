import React from 'react'
import { User, Gavel, Heart } from 'lucide-react';
import { CATEGORIES } from '../../data/mockData';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useWatchList } from '../../context/WatchListContext';

const Header = () => {
    const { watchList } = useWatchList();
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
            {watchList.length > 0 && (
                <div className="flex items-center gap-1 text-sm font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
                    <Heart size={16} className="fill-red-600" /> {watchList.length}
                </div>
            )}
            <Link to="/login" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium text-sm">
                <User size={20} />
                <span className="sm:inline">Đăng nhập</span>
            </Link>
            <Link
                to="/register"
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
                Đăng ký
            </Link>
            </div>
        </div>
        </div>
    </header>
    );
}

export default Header