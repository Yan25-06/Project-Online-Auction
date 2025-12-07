import { useState, useEffect } from 'react';
import ProductCard from '../components/product/ProductCard';
import SectionTitle from '../components/product/SectionTitle';
import { Clock, Gavel, TrendingUp, Filter, CircleDollarSign } from 'lucide-react';
import { CATEGORIES, MOCK_PRODUCTS } from '../data/mockData';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header'
const HomePage = () => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setTimeout(() => setLoading(false), 500);
    }, []);
  return (
    <>
        <Header/>
        <div className="container mx-auto px-4 py-8 space-y-12">
            {/* Hero / Top Categories */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 md:col-span-1">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Filter size={18} /> Danh mục
                </h3>
                <ul className="space-y-2">
                {CATEGORIES.map(cat => {
                    const productCount = MOCK_PRODUCTS.filter(p => p.categoryId === cat.id).length;
                    return (
                        <Link to={`/categories/${cat.id}`} key={cat.id}>
                        <li key={cat.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer group">
                        <span className="text-sm text-gray-600 group-hover:text-blue-600 font-medium">{cat.name}</span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            {productCount}
                        </span>
                        </li>
                        </Link>
                    );
                })}
                </ul>
            </div>
            
            <div className="md:col-span-3 bg-linear-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg text-white p-8 flex flex-col justify-center relative overflow-hidden">
                <div className="relative z-10 max-w-lg">
                <h1 className="text-3xl font-bold mb-4">Sàn Đấu Giá Uy Tín Số 1</h1>
                <p className="text-blue-100 mb-6">Săn hàng hiệu giá rẻ. Đấu giá công bằng. Thanh toán an toàn.</p>
                <button className="bg-white text-blue-700 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-md">
                    Khám phá ngay
                </button>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10">
                <Gavel size={200} />
                </div>
            </div>
            </section>

            {/* Req 1.2: Top 5 sản phẩm sắp kết thúc */}
            <section>
            <SectionTitle 
                icon={Clock} 
                title="Sắp kết thúc" 
                subtitle="Cơ hội chót để sở hữu sản phẩm giá tốt"
            />
            {loading ? (
                <div className="grid grid-cols-5 gap-6 animate-pulse">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-gray-200 h-80 rounded-xl"></div>
                ))}
                </div>
            ) : (
                <div className="grid grid-cols-5 gap-6">
                {[...MOCK_PRODUCTS].sort((a, b) => a.timeLeft - b.timeLeft).slice(0, 5).map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
                </div>
            )}
            </section>

            {/* Req 1.2: Top 5 sản phẩm giá cao nhất (Trending) */}
            <section>
            <SectionTitle 
                icon={TrendingUp} 
                title="Đấu giá sôi động" 
                subtitle="Các sản phẩm đang được săn đón nhiều nhất"
            />
            <div className="grid grid-cols-5 gap-6">
                {[...MOCK_PRODUCTS].sort((a, b) => b.bidCount - a.bidCount).slice(0, 5).map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
                </div>
            </section>

            <section>
            <SectionTitle 
                icon={CircleDollarSign} 
                title="Sản phẩm giá cao" 
                subtitle="Top 5 sản phẩm có giá trị cao nhất sàn" />
            <div className="grid grid-cols-5 gap-6">
                {[...MOCK_PRODUCTS].sort((a, b) => b.price - a.price).slice(0, 5).map(product => (
                <ProductCard key={product.id} product={product} />
                ))}
            </div>
            </section>
        </div>
    </>
  )
}

export default HomePage