import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronRight,
  Clock,
  ShieldCheck,
  Phone,
  ImageIcon,
  Calendar,
  UserCheck,
  Star,
  TrendingUp,
  MessageCircle,
  Heart,
  AlertCircle,
  Home,
} from "lucide-react";
// 1. Import thêm maskName
import {
  formatCurrency,
  formatPostDate,
  formatTimeRelative,
  maskName,
} from "../../utils/formatters";
import { useWatchList } from "../../context/WatchListContext";
import SectionTitle from "./SectionTitle";
import ProductCard from "./ProductCard";
import ProductDescriptionSection from "./ProductDescriptionSection";
// 2. Import thêm BidService, UserService
import {
  ProductService,
  QuestionService,
  BidService,
  UserService,
} from "../../services/backendService";
import BidBox from "./BidBox";

const ProductDetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [additionalImages, setAdditionalImages] = useState([]);
  // 3. Thêm state lưu tên người thắng
  const [topBidderName, setTopBidderName] = useState("Chưa có");
  const [topBidderRating, setTopBidderRating] = useState(null); // Rating info của bidder cao nhất

  // States for appended description
  const [appendedDescriptions, setAppendedDescriptions] = useState([]);

  const { watchList, toggleWatchList } = useWatchList();
  const isFavorite = product ? watchList.includes(product.id) : false;

  // --- FETCH PRODUCT & QUESTIONS ---
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await ProductService.getById(id);
        if (!data) throw new Error("Không tìm thấy sản phẩm");
        setProduct(data);

        try {
          const questionsData = await QuestionService.findByProduct(id);
          setQuestions(
            Array.isArray(questionsData)
              ? questionsData
              : questionsData.data || []
          );
        } catch (qError) {
          console.error("Lỗi tải câu hỏi:", qError);
          setQuestions([]);
        }

        ProductService.incrementView(id).catch(console.error);

        // Load additional images from product_images table
        try {
          const imagesData = await ProductService.getImages(id);
          if (imagesData && Array.isArray(imagesData)) {
            setAdditionalImages(imagesData);
          }
        } catch (imgError) {
          console.error("Lỗi tải ảnh phụ:", imgError);
          setAdditionalImages([]);
        }

        // Load appended descriptions from product_descriptions table
        if (
          data.product_descriptions &&
          Array.isArray(data.product_descriptions)
        ) {
          const appended = data.product_descriptions
            .sort((a, b) => a.description_order - b.description_order)
            .map((desc) => ({
              id: desc.id,
              text: desc.description_text,
              timestamp: desc.created_at || new Date().toISOString(),
            }));
          setAppendedDescriptions(appended);
        }
      } catch (err) {
        console.error("Lỗi:", err);
        setError("Sản phẩm không tồn tại hoặc đã bị xóa.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
      window.scrollTo(0, 0);
    }
  }, [id]);

  // --- 4. FETCH HIGHEST BIDDER (Sửa lại logic này) ---
  useEffect(() => {
    const fetchTopBidder = async () => {
      // Chỉ chạy khi đã có product
      if (!product) return;

      if (!product.bid_count || product.bid_count === 0) {
        setTopBidderName("Chưa có");
        setTopBidderRating(null);
        return;
      }

      try {
        const hb = await BidService.getHighestBid(product.id);
        // Kiểm tra kỹ cấu trúc trả về
        if (hb && hb.bidder_id) {
          const user = await UserService.getById(hb.bidder_id);
          const name = user.full_name || "Người dùng";
          // Mask tên để bảo mật
          setTopBidderName(maskName(name));
          // Lưu rating info
          setTopBidderRating({
            rating_score: user.rating_score || 0,
            positive_ratings: user.positive_ratings || 0,
            total_ratings: user.total_ratings || 0
          });
        }
      } catch (error) {
        console.error("Lỗi lấy bidder:", error);
        setTopBidderName("Ẩn danh");
        setTopBidderRating(null);
      }
    };

    fetchTopBidder();
  }, [product]); // Chạy lại khi product thay đổi

  // --- FETCH RELATED PRODUCTS ---
  useEffect(() => {
    const fetchRelated = async () => {
      if (product && product.category_id) {
        try {
          const res = await ProductService.search(
            "",
            product.category_id,
            "ends_soon",
            1,
            5
          );
          const related = (res.data || [])
            .filter((p) => p.id !== product.id)
            .slice(0, 5);
          setRelatedProducts(related);
        } catch (error) {
          console.error(error);
        }
      }
    };
    if (product) fetchRelated();
  }, [product]);

  // --- IMAGE HANDLING ---
  const allImages = useMemo(() => {
    if (!product) return [];
    const mainImg = product.main_image_url || "https://placehold.co/800?text=No%20Image&font=roboto";
    const images = [mainImg];

    // Add additional images from product_images table
    if (additionalImages && Array.isArray(additionalImages)) {
      additionalImages.forEach((img) => {
        if (img.image_url) images.push(img.image_url);
      });
    }

    // Fallback: also check product.images if it exists (legacy support)
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img.image_url && !images.includes(img.image_url)) {
          images.push(img.image_url);
        }
      });
    }
    return images;
  }, [product, additionalImages]);

  useEffect(() => {
    if (allImages.length > 0) setActiveImage(allImages[0]);
  }, [allImages]);

  // --- RENDER ---
  if (loading)
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-pulse">
        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 w-1/3 mx-auto rounded"></div>
        <p className="text-gray-500 mt-4">Đang tải thông tin sản phẩm...</p>
      </div>
    );

  if (error || !product)
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Không tìm thấy sản phẩm
        </h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link
          to="/"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Về trang chủ
        </Link>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="flex items-center hover:text-blue-600">
          <Home size={16} className="mr-1" />
          Trang chủ
        </Link>
        <ChevronRight size={14} />
        {product.category_id && (
          <>
            <Link
              to={`/categories/${product.category_id}`}
              className="hover:text-blue-600"
            >
              {product.category?.name || "Danh mục"}
            </Link>
            <ChevronRight size={14} />
          </>
        )}
        <span className="text-gray-900 font-medium truncate max-w-[200px]">
          {product.name}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: IMAGES */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl overflow-hidden bg-gray-100 border border-gray-200 aspect-square group relative">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWatchList(id);
              }}
              className="absolute top-2 right-2 z-20 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all group-hover:scale-110"
            >
              <Heart
                size={25}
                className={`transition-colors ${
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-gray-400 hover:text-red-400"
                }`}
              />
            </button>
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
              <ImageIcon size={12} /> {allImages.length} ảnh
            </div>
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 ${
                    activeImage === img
                      ? "border-blue-600"
                      : "border-transparent hover:border-blue-300"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumb ${idx}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INFO */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={14} /> Đăng lúc:{" "}
                {formatPostDate(product.created_at)}
              </span>
              <span>|</span>
              <span className="flex items-center gap-1 text-orange-600 font-medium">
                <Clock size={14} /> Kết thúc:{" "}
                {formatTimeRelative(product.ends_at)}
              </span>
            </div>
          </div>

          <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">
                  Giá hiện tại
                </p>
                <p className="text-4xl font-bold text-red-600">
                  {formatCurrency(product.current_price)}
                </p>
              </div>
              {product.buy_now_price && (
                <div className="md:text-right">
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    Giá mua ngay
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(product.buy_now_price)}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-blue-200">
              <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <UserCheck size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Người bán</p>
                  <p className="font-bold text-sm text-gray-800">
                    {product.seller?.full_name || "Ẩn danh"}
                  </p>
                  <div className="flex items-center gap-1 text-xs">
                    <span className={`font-medium ${(product.seller?.rating_score || 0) >= 0.80 ? 'text-green-600' : (product.seller?.rating_score || 0) >= 0.50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {product.seller?.positive_ratings || 0}+/{(product.seller?.total_ratings || 0) - (product.seller?.positive_ratings || 0)}-
                    </span>
                    <span className="text-gray-400">
                      ({((product.seller?.rating_score || 0) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Người đặt cao nhất</p>

                  {/* 5. Cập nhật hiển thị dùng state topBidderName */}
                  <p className="font-bold text-sm text-gray-800">
                    {topBidderName}
                  </p>

                  <div className="flex items-center gap-1 text-xs">
                    {topBidderRating ? (
                      <>
                        <span className={`font-medium ${topBidderRating.rating_score >= 0.80 ? 'text-green-600' : topBidderRating.rating_score >= 0.50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {topBidderRating.positive_ratings}+/{topBidderRating.total_ratings - topBidderRating.positive_ratings}-
                        </span>
                        <span className="text-gray-400">
                          ({(topBidderRating.rating_score * 100).toFixed(0)}%) • {product.bid_count || 0} lượt
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400">0+/0- (0%) • {product.bid_count || 0} lượt</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <BidBox
              product={product}
              onTopBidderChange={(masked) => setTopBidderName(masked)}
            />
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600 pt-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-green-600" size={18} />{" "}
              <span>Đảm bảo chính hãng</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="text-blue-600" size={18} />{" "}
              <span>Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ProductDescriptionSection
            productId={id}
            description={product.description}
            initialAppendedDescriptions={appendedDescriptions}
            sellerId={product.seller_id}
          />

          {/* Bid history moved into BidBox component */}

          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2 flex items-center justify-between">
              <span>Lịch sử Hỏi đáp</span>
              <span className="text-sm font-normal text-gray-500">
                {questions.length} câu hỏi
              </span>
            </h3>

            <div className="space-y-6">
              {questions.length > 0 ? (
                questions.map((q) => (
                  <div key={q.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {(q.user?.full_name || "U").charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {q.user?.full_name || "Người dùng"}
                          <span className="text-xs font-normal text-gray-400">
                            {" "}
                            • {formatPostDate(q.created_at)}
                          </span>
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {q.question_text}
                        </p>
                      </div>
                    </div>
                    {q.answer && (
                      <div className="ml-11 mt-2 pl-3 border-l-2 border-green-300">
                        <p className="text-xs font-bold text-green-700 mb-1">
                          Người bán trả lời:
                        </p>
                        <p className="text-sm text-gray-600">{q.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <MessageCircle
                    size={32}
                    className="mx-auto mb-2 opacity-30"
                  />
                  <p>Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi!</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200 text-sm text-yellow-800 sticky top-24">
            <h4 className="font-bold flex items-center gap-2 mb-2">
              <ShieldCheck size={18} /> Lưu ý an toàn
            </h4>
            <ul className="list-disc pl-4 space-y-2">
              <li>Không chuyển tiền trực tiếp cho người bán ngoài hệ thống.</li>
              <li>Kiểm tra kỹ thông tin mô tả và đánh giá người bán.</li>
              <li>
                Quay video khi mở hàng để làm bằng chứng nếu có tranh chấp.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <SectionTitle
          icon={TrendingUp}
          title="Sản phẩm cùng chuyên mục"
          subtitle="Có thể bạn cũng thích"
        />
        {relatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-10">
            Không có sản phẩm liên quan.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
