import React, { useState, useEffect } from 'react';
import { formatCurrency, formatPostDate, maskName } from '../../utils/formatters';
import { BidService, ProductService, UserService } from '../../services/backendService';
import { AuthService } from '../../services/authService';

const BidBox = ({ product, onTopBidderChange }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [placingBid, setPlacingBid] = useState(false);
  const [bidHistory, setBidHistory] = useState([]);
  const [highestBid, setHighestBid] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!product) return;
      try {
        const hb = await BidService.getHighestBid(product.id);
        setHighestBid(hb || null);
      } catch (e) {
        setHighestBid(null);
      }

      try {
        const historyRes = await BidService.getHistory(product.id);
        setBidHistory(Array.isArray(historyRes) ? historyRes : historyRes.data || []);
      } catch (err) {
        setBidHistory([]);
      }
    };
    load();
  }, [product]);

  const placeBid = async () => {
    try {
      setPlacingBid(true);
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('Bạn cần đăng nhập để đặt giá');

      const inc = product.bid_increment || 0;
      const minReq = (highestBid && highestBid.bid_amount) ? (highestBid.bid_amount + inc) : ((product.current_price || 0) + inc);
      const numeric = Number(bidAmount);
      if (!bidAmount || isNaN(numeric)) throw new Error('Vui lòng nhập giá hợp lệ');
      if (numeric < minReq) throw new Error(`Giá đặt phải lớn hơn hoặc bằng ${minReq}`);

      const payload = {
        product_id: product.id,
        bidder_id: user.id,
        bid_amount: numeric
      };

      const res = await BidService.create(payload);

      const fresh = await ProductService.getById(product.id);
      // refresh local highest and history
      const hb = await BidService.getHighestBid(product.id);
      setHighestBid(hb || null);
      const historyRes = await BidService.getHistory(product.id);
      setBidHistory(Array.isArray(historyRes) ? historyRes : historyRes.data || []);
      setBidAmount('');

      if (res && res.bidder_id) {
        const bidder = await UserService.getById(res.bidder_id);
        if (onTopBidderChange) onTopBidderChange(maskName(bidder.full_name || ''));
      }

    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Đặt giá thất bại';
      alert(msg);
    } finally {
      setPlacingBid(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="col-span-1 flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder={() => ''}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none"
          />
          <button
            onClick={placeBid}
            className="bg-red-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg"
            disabled={placingBid}
          >
            {placingBid ? 'Đang gửi...' : 'Đấu giá'}
          </button>
        </div>
        {product.buy_now_price && (
          <button className="col-span-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg cursor-pointer">
            Mua ngay
          </button>
        )}
      </div>

      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="text-md font-bold mb-3">Lịch sử đấu giá</h4>
        <div className="space-y-3">
          {bidHistory.length > 0 ? (
            bidHistory.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg">
                <div className="text-sm text-gray-700">{item.bidder_name}</div>
                <div className="text-sm font-bold text-red-600">{formatCurrency(item.bid_amount)}</div>
                <div className="text-xs text-gray-400">{formatPostDate(item.created_at)}</div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">Chưa có lượt đấu giá nào.</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BidBox;
