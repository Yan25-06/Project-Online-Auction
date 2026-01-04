import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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
  ArrowRight,
  Send,
} from "lucide-react";
// 1. Import thêm maskName
import {
  formatCurrency,
  formatPostDate,
  formatTimeRelative,
  maskName,
} from "../../utils/formatters";
import { useWatchList } from "../../context/WatchListContext";
import { useAuth } from "../../context/AuthContext";
import SectionTitle from "./SectionTitle";
import ProductCard from "./ProductCard";
import ProductDescriptionSection from "./ProductDescriptionSection";
// 2. Import thêm BidService, UserService, OrderService
import {
  ProductService,
  QuestionService,
  BidService,
  UserService,
  OrderService,
} from "../../services/backendService";
import BidBox from "./BidBox";
import { supabase } from "../../config/supabase";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [additionalImages, setAdditionalImages] = useState([]);
  // 3. Thêm state lưu tên người thắng
  const [topBidderName, setTopBidderName] = useState("Chưa có");
  const [currentUser, setCurrentUser] = useState(null);
  const [order, setOrder] = useState(null);
  const [topBidderRating, setTopBidderRating] = useState(null); // Rating info của bidder cao nhất
  
  // States cho phần hỏi đáp
  const [newQuestion, setNewQuestion] = useState("");
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [answeringId, setAnsweringId] = useState(null);
  const [answerText, setAnswerText] = useState("");

  // States for appended description
  const [appendedDescriptions, setAppendedDescriptions] = useState([]);

  const { watchList, toggleWatchList } = useWatchList();
  const isFavorite = product ? watchList.includes(product.id) : false;

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

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

        // Check if product has ended and load order if exists
        if (data.status === "ended" || data.status === "sold") {
          try {
            const orderData = await OrderService.getByProduct(id);
            setOrder(orderData);
          } catch (err) {
            console.log("No order found for this product");
          }
        }

        // Check if auction time has expired but status is still active
        const now = new Date();
        const endsAt = new Date(data.ends_at);
        if (data.status === "active" && endsAt <= now) {
          try {
            // Auction has expired, end it and create order
            console.log("Auction has expired, ending it...");
            const endResult = await ProductService.endAuction(id);
            console.log("Auction ended:", endResult);

            // Reload product data to get updated status
            const updatedData = await ProductService.getById(id);
            setProduct(updatedData);

            // Load order if created
            if (endResult.order) {
              setOrder(endResult.order);
            }
          } catch (endErr) {
            console.error("Error ending auction:", endErr);
          }
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
          console.log("Lấy được bidder:", user);
          const name = user.full_name || "Người dùng";
          setTopBidderName(name);
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

  // --- KIỂM TRA XEM USER CÓ PHẢI SELLER KHÔNG ---
  const isSeller = useMemo(() => {
    if (!user || !product) return false;
    return user.id === product.seller_id;
  }, [user, product]);

  // --- HÀM ĐẶT CÂU HỎI ---
  const handleAskQuestion = async () => {
    if (!newQuestion.trim()) return;
    if (!user) {
      alert("Bạn cần đăng nhập để đặt câu hỏi");
      return;
    }
    
    try {
      setAskingQuestion(true);
      await QuestionService.create({
        userId: user.id,
        productId: id,
        questionText: newQuestion.trim()
      });
      
      // Reload questions
      const questionsData = await QuestionService.findByProduct(id);
      setQuestions(Array.isArray(questionsData) ? questionsData : questionsData.data || []);
      setNewQuestion("");
    } catch (err) {
      console.error("Lỗi đặt câu hỏi:", err);
      alert("Đặt câu hỏi thất bại. Vui lòng thử lại.");
    } finally {
      setAskingQuestion(false);
    }
  };

  const handleAnswerQuestion = async (questionId) => {
    if (!answerText.trim()) return;
    
    try {
      await QuestionService.answer(questionId, user.id, answerText.trim());
      
      // Reload questions
      const questionsData = await QuestionService.findByProduct(id);
      setQuestions(Array.isArray(questionsData) ? questionsData : questionsData.data || []);
      setAnsweringId(null);
      setAnswerText("");
    } catch (err) {
      console.error("Lỗi trả lời:", err);
      alert("Trả lời thất bại. Vui lòng thử lại.");
    }
  };

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

  // Check if product has ended and show notice for non-participants
  const isProductEnded =
    product.status === "ended" || product.status === "sold";
  // const isSeller = currentUser && currentUser.id === product.seller_id;
  const isWinner = order && currentUser && currentUser.id === order.winner_id;
  const showEndedNotice = isProductEnded && !isSeller && !isWinner;

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn bg-white min-h-screen">
      {/* Show order completion notice for seller/winner */}
      {isProductEnded && (isSeller || isWinner) && order && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6 rounded-lg">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-blue-600" size={24} />
              <div>
                <h3 className="text-lg font-bold text-blue-800">
                  Phiên đấu giá đã kết thúc
                </h3>
                <p className="text-blue-700 mt-1">
                  {isSeller
                    ? "Sản phẩm của bạn đã được bán. Vui lòng hoàn tất đơn hàng."
                    : "Bạn đã thắng phiên đấu giá này. Vui lòng hoàn tất đơn hàng."}
                </p>
              </div>
            </div>
            <Link
              to={`/orders/${order.id}`}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center gap-2"
            >
              Hoàn tất đơn hàng
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      )}

      {/* Show ended notice for non-participants */}
      {showEndedNotice && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-6 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-yellow-600" size={24} />
            <div>
              <h3 className="text-lg font-bold text-yellow-800">
                Sản phẩm đã kết thúc
              </h3>
              <p className="text-yellow-700 mt-1">
                Phiên đấu giá cho sản phẩm này đã kết thúc. Bạn có thể xem thông
                tin sản phẩm nhưng không thể đấu giá.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        {" "}
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
              <span>Hỏi đáp về sản phẩm</span>
              <span className="text-sm font-normal text-gray-500">
                {questions.length} câu hỏi
              </span>
            </h3>

            {/* Form đặt câu hỏi - chỉ hiện khi đã đăng nhập và không phải seller */}
            {user && !isSeller && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  💬 Đặt câu hỏi cho người bán
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Nhập câu hỏi của bạn..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                  />
                  <button
                    onClick={handleAskQuestion}
                    disabled={askingQuestion || !newQuestion.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Send size={16} />
                    {askingQuestion ? 'Đang gửi...' : 'Gửi'}
                  </button>
                </div>
              </div>
            )}

            {/* Thông báo cho seller */}
            {isSeller && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-100 text-sm text-green-700">
                🏪 Bạn là người bán. Hãy trả lời các câu hỏi từ người mua!
              </div>
            )}

            {/* Danh sách câu hỏi */}
            <div className="space-y-4">
              {questions.length > 0 ? (
                questions.map((q) => (
                  <div key={q.id} className="bg-gray-50 p-4 rounded-lg">
                    {/* Câu hỏi */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                        {(q.user?.full_name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800">
                          {q.user?.full_name || "Người dùng"}
                          <span className="text-xs font-normal text-gray-400 ml-2">
                            {formatPostDate(q.created_at)}
                          </span>
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {q.question_text}
                        </p>
                      </div>
                    </div>

                    {/* Câu trả lời - hiển thị từ bảng answers */}
                    {q.answers && q.answers.length > 0 ? (
                      q.answers.map((ans) => (
                        <div key={ans.id} className="ml-11 mt-3 pl-3 border-l-2 border-green-400">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">
                              {(ans.seller?.full_name || "S").charAt(0).toUpperCase()}
                            </div>
                            <p className="text-xs font-bold text-green-700">
                              {ans.seller?.full_name || "Người bán"}
                              <span className="font-normal text-gray-400 ml-2">
                                {formatPostDate(ans.created_at)}
                              </span>
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 ml-8">{ans.answer_text}</p>
                        </div>
                      ))
                    ) : (
                      /* Form trả lời - chỉ hiện cho seller và câu hỏi chưa được trả lời */
                      isSeller && !q.is_answered && (
                        answeringId === q.id ? (
                          <div className="ml-11 mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <textarea
                              value={answerText}
                              onChange={(e) => setAnswerText(e.target.value)}
                              placeholder="Nhập câu trả lời..."
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
                              rows={2}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => {
                                  setAnsweringId(null);
                                  setAnswerText("");
                                }}
                                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={() => handleAnswerQuestion(q.id)}
                                disabled={!answerText.trim()}
                                className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                              >
                                Gửi trả lời
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAnsweringId(q.id)}
                            className="ml-11 mt-2 text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                          >
                            <MessageCircle size={14} /> Trả lời câu hỏi này
                          </button>
                        )
                      )
                    )}

                    {/* Badge chưa trả lời */}
                    {!q.is_answered && (!q.answers || q.answers.length === 0) && !isSeller && (
                      <div className="ml-11 mt-2">
                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                          ⏳ Đang chờ trả lời
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle
                    size={40}
                    className="mx-auto mb-3 opacity-30"
                  />
                  <p className="font-medium">Chưa có câu hỏi nào</p>
                  <p className="text-sm mt-1">Hãy là người đầu tiên đặt câu hỏi cho người bán!</p>
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
