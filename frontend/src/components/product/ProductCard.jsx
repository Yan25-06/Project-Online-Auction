import { User, Clock, Gavel, Heart, Calendar, CircleDollarSign, Sparkles, Flame } from 'lucide-react'; // Thêm Sparkles, Flame
import { formatCurrency, isProductNew, formatTimeRelative, formatPostDate, maskName } from '../../utils/formatters';
import { useWatchList } from '../../context/WatchListContext';
import { Link } from 'react-router-dom';
import { CategoryService, BidService, UserService } from '../../services/backendService';
import { useState, useEffect } from 'react';

const ProductCard = ({ product }) => {
  // Database trả về created_at, không phải createdAt
  const isNew = isProductNew(product.created_at); 
  const { watchList, toggleWatchList } = useWatchList();
  const isFavorite = watchList.includes(product.id);
  
  const [categoryName, setCategoryName] = useState('Đang tải...');
  const [topBidderName, setTopBidderName] = useState('Chưa có');

  // 1. Lấy tên Danh mục (Giữ nguyên logic cũ)
  useEffect(() => {
    const fetchCategoryName = async () => {
      if (!product.category_id) {
          setCategoryName('Khác');
          return;
      }
      try {
        const data = await CategoryService.getById(product.category_id);
        setCategoryName(data.name || data.category?.name || 'Khác');
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
        setCategoryName('Khác');
      }
    };
    fetchCategoryName();
  }, [product.category_id]);

  // 2. Lấy tên người Bid cao nhất (Giữ nguyên logic cũ)
  useEffect(() => {
    const fetchTopBidder = async () => {
      if (!product.bid_count || product.bid_count === 0) {
        setTopBidderName('Chưa có');
        return;
      }

      try {
        const highestBid = await BidService.getHighestBid(product.id);
        if (highestBid && highestBid.bidder_id) {
          const user = await UserService.getById(highestBid.bidder_id);
          const name = user.full_name || 'Người dùng';
          setTopBidderName(maskName(name));
        }
      } catch (error) {
        console.error("Lỗi lấy bidder:", error);
        setTopBidderName('Ẩn danh');
      }
    };

    fetchTopBidder();
  }, [product.id, product.bid_count]);

  // --- CẤU HÌNH GIAO DIỆN CHO SẢN PHẨM MỚI ---
  // Nếu là Mới: Viền vàng cam, đổ bóng vàng, nền hơi vàng nhẹ
  // Nếu thường: Viền xám, hover lên mới xanh
  const containerClasses = isNew 
    ? 'border-yellow-400 ring-2 ring-yellow-100 shadow-lg shadow-yellow-100/50 bg-yellow-50/30' 
    : 'border-gray-200 hover:border-blue-300 hover:shadow-lg bg-white';

  return (
    <div className={`rounded-xl border transition-all duration-300 group relative overflow-hidden flex flex-col h-full ${containerClasses}`}>
      
      {/* Nút yêu thích */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWatchList(product);
        }}
        className="absolute top-2 right-2 z-20 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all group-hover:scale-110"
        title={isFavorite ? "Bỏ theo dõi" : "Theo dõi"}
      >
        <Heart size={18} className={`transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-400"}`} />
      </button>

      {/* --- BADGE MỚI ĐĂNG (Nổi bật hơn) --- */}
      {isNew && (
        <div className="absolute top-0 left-0 z-10">
            {/* Tạo hình ruy băng hoặc tag góc */}
            <div className="bg-linear-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-br-lg shadow-md flex items-center gap-1 animate-pulse">
                <Sparkles size={12} fill="yellow" className="text-yellow-200" /> 
                MỚI LÊN SÀN
            </div>
        </div>
      )}
      
      {/* Ảnh đại diện */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <Link to={`/products/${product.id}`}>
          <img src={product.main_image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </Link>
        {/* Thời gian còn lại */}
        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
          <Clock size={12} /> {formatTimeRelative(product.ends_at)}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        <Link to={`/categories/${product.category_id}`} className="text-xs text-blue-600 font-medium mb-1 uppercase tracking-wider hover:underline w-fit">
          {categoryName}
        </Link>

        {/* Tên sản phẩm */}
        <Link to={`/products/${product.id}`}>
          <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 min-h-12 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Ngày đăng: Nếu là mới thì highlight màu cam */}
        <div className={`flex items-center gap-1 text-xs mb-2 ${isNew ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
          <Calendar size={12}/> {isNew ? 'Vừa đăng: ' : 'Đăng: '} {formatPostDate(product.created_at)}
        </div>

        {/* Bidder cao nhất */}
        <div className="flex items-center gap-1 text-xs text-gray-600 mb-2 bg-gray-50 p-1.5 rounded border border-gray-100">
          <User size={12} className="text-blue-500"/> Bid cao nhất: 
          <span className="font-bold text-blue-700 truncate max-w-[120px]">
            {topBidderName}
          </span>
        </div>

        <div className="mt-auto space-y-2">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-end">
               {/* Giá hiện tại */}
               <div>
                  <p className="text-xs text-gray-500">Giá hiện tại</p>
                  <p className="text-lg font-bold text-red-600 leading-tight">{formatCurrency(product.current_price)}</p>
               </div>
               
               {/* Số lượt bid */}
               <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                 <Gavel size={12} /> {product.bid_count || 0}
               </div>
            </div>

            {/* Giá mua ngay */}
            {product.buy_now_price && (
              <div className="flex items-center gap-1 text-xs text-blue-600 font-medium border-t border-dashed pt-1 mt-1">
                <CircleDollarSign size={12}/> Mua ngay: {formatCurrency(product.buy_now_price)}
              </div>
            )}
          </div>
          
          {/* Nút đấu giá: Nếu mới thì màu nổi hơn chút hoặc giữ nguyên */}
          <Link to={`/products/${product.id}`} className={`w-full font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${isNew ? 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'}`}>
            {isNew ? <><Flame size={16}/> Đấu giá ngay</> : 'Đấu giá ngay'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;