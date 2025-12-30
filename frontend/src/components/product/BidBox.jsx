import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { formatCurrency, formatPostDate, maskName } from '../../utils/formatters';
import { BidService, ProductService, UserService, BlockedBidderService } from '../../services/backendService';
import { AuthService } from '../../services/authService';
import { useToast } from '../common/Toast';
import { is } from 'drizzle-orm';

const BidBox = ({ product, onTopBidderChange }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [placingBid, setPlacingBid] = useState(false);
  const [bidHistory, setBidHistory] = useState([]);
  const [highestBid, setHighestBid] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [rejectingBidId, setRejectingBidId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      if (!product) return;
      
      // detect if current user is product owner/seller
      let isProductOwner = false;
      let currentUser = null;
      try {
        currentUser = await AuthService.getCurrentUser();
        const sellerId = product.seller_id || (product.seller && product.seller.id);
        isProductOwner = !!(currentUser && sellerId && currentUser.id === sellerId);
        setIsOwner(isProductOwner);
      } catch (e) {
        setIsOwner(false);
      }

      // Check if current user is blocked for this product
      if (currentUser && !isProductOwner) {
        try {
          const response = await BlockedBidderService.isBlocked(product.id, currentUser.id);
          // API returns { blocked: true/false } or throws error if not blocked
          const blocked = response?.blocked === true;
          console.log('ProductId:', product.id, 'UserId:', currentUser.id, 'Response:', response, 'isBlocked:', blocked);
          setIsBlocked(blocked);
        } catch (e) {
          // If API throws error, user is not blocked
          console.log('Check block error (not blocked):', e.message);
          setIsBlocked(false);
        }
      } else {
        setIsBlocked(false);
      }

      try {
        const hb = await BidService.getHighestBid(product.id);
        setHighestBid(hb || null);
      } catch (e) {
        setHighestBid(null);
      }

      try {
        // getHistory automatically returns full data for sellers, masked data for others
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
      toast.show(msg, { type: 'error' });
    } finally {
      setPlacingBid(false);
    }
  };

  const handleRejectBid = async (bid) => {
    if (!window.confirm(`Bạn chắc chắn muốn từ chối lượt đấu giá của ${bid.bidder_name}?`)) {
      return;
    }

    try {
      setRejectingBidId(bid.id);
      
      // Reject the bid
      await BidService.reject(bid.id);
      
      // Block the bidder for this product
      await BlockedBidderService.block({
        productId: product.id,
        bidderId: bid.bidder_id,
        sellerId: product.seller_id || product.seller?.id,
        reason: 'Bid rejected by seller'
      });

      // If this was the highest bid, update product to 2nd highest or initial price
      if (highestBid && highestBid.id === bid.id) {
        // Find 2nd highest bid from remaining non-rejected bids
        const remainingBids = bidHistory
          .filter(b => b.id !== bid.id && !b.is_rejected)
          .sort((a, b) => b.bid_amount - a.bid_amount);
        
        if (remainingBids.length > 0) {
          // Update to 2nd highest bid
          const secondHighest = remainingBids[0];
          await ProductService.updatePrice(product.id, secondHighest.bid_amount);
          setHighestBid(secondHighest);
          const bidder = await UserService.getById(secondHighest.bidder_id);
          if (onTopBidderChange) onTopBidderChange(maskName(bidder.full_name || ''));
        } else {
          // No more bids, reset to starting price
          const startingPrice = product.starting_price || product.current_price;
          await ProductService.updatePrice(product.id, startingPrice);
          setHighestBid(null);
          if (onTopBidderChange) onTopBidderChange('Chưa có');
        }
      }

      // Refresh bid history
      const historyRes = await BidService.getHistory(product.id);
      setBidHistory(Array.isArray(historyRes) ? historyRes : historyRes.data || []);
      
      toast.show('Đã từ chối lượt đấu giá thành công. Người bán không được đấu giá sản phẩm này nữa.', { type: 'success' });
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Từ chối lượt đấu giá thất bại';
      toast.show(msg, { type: 'error' });
    } finally {
      setRejectingBidId(null);
    }
  };

  return (
    <div>
      {isOwner ? (
        <div className="mb-4 p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800">
          Bạn là người đăng bán, không thể đặt giá cho sản phẩm của mình.
        </div>
      ) : isBlocked ? (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
          Bạn đã bị chặn khỏi sản phẩm này. Không thể đặt giá.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="col-span-1 flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="Nhập giá đặt"
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
      )}

      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="text-md font-bold mb-3">Lịch sử đấu giá</h4>
        <div className="">
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {bidHistory.length > 0 ? (
              bidHistory.map(item => (
                <div 
                  key={item.id} 
                  className={`flex items-center justify-between p-2 border rounded-lg ${
                    item.is_rejected ? 'bg-red-50 border-red-200 opacity-60' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="text-sm text-gray-700">
                      {item.bidder_name}
                      {item.is_rejected && <span className="ml-2 text-xs text-red-600 font-semibold">[Từ chối]</span>}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-red-600">{formatCurrency(item.bid_amount)}</div>
                  <div className="text-xs text-gray-400 ml-2">{formatPostDate(item.created_at)}</div>
                  
                  {isOwner && !item.is_rejected && (
                    <button
                      onClick={() => handleRejectBid(item)}
                      disabled={rejectingBidId === item.id}
                      className="ml-2 p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Từ chối lượt đấu giá này"
                    >
                      {rejectingBidId === item.id ? (
                        <span className="text-xs">Đang xử lý...</span>
                      ) : (
                        <X size={16} />
                      )}
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">Chưa có lượt đấu giá nào.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BidBox;
