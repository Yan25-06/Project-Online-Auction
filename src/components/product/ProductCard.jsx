import { User, Clock, Gavel,Heart, Calendar, CircleDollarSign } from 'lucide-react';
import { formatCurrency, isProductNew, formatTimeRelative, formatPostDate } from '../../utils/formatters';
import { useWatchList } from '../../context/WatchListContext';
import CountDown from './CountDown';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../data/mockData';

const ProductCard = ({ product }) => {
  const isNew = isProductNew(product.createdAt);
  const { watchList, toggleWatchList } = useWatchList();
  const isFavorite = watchList.includes(product.id);

  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-all duration-300 hover:shadow-lg group relative overflow-hidden flex flex-col h-full ${isNew ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'}`}>
      
      {/* Nút yêu thích */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWatchList(product.id);
        }}
        className="absolute top-2 right-2 z-20 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all group-hover:scale-110"
        title={isFavorite ? "Bỏ theo dõi" : "Theo dõi"}
      >
        <Heart size={18} className={`transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-400"}`} />
      </button>

      {isNew && <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">MỚI ĐĂNG</div>}
      
      {/* 1. Ảnh đại diện sản phẩm */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <Link to={`/products/${product.id}`}>
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </Link>
        {/* 7. Thời gian còn lại */}
        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
          <Clock size={12} /> {formatTimeRelative(product.timeLeft)}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        {/* Category Clickable */}
        <Link to={`/categories/${product.categoryId}`} className="text-xs text-blue-600 font-medium mb-1 uppercase tracking-wider hover:underline w-fit">
          {CATEGORIES.find(c => c.id === product.categoryId)?.name || 'Khác'}
        </Link>

        {/* 2. Tên sản phẩm */}
        <Link to={`/products/${product.id}`}>
          <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3rem] group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* 6. Ngày đăng sản phẩm (Thêm mới) */}
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
          <Calendar size={12}/> Đăng: {formatPostDate(product.createdAt)}
        </div>

        {/* 4. Thông tin bidder cao nhất (Thêm mới) */}
        <div className="flex items-center gap-1 text-xs text-gray-600 mb-2 bg-gray-50 p-1.5 rounded">
          <User size={12} className="text-blue-500"/> Bid cao nhất: 
          <span className="font-bold text-blue-700">
            {product.highestBidder ? maskName(product.highestBidder.name) : 'Chưa có'}
          </span>
        </div>

        <div className="mt-auto space-y-2">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-end">
               {/* 3. Giá hiện tại */}
               <div>
                  <p className="text-xs text-gray-500">Giá hiện tại</p>
                  <p className="text-lg font-bold text-red-600 leading-tight">{formatCurrency(product.price)}</p>
               </div>
               
               {/* 8. Số lượt ra giá */}
               <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                 <Gavel size={12} /> {product.bidCount}
               </div>
            </div>

            {/* 5. Giá mua ngay (Thêm mới) */}
            {product.buyNowPrice && (
              <div className="flex items-center gap-1 text-xs text-blue-600 font-medium border-t border-dashed pt-1 mt-1">
                <CircleDollarSign size={12}/> Mua ngay: {formatCurrency(product.buyNowPrice)}
              </div>
            )}
          </div>
          
          <Link to={`/products/${product.id}`} className="w-full bg-blue-50 text-blue-600 font-semibold py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2">
            Đấu giá ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
export default ProductCard