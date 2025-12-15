import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import Header from '../components/common/Header';

import { ProductService } from '../services/backendService'; 
import { CategoryService } from '../services/categoryService';

const SearchResultPage = () => {
  const [searchParams] = useSearchParams();
  const { categoryId } = useParams(); 
  
  const keyword = searchParams.get('q'); 

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [sort, setSort] = useState('ends_soon'); // Mặc định sắp hết hạn
  const [categoryName, setCategoryName] = useState(''); // State lưu tên danh mục

  // 1. Effect để lấy tên danh mục (nếu có categoryId)
  useEffect(() => {
    const fetchCategoryName = async () => {
      if (categoryId) {
        try {
          const cat = await CategoryService.getById(categoryId);
          setCategoryName(cat ? cat.name : "Danh mục không tồn tại");
        } catch (error) {
          setCategoryName("Danh mục");
        }
      } else if (keyword) {
        setCategoryName(`Tìm kiếm: "${keyword}"`);
      } else {
        setCategoryName("Tất cả sản phẩm");
      }
    };
    fetchCategoryName();
  }, [categoryId, keyword]);

  // 2. Effect để tìm kiếm sản phẩm
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await ProductService.search({
          keyword: keyword,
          categoryId: categoryId,
          sort: sort,
          page: pagination.page,
          limit: 8 // 8 sản phẩm 1 trang
        });
        
        setProducts(result.data);
        setPagination(prev => ({ ...prev, ...result.pagination }));
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [keyword, categoryId, sort, pagination.page]);

  // Hàm đổi trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen pb-12 animate-fadeIn">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 mb-8 shadow-sm">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                {keyword && <Search className="text-blue-600" size={28}/>}
                {categoryName}
            </h1>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
              <p className="text-gray-500">
                  {loading ? 'Đang tải...' : `Tìm thấy ${pagination.totalItems} sản phẩm`}
              </p>
              
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-600 pl-2 font-medium flex gap-1">
                    <Filter size={16}/> Sắp xếp:
                  </span>
                  <select 
                    value={sort}
                    onChange={(e) => {
                        setSort(e.target.value);
                        setPagination(prev => ({ ...prev, page: 1 })); // Reset về trang 1 khi sort
                    }}
                    className="bg-transparent text-sm focus:outline-none focus:ring-0 text-gray-800 font-medium py-1 pr-2 cursor-pointer"
                  >
                     <option value="ends_soon">⏳ Sắp kết thúc</option>
                     <option value="price_asc">💲 Giá tăng dần</option>
                     <option value="price_desc">💰 Giá giảm dần</option>
                  </select>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="container mx-auto px-4">
          {loading ? (
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-200 h-80 rounded-xl"></div>
                ))}
             </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-4">
                  <button 
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-white hover:text-blue-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
                  >
                    <ChevronLeft size={20}/>
                  </button>
                  <span className="font-medium text-gray-700">
                    Trang <span className="text-blue-600 font-bold">{pagination.page}</span> / {pagination.totalPages}
                  </span>
                  <button 
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-white hover:text-blue-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
                  >
                    <ChevronRight size={20}/>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Search size={32} />
               </div>
               <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy kết quả</h3>
               <p className="text-gray-500 mb-6">Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm của bạn.</p>
               <Link to="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block font-medium">
                    Về trang chủ
               </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchResultPage;