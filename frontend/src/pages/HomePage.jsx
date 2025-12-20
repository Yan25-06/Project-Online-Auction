import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
	Clock,
	Gavel,
	TrendingUp,
	Filter,
	CircleDollarSign,
	ChevronRight,
	ChevronDown,
} from "lucide-react";
import ProductCard from "../components/product/ProductCard";
import SectionTitle from "../components/product/SectionTitle";
import Header from "../components/common/Header";

import { ProductService, CategoryService } from "../services/backendService";

const HomePage = () => {
	const [loading, setLoading] = useState(true);
	const [categories, setCategories] = useState([]); // Chứa danh sách phân cấp (Hierarchy)
	const [endingSoonProducts, setEndingSoonProducts] = useState([]);
	const [topBidProducts, setTopBidProducts] = useState([]);
	const [topPriceProducts, setTopPriceProducts] = useState([]);

	// 2. Gọi API khi Component được mount
	useEffect(() => {
		const fetchHomeData = async () => {
			try {
				setLoading(true);
				// Sử dụng getHierarchy thay vì getAll để lấy cấu trúc cây (Tree)
				const [catsHierarchy, endSoonData, bidsData, priceData] =
					await Promise.all([
						CategoryService.getHierarchy(), // <--- THAY ĐỔI TẠI ĐÂY
						ProductService.getEndingSoon(),
						ProductService.getMostBids(),
						ProductService.getHighestPrice(),
					]);

				setCategories(catsHierarchy || []);
				setEndingSoonProducts(endSoonData || []);
				setTopBidProducts(bidsData || []);
				setTopPriceProducts(priceData || []);
			} catch (error) {
				console.error("Lỗi tải dữ liệu trang chủ:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchHomeData();
	}, []);

	const renderCategories = () => {
		return categories.map((parent) => {
			const childCategories = parent.subcategories || [];

			return (
				<div key={parent.id} className="mb-3">
					{/* Hiển thị CHA */}
					<Link to={`/categories/${parent.id}`}>
						<div className="flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors group">
							<span className="font-bold text-gray-800 group-hover:text-blue-700">
								{parent.name}
							</span>
							{/* Icon mũi tên */}
							{childCategories.length > 0 ? (
								<ChevronDown size={14} className="text-gray-400" />
							) : (
								<ChevronRight size={14} className="text-gray-400" />
							)}
						</div>
					</Link>

					{/* Hiển thị CON (nếu có) */}
					{childCategories.length > 0 && (
						<ul className="pl-4 mt-1 space-y-1 border-l-2 border-gray-100 ml-2">
							{childCategories.map((child) => (
								<li key={child.id}>
									<Link to={`/categories/${child.id}`}>
										<div className="text-sm text-gray-500 hover:text-blue-600 py-1 px-2 rounded hover:bg-blue-50 transition-colors flex items-center gap-2">
											<span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
											{child.name}
										</div>
									</Link>
								</li>
							))}
						</ul>
					)}
				</div>
			);
		});
	};
	// ------------------------------------------

	const ProductSkeleton = () => (
		<div className="grid md:grid-cols-5 gap-6 animate-pulse">
			{[...Array(5)].map((_, i) => (
				<div key={i} className="bg-gray-200 h-80 rounded-xl"></div>
			))}
		</div>
	);

	return (
		<>
			<div className="container mx-auto px-4 py-8 space-y-12">
				{/* --- SECTION 1: DANH MỤC & BANNER --- */}
				<section className="grid grid-cols-1 md:grid-cols-4 gap-6">
					{/* Sidebar Danh mục */}
					<div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 md:col-span-1 h-fit">
						<h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
							<Filter size={18} /> Danh mục sản phẩm
						</h3>
						{loading ? (
							<div className="space-y-3 animate-pulse">
								{[...Array(5)].map((_, i) => (
									<div key={i} className="h-8 bg-gray-100 rounded"></div>
								))}
							</div>
						) : (
							<div className="space-y-1 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
								{/* Render danh mục */}
								{renderCategories()}

								{categories.length === 0 && (
									<p className="text-gray-400 text-sm text-center py-4">
										Chưa có danh mục
									</p>
								)}
							</div>
						)}
					</div>

					{/* Banner Chính */}
					<div className="md:col-span-3 bg-linear-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg text-white p-8 flex flex-col justify-center relative overflow-hidden min-h-[300px]">
						<div className="relative z-10 max-w-lg">
							<h1 className="text-4xl font-bold mb-4 leading-tight">
								Sàn Đấu Giá Uy Tín <br /> Hàng Đầu Việt Nam
							</h1>
							<p className="text-blue-100 mb-8 text-lg">
								Săn hàng hiệu giá rẻ. Đấu giá công bằng. Thanh toán an toàn.
							</p>
							<Link to="/search" className="inline-block">
								<button className="bg-white text-blue-700 px-8 py-3 rounded-full font-bold hover:bg-yellow-400 hover:text-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer">
									Khám phá ngay
								</button>
							</Link>
						</div>
						<div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
							<Gavel size={250} />
						</div>
						<div className="absolute top-10 right-20 w-20 h-20 bg-yellow-400 rounded-full blur-3xl opacity-30"></div>
					</div>
				</section>

				{/* --- SECTION 2: SẮP KẾT THÚC --- */}
				<section>
					<SectionTitle
						icon={Clock}
						title="Sắp kết thúc"
						subtitle="Cơ hội chót để sở hữu sản phẩm giá tốt"
					/>
					{loading ? (
						<ProductSkeleton />
					) : (
						<div className="grid md:grid-cols-5 gap-4 md:gap-6">
							{endingSoonProducts.map((product) => (
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
					{loading ? (
						<ProductSkeleton />
					) : (
						<div className="grid md:grid-cols-5 gap-4 md:gap-6">
							{topBidProducts.map((product) => (
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
					{loading ? (
						<ProductSkeleton />
					) : (
						<div className="grid md:grid-cols-5 gap-4 md:gap-6">
							{topPriceProducts.map((product) => (
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
