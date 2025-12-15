import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Gavel, TrendingUp, Filter, CircleDollarSign, ChevronRight } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import SectionTitle from '../components/product/SectionTitle';
import Header from '../components/common/Header';

import { ProductService, CategoryService } from '../services/backendService';

const HomePage = () => {
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [endingSoonProducts, setEndingSoonProducts] = useState([]);
    const [topBidProducts, setTopBidProducts] = useState([]);
    const [topPriceProducts, setTopPriceProducts] = useState([]);

    // 2. Gọi API khi Component được mount
    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                setLoading(true);
                const [catsData, endSoonData, bidsData, priceData] = await Promise.all([
                    CategoryService.getAll(),             // Lấy danh mục
                    ProductService.getEndingSoon(),       // Lấy top sắp kết thúc
                    ProductService.getTopBids(),          // Lấy top đấu giá nhiều
                    ProductService.getTopPrices()         // Lấy top giá cao
                ]);

                setCategories(catsData || []);
                
                setEndingSoonProducts(endSoonData || []);
                setTopBidProducts(bidsData || []);
                setTopPriceProducts(priceData || []);
                
                console.log(bidsData)
            } catch (error) {
                console.error("Lỗi tải dữ liệu trang chủ:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    const ProductSkeleton = () => (
        <div className="grid md:grid-cols-5 gap-6 animate-pulse">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-80 rounded-xl"></div>
            ))}
        </div>
    );

    return (
        <>
            <Header />
            <div className="container mx-auto px-4 py-8 space-y-12">
                
                {/* --- SECTION 1: DANH MỤC & BANNER --- */}
                <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Sidebar Danh mục */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 md:col-span-1">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Filter size={18} /> Danh mục
                        </h3>
                        {loading ? (
                            <div className="space-y-3 animate-pulse">
                                {[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded"></div>)}
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {categories.map(cat => (
                                    <Link to={`/categories/${cat.id}`} key={cat.id}>
                                        <li className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer group">
                                            <span className="text-sm text-gray-600 group-hover:text-blue-600 font-medium">
                                                {cat.name}
                                            </span>
                                            <ChevronRight size={14} className="text-gray-400" />
                                        </li>
                                    </Link>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Banner Chính */}
                    <div className="md:col-span-3 bg-linear-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg text-white p-8 flex flex-col justify-center relative overflow-hidden">
                        <div className="relative z-10 max-w-lg">
                            <h1 className="text-3xl font-bold mb-4">Sàn Đấu Giá Uy Tín Số 1</h1>
                            <p className="text-blue-100 mb-6">Săn hàng hiệu giá rẻ. Đấu giá công bằng. Thanh toán an toàn.</p>
                            <button className="bg-white text-blue-700 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-md cursor-pointer">
                                Khám phá ngay
                            </button>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-10">
                            <Gavel size={200} />
                        </div>
                    </div>
                </section>

                {/* --- SECTION 2: SẮP KẾT THÚC --- */}
                <section>
                    <SectionTitle
                        icon={Clock}
                        title="Sắp kết thúc"
                        subtitle="Cơ hội chót để sở hữu sản phẩm giá tốt"
                    />
                    {loading ? <ProductSkeleton /> : (
                        <div className="grid md:grid-cols-5 gap-6">
                            {endingSoonProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </section>

                {/* --- SECTION 3: ĐẤU GIÁ SÔI ĐỘNG (TOP BIDS) --- */}
                <section>
                    <SectionTitle
                        icon={TrendingUp}
                        title="Đấu giá sôi động"
                        subtitle="Các sản phẩm đang được săn đón nhiều nhất"
                    />
                    {loading ? <ProductSkeleton /> : (
                        <div className="grid md:grid-cols-5 gap-6">
                            {topBidProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </section>

                {/* --- SECTION 4: GIÁ CAO NHẤT --- */}
                <section>
                    <SectionTitle
                        icon={CircleDollarSign}
                        title="Sản phẩm giá cao"
                        subtitle="Top 5 sản phẩm có giá trị cao nhất sàn"
                    />
                    {loading ? <ProductSkeleton /> : (
                        <div className="grid md:grid-cols-5 gap-6">
                            {topPriceProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
};

export default HomePage;