import { User, ShoppingCart, Gavel,Heart, Flame } from 'lucide-react';
import { formatCurrency, isProductNew } from '../../utils/formatters';
import { useWatchList } from '../../context/WatchListContext';
import CountDown from './CountDown';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const isNew = isProductNew(product.createdAt); 
  const { watchList, toggleWatchList } = useWatchList();
  const isFavorite = watchList.includes(product.id);
  return (
    <Link to={`/products/${product.id}`}>
    <div className={`group bg-white rounded-xl border transition-all hover:shadow-lg hover:-translate-y-1 ${
      isNew ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-200'
    }`}>
      <div className="relative h-48 overflow-hidden rounded-t-xl">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWatchList(product.id);
          }}
          className="absolute top-2 right-2 z-20 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all group-hover:scale-110"
          title={isFavorite ? "Bỏ theo dõi" : "Theo dõi"}
        >
          <Heart 
            size={18} 
            className={`transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-400"}`} 
          />
        </button>
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">MỚI</span>}
          {product.isHot && <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1"><Flame size={10} /> HOT</span>}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-medium text-gray-800 text-sm line-clamp-2 h-10 mb-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Giá hiện tại</p>
            <p className="text-lg font-bold text-blue-700">{formatCurrency(product.price)}</p>
          </div>
        </div>

        {/* Req 1.4.1: Thông tin bidder & số lượt */}
        <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-2 rounded mb-3">
          <div className="flex items-center gap-1">
            <User size={12} />
            <span className="font-medium text-gray-700">{product.bidderName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Gavel size={12} />
            <span>{product.bidCount} lượt</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <CountDown seconds={product.timeLeft} className="text-xs truncate" />
          <button className="bg-blue-50 text-blue-600 p-1.5 rounded hover:bg-blue-600 hover:text-white transition-colors">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
    </Link>
  );
};

export default ProductCard