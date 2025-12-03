import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock, ShieldCheck, Phone } from 'lucide-react';
import { ImageIcon, Calendar, UserCheck, Star, TrendingUp, MessageCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { MOCK_PRODUCTS, CATEGORIES } from '../../data/mockData';
import { formatCurrency, formatPostDate, formatEndTime } from '../../utils/formatters';
import SectionTitle from './SectionTitle';
import ProductCard from './ProductCard';
const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    setLoading(true);
    setProduct(null);
    window.scrollTo(0, 0);

    const timer = setTimeout(() => {
      const foundProduct = MOCK_PRODUCTS.find(p => p.id === parseInt(id));
      if (foundProduct) {
        setProduct(foundProduct);
        setActiveImage(foundProduct.images ? foundProduct.images[0] : foundProduct.image);
        // Lấy 5 sản phẩm liên quan (cùng category, khác ID)
        const related = MOCK_PRODUCTS
          .filter(p => p.categoryId === foundProduct.categoryId && p.id !== foundProduct.id)
          .slice(0, 5);
        setRelatedProducts(related);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  if (loading) return <div className="container mx-auto px-4 py-20 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-gray-500">Đang tải thông tin sản phẩm...</p></div>;
  if (!product) return <div className="container mx-auto px-4 py-20 text-center"><h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm</h2><p className="text-gray-500 mb-6">Sản phẩm không tồn tại.</p><Link to="/" className="text-blue-600 hover:underline">Về trang chủ</Link></div>;

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <ChevronRight size={14} />
        <Link to={`/categories/${product.categoryId}`} className="hover:text-blue-600">
          {CATEGORIES.find(c => c.id === product.categoryId)?.name}
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: IMAGES */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl overflow-hidden bg-gray-100 border border-gray-200 aspect-square group relative">
             <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
             <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
               <ImageIcon size={12} /> {product.images?.length || 1} ảnh
             </div>
          </div>
          {/* Thumbnail List */}
          {product.images && product.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 ${activeImage === img ? 'border-blue-600' : 'border-transparent hover:border-blue-300'}`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INFO */}
        <div className="lg:col-span-7 space-y-6">
           <div>
             <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">{product.name}</h1>
             <div className="flex items-center gap-4 text-sm text-gray-500">
               <span className="flex items-center gap-1"><Calendar size={14}/> Đăng lúc: {formatPostDate(product.createdAt)}</span>
               <span>|</span>
               <span className="flex items-center gap-1 text-orange-600 font-medium"><Clock size={14}/> Kết thúc: {formatEndTime(product.timeLeft)}</span>
             </div>
           </div>

           {/* Price Box */}
           <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
             <div className="flex flex-col md:flex-row justify-between gap-4">
               <div>
                 <p className="text-sm text-gray-500 font-medium mb-1">Giá hiện tại</p>
                 <p className="text-4xl font-bold text-red-600">{formatCurrency(product.price)}</p>
               </div>
               {product.buyNowPrice && (
                 <div className="md:text-right">
                   <p className="text-sm text-gray-500 font-medium mb-1">Giá mua ngay</p>
                   <p className="text-2xl font-bold text-blue-600">{formatCurrency(product.buyNowPrice)}</p>
                 </div>
               )}
             </div>
             
             {/* User Cards: Seller & Bidder */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-blue-200">
               {/* Seller Info */}
               <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><UserCheck size={20}/></div>
                 <div>
                   <p className="text-xs text-gray-500">Người bán</p>
                   <p className="font-bold text-sm text-gray-800">{product.seller?.name || 'Ẩn danh'}</p>
                   <div className="flex items-center gap-1 text-xs text-yellow-500">
                     <Star size={10} fill="currentColor" /> {product.seller?.rating || 0} <span className="text-gray-400">({product.seller?.totalRatings || 0} đánh giá)</span>
                   </div>
                 </div>
               </div>
               {/* Highest Bidder Info */}
               <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><TrendingUp size={20}/></div>
                 <div>
                   <p className="text-xs text-gray-500">Người đặt cao nhất</p>
                   <p className="font-bold text-sm text-gray-800">{product.highestBidder?.name || 'Chưa có'}</p>
                   <div className="flex items-center gap-1 text-xs text-yellow-500">
                     <Star size={10} fill="currentColor" /> {product.highestBidder?.rating || 0} <span className="text-gray-400">({product.highestBidder?.totalRatings || 0} đánh giá)</span>
                   </div>
                 </div>
               </div>
             </div>
           </div>

           {/* Actions */}
           <div className="grid grid-cols-2 gap-4">
             <button className="col-span-1 bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 hover:shadow-xl hover:-translate-y-0.5">
               Đấu giá ngay
             </button>
             {product.buyNowPrice && (
               <button className="col-span-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5">
                 Mua ngay
               </button>
             )}
           </div>

           {/* Policies */}
           <div className="flex items-center gap-6 text-sm text-gray-600 pt-2">
              <div className="flex items-center gap-2"><ShieldCheck className="text-green-600" size={18} /> <span>Đảm bảo chính hãng</span></div>
              <div className="flex items-center gap-2"><Phone className="text-blue-600" size={18} /> <span>Hỗ trợ 24/7</span></div>
           </div>
        </div>
      </div>

      {/* TABS SECTION: DESCRIPTION & Q&A */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Mô tả chi tiết sản phẩm</h3>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {product.description || 'Người bán chưa cung cấp mô tả chi tiết cho sản phẩm này.'}
            </div>
          </section>

          {/* Q&A History */}
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2 flex items-center justify-between">
              <span>Lịch sử Hỏi đáp</span>
              <span className="text-sm font-normal text-gray-500">{product.questions?.length || 0} câu hỏi</span>
            </h3>
            
            <div className="space-y-6">
              {product.questions && product.questions.length > 0 ? (
                product.questions.map(q => (
                  <div key={q.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {q.asker.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{q.asker} <span className="text-xs font-normal text-gray-400">• {new Date(q.date).toLocaleDateString()}</span></p>
                        <p className="text-sm text-gray-700 mt-1">{q.content}</p>
                      </div>
                    </div>
                    {q.answer && (
                      <div className="ml-11 mt-2 pl-3 border-l-2 border-green-300">
                        <p className="text-xs font-bold text-green-700 mb-1">Người bán trả lời:</p>
                        <p className="text-sm text-gray-600">{q.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <MessageCircle size={32} className="mx-auto mb-2 opacity-30"/>
                  <p>Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi!</p>
                </div>
              )}
            </div>
          </section>
        </div>
        
        {/* Right Sidebar? Optional, maybe safety tips */}
        <div className="lg:col-span-1">
          <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200 text-sm text-yellow-800 sticky top-24">
             <h4 className="font-bold flex items-center gap-2 mb-2"><ShieldCheck size={18}/> Lưu ý an toàn</h4>
             <ul className="list-disc pl-4 space-y-2">
               <li>Không chuyển tiền trực tiếp cho người bán ngoài hệ thống.</li>
               <li>Kiểm tra kỹ thông tin mô tả và đánh giá người bán.</li>
               <li>Quay video khi mở hàng để làm bằng chứng nếu có tranh chấp.</li>
             </ul>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      <div className="mt-16">
        <SectionTitle icon={TrendingUp} title="Sản phẩm cùng chuyên mục" subtitle="Có thể bạn cũng thích" />
        {relatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-10">Không có sản phẩm liên quan.</p>
        )}
      </div>
    </div>
  );
};

export default ProductDetails