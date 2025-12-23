import React, { useState, useEffect } from "react";
import { useSearchParams, useParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, Filter, Home } from "lucide-react";
import ProductCard from "../components/product/ProductCard";
import Header from "../components/common/Header";

import { ProductService, CategoryService } from "../services/backendService";

const ProductListingPage = () => {
  // 1. Lấy params từ URL
  const [searchParams] = useSearchParams();
  const { categoryId } = useParams(); // Lấy ID danh mục nếu có (/categories/:id)

  const keyword = searchParams.get("q") || ""; // Lấy từ khóa tìm kiếm (?q=...)

  // 2. State quản lý dữ liệu
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Tất cả sản phẩm"); // Tiêu đề trang linh hoạt
  const [parentCategory, setParentCategory] = useState(null);

  // State quản lý bộ lọc & phân trang
  const [sort, setSort] = useState("ends_soon"); // ends_soon, price_asc, price_desc, new
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 8, // Số lượng item mỗi trang
  });

  // 3. Effect: Xác định tiêu đề trang (Tên danh mục hoặc Từ khóa)
  useEffect(() => {
    const fetchTitle = async () => {
      if (categoryId) {
        try {
          // Nếu đang xem danh mục -> Lấy tên danh mục
          const cat = await CategoryService.getById(categoryId);
          // API trả về object category hoặc null
          setTitle(cat?.name || cat?.category?.name || "Danh mục");
          // Try to fetch parent category if available
          const parentId = cat?.parent_id || cat?.parent?.id;
          if (parentId) {
            try {
              const parent = await CategoryService.getById(parentId);
              setParentCategory(parent || null);
            } catch (err) {
              setParentCategory(null);
            }
          } else {
            setParentCategory(null);
          }
        } catch (error) {
          setTitle("Danh mục");
        }
      } else if (keyword) {	
        setTitle(`Kết quả tìm kiếm: "${keyword}"`);
      } else {
        setTitle("Tất cả sản phẩm");
      }
    };
    fetchTitle();
  }, [categoryId, keyword]);

  // 4. Effect: Gọi API lấy dữ liệu sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Gọi API
        const result = await ProductService.search(
          keyword, // q
          categoryId, // categoryId (null nếu không có)
          sort, // sortBy
          pagination.page, // page
          pagination.limit // limit
        );
        
        console.log("API Result:", result);

        // 1. Cập nhật danh sách sản phẩm
        setProducts(result.data || []);

        // 2. Cập nhật Pagination dựa trên 'total' từ API
        const totalItems = result.total || 0;
        const limit = pagination.limit;

        const calculatedTotalPages = Math.ceil(totalItems / limit);

        setPagination((prev) => ({
          ...prev,
          totalItems: totalItems,
          totalPages: calculatedTotalPages > 0 ? calculatedTotalPages : 1,
        }));

      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
        setProducts([]);
        // Reset pagination khi lỗi
        setPagination((prev) => ({
            ...prev,
            totalItems: 0,
            totalPages: 1
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    window.scrollTo(0, 0); // Cuộn lên đầu trang khi đổi dữ liệu
  }, [keyword, categoryId, sort, pagination.page]);

  // Hàm chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen pb-12 animate-fadeIn">
        {/* --- PHẦN HEADER CỦA TRANG --- */}
        <div className="bg-white border-b border-gray-200 mb-8 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            {/* Breadcrumb nhỏ */}
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Link to="/" className="flex items-center hover:text-blue-600">
                <Home size={16} className="mr-1" /> Trang chủ
              </Link>
              {parentCategory && (
                <>
                  <ChevronRight size={16} className="mx-2" />
                  <Link to={`/categories/${parentCategory.id}`} className="text-gray-700 hover:text-blue-600 mr-2">
                    {parentCategory.name}
                  </Link>
                </>
              )}
              <ChevronRight size={16} className="mx-2" />
              <span className="text-gray-900 font-medium truncate max-w-[200px]">
                {title}
              </span>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  {keyword && <Search className="text-blue-600" size={28} />}
                  {title}
                </h1>
                <p className="text-gray-500 mt-2">
                  {loading
                    ? "Đang tải dữ liệu..."
                    : `Hiển thị ${products.length} trên tổng số ${pagination.totalItems} kết quả`}
                </p>
              </div>

              {/* Bộ lọc Sắp xếp */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300 shadow-sm hover:border-blue-400 transition-colors">
                  <Filter size={18} className="text-gray-500" />
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 })); // Reset về trang 1
                    }}
                    className="bg-transparent text-sm focus:outline-none text-gray-700 font-medium cursor-pointer min-w-[140px]"
                  >
                    <option value="ends_soon">⏳ Sắp kết thúc</option>
                    <option value="newest">🆕 Mới đăng</option>
                    <option value="price_asc">💲 Giá thấp đến cao</option>
                    <option value="price_desc">💰 Giá cao đến thấp</option>
                    <option value="most_bids">🔥 Nhiều lượt đấu giá</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- PHẦN GRID SẢN PHẨM --- */}
        <div className="container mx-auto px-4">
          {loading ? (
            // SKELETON LOADING
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-80 rounded-xl"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* PAGINATION */}
              {pagination.totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-3">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {/* Hiển thị số trang */}
                  <div className="flex gap-1">
                    {[...Array(pagination.totalPages)].map((_, idx) => {
                      const pageNum = idx + 1;
                      // Chỉ hiển thị 1 vài trang nếu quá nhiều trang (logic đơn giản)
                      if (
                        pagination.totalPages > 7 &&
                        Math.abs(pageNum - pagination.page) > 2 &&
                        pageNum !== 1 &&
                        pageNum !== pagination.totalPages
                      ) {
                        if (Math.abs(pageNum - pagination.page) === 3)
                          return (
                            <span key={idx} className="px-1 text-gray-400">
                              ...
                            </span>
                          );
                        return null;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                            pagination.page === pageNum
                              ? "bg-blue-600 text-white shadow-md transform scale-105"
                              : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          ) : (
            // EMPTY STATE (Không có dữ liệu)
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <Search size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Không tìm thấy sản phẩm nào
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Rất tiếc, chúng tôi không tìm thấy kết quả phù hợp với tiêu chí
                của bạn. Hãy thử thay đổi từ khóa hoặc bộ lọc.
              </p>
              <Link
                to="/"
                className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                Về trang chủ
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductListingPage;
