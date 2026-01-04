import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BidService } from '../../services/backendService';
import { formatCurrency } from '../../utils/formatters';

const BiddingProducts = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await BidService.findByBidder(user.id);
        console.log(res);
        setBids(res.data);
      }
      catch (err) {
        console.log('Error fetching bids', err.message);
      }
    }

    fetchBids();

  }, [user]);

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 border-b pb-2">Đang tham gia đấu giá</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3">Sản phẩm</th>
              <th className="p-3">Giá hiện tại</th>
              <th className="p-3">Giá bạn đặt</th>
              <th className="p-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {bids.length === 0 ? (
              <p className="text-gray-500 italic">Bạn chưa tham gia đâu giá sản phẩm nào.</p>
            ) : (
              <>
                {bids.map((bid) => (
                  <tr key={bid.id} className="border-b">
                    <td className="p-3 font-medium">{bid.product.name}</td>
                    <td className="p-3">{formatCurrency(bid.product.current_price)}</td>
                    <td className="p-3 text-blue-600 font-bold">{formatCurrency(bid.bid_amount)}</td>
                    <td className="p-3">
                      {bid.bid_amount == bid.product.current_price ? (
                        <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs">Đang dẫn đầu</span>
                      ) : (
                        <span className="text-red-600 bg-red-100 px-2 py-1 rounded text-xs">Bị vượt mặt</span>
                      )}
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BiddingProducts;
