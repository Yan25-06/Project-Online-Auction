import React from 'react';
import ProductCard from '../product/ProductCard';

const FavoriteProducts = ({ watchList=[] }) => {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 border-b pb-2">Sản phẩm yêu thích</h3>

      {watchList.length === 0 ? (
        // Dòng thông báo đơn giản
        <p className="text-gray-500 italic">Bạn chưa có sản phẩm yêu thích nào.</p>
      ) : (
        // Render ProductCard
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {watchList.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoriteProducts;
