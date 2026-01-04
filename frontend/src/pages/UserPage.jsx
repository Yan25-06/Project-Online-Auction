import { Home, ChevronRight, Shield, Store, Clock, CheckCircle, XCircle } from 'lucide-react';
import { UserService, BidService } from '../services/backendService';
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Home, ChevronRight, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWatchList } from '../context/WatchListContext';
import ProfileSettings from '../components/user/ProfileSettings';
import MyRatings from '../components/user/MyRatings';
import FavoriteProducts from '../components/user/FavoriteProducts';
import BiddingProducts from '../components/user/BiddingProducts';
import WonProducts from '../components/user/WonProducts';
import MyProducts from '../components/user/MyProducts';
import UnansweredQuestions from '../components/user/UnansweredQuestions';
import BlockedBidders from '../components/user/BlockedBidders';
import TabButton from '../components/user/TabButton';

// Icon đơn giản (dùng text hoặc icon library tùy bạn)
const IconUser = () => <span>👤</span>;
const IconLock = () => <span>🔒</span>;
const IconHeart = () => <span>❤️</span>;
const IconGavel = () => <span>🔨</span>;
const IconTrophy = () => <span>🏆</span>;
const IconStar = () => <span>⭐</span>;
const IconStore = () => <span>🏪</span>;
const IconPackage = () => <span>📦</span>;
const IconQuestion = () => <span>❓</span>;
const IconBlock = () => <span>🚫</span>;

const UserPage = () => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'profile');
  const { user } = useAuth();
  const { watchList } = useWatchList();
  const [title, setTitle] = useState('Trang cá nhân');
  const [profile, setProfile] = useState(null);
  
  // Update active tab when URL changes
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);
  

  useEffect(() => {
    // Fetch user profile to get role from backend
    const fetchProfile = async () => {
      if (user && user.id) {
        try {
          const userProfile = await UserService.getById(user.id);
          setProfile(userProfile);
        } catch (err) {
          console.error('Error fetching profile:', err);
        }
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    // Hooks

  }, [activeTab])

  // Placeholder component cho từng phần
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'ratings':
        return <MyRatings />;
      case 'upgrade':
        return <UpgradeToSeller profile={profile} onRefresh={async () => {
          if (user && user.id) {
            const updated = await UserService.getById(user.id);
            setProfile(updated);
          }
        }} />;
      case 'favorites':
        return <FavoriteProducts watchList={watchList} />;
      case 'bidding':
        return <BiddingProducts />;
      case 'won':
        return <WonProducts />;
      case 'my-products':
        return <MyProducts />;
      case 'questions':
        return <UnansweredQuestions />;
      case 'blocked':
        return <BlockedBidders />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      {/* Breadcrumb nhỏ */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/" className="flex items-center hover:text-blue-600">
          <Home size={16} className="mr-1" /> Trang chủ
        </Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-gray-900 font-medium truncate max-w-[200px]">
          {title}
        </span>
      </div>

      <div className="max-w-screen mx-auto bg-white rounded-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* SIDEBAR MENU */}
        <div className="w-full basis-1/4 md:w-1/4 bg-gray-50 border-r border-gray-200 p-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold mb-2">
              {user?.user_metadata.full_name.charAt(0).toUpperCase() || "U"}
            </div>
            <h2 className="text-xl font-bold text-gray-800">{user?.user_metadata.full_name || user?.email}</h2>
            
            {/* Hiển thị số ngày còn lại của quyền seller */}
            {profile?.role === 'seller' && profile?.upgrade_requested_at && (() => {
              const upgradeDate = new Date(profile.upgrade_requested_at);
              const expiryDate = new Date(upgradeDate);
              expiryDate.setDate(expiryDate.getDate() + 7);
              const now = new Date();
              const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
              
              if (daysLeft > 0) {
                return (
                  <div className={`mt-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                    daysLeft <= 2 ? 'bg-red-100 text-red-700' : 
                    daysLeft <= 4 ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-green-100 text-green-700'
                  }`}>
                    🏪 Quyền Seller còn {daysLeft} ngày
                  </div>
                );
              } else {
                return (
                  <div className="mt-2 px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    ⚠️ Quyền Seller đã hết hạn
                  </div>
                );
              }
            })()}
          </div>

          <nav className="space-y-2">
            <TabButton id="profile" label="Thông tin tài khoản" icon={<IconUser />} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton id="ratings" label="Điểm đánh giá" icon={<IconStar />} activeTab={activeTab} setActiveTab={setActiveTab} />
            
            {/* Only show upgrade tab for bidders */}
            {profile?.role === 'bidder' && (
              <TabButton id="upgrade" label="Đăng ký bán hàng" icon={<IconStore />} activeTab={activeTab} setActiveTab={setActiveTab} />
            )}
            
            {/* Bidder Section */}
            <div className="border-t my-2"></div>
            <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">Người mua</div>
            <TabButton id="favorites" label="Sản phẩm yêu thích" icon={<IconHeart />} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton id="bidding" label="Đang đấu giá" icon={<IconGavel />} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton id="won" label="Sản phẩm đã thắng" icon={<IconTrophy />} activeTab={activeTab} setActiveTab={setActiveTab} />
            
            {/* Seller Section - Only show for sellers */}
            {profile?.role === 'seller' && (
              <>
                <div className="border-t my-2"></div>
                <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">Người bán</div>
                <TabButton id="my-products" label="Sản phẩm của tôi" icon={<IconPackage />} activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton id="questions" label="Câu hỏi chưa trả lời" icon={<IconQuestion />} activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton id="blocked" label="Danh sách chặn" icon={<IconBlock />} activeTab={activeTab} setActiveTab={setActiveTab} />
              </>
            )}
            
            {/* Admin Panel - Only show for admin users */}
            {profile?.role === 'admin' && (
              <>
                <div className="border-t my-2"></div>
                <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">Quản trị</div>
                <Link to="/admin" className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-700 font-medium border border-purple-200">
                  <Shield size={18} />
                  <span>Trang quản trị</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="w-full basis-4/5 md:w-3/4 p-8 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// --- CÁC SUB-COMPONENTS (Giao diện chi tiết) ---

// 1. Đổi thông tin & Mật khẩu
const ProfileSettings = () => {
  const [userData, setUserData] = useState({ full_name: '', email: '', address: ''});
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchUser = () => {
      if (user) {
        console.log(user);
        setUserData({ 
          full_name: user.user_metadata.full_name || '', 
          email: user.email || '',
          address: user.user_metadata.address || '',
        });
      }
    }

    fetchUser();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    })
  }

  const handleInfoSubmit = async (e) => {
    e.preventDefault();

    try {
      const updatedUser = await AuthService.updateProfile(userData);
      console.log('Người dùng đã cập nhật', updatedUser);
    } catch (err) {
      console.log(err);
    }
  } 

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert("Mật khẩu phải ít nhất 6 ký tự");
      return;
    }
    if (newPassword != confirmPassword) {
      alert("Mật khẩu mới và mật khẩu xác nhận không khớp nhau");
      return;
    }

    try {
      const thisUser = await AuthService.login(user.email, password);
      const updatedUser = await AuthService.updatePassword(newPassword);
      console.log('Người dùng đã cập nhật', updatedUser);
    }
    catch (err) {
      console.error(err);
      if (err.message == "Invalid login credentials")
        alert("Sai mật khẩu cũ")
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
      <form>
        <h3 className="text-2xl font-bold mb-4 border-b pb-2">Thông tin cá nhân</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
            <input 
              name="full_name"
              type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
              value={userData.full_name} 
              onChange={(e) => handleInputChange(e)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              name="email"
              type="email" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
              value={userData.email} 
              onChange={(e) => handleInputChange(e)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
            <input 
              name="address"
              type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
              value={userData.address}
              onChange={(e) => handleInputChange(e)}
            />
          </div>
        </div>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full mt-2"
          onClick={handleInfoSubmit}
        >
            Lưu thay đổi
        </button>
      </form>

      <div>
        <h3 className="text-2xl font-bold mb-4 border-b pb-2">Đổi mật khẩu</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu cũ <span className="text-red-500">*</span></label>
            <input 
              name="password"
              type="password" className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={password} 
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
            <input 
              name="newPassword"
              type="password" className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
            <input 
              name="confirmPassword"
              type="password" className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full mt-2" onClick={(e) => handlePasswordSubmit(e)}>
            Đổi mật khẩu
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Xem điểm đánh giá & Nhận xét
const MyRatings = () => (
  <div>
    <h3 className="text-2xl font-bold mb-6 border-b pb-2">Hồ sơ uy tín</h3>
    
    {/* Tổng điểm */}
    <div className="flex items-center space-x-4 mb-8 bg-blue-50 p-4 rounded-lg">
      <div className="text-4xl font-bold text-blue-600">+15</div>
      <div>
        <p className="font-semibold">Điểm uy tín hiện tại</p>
        <p className="text-sm text-gray-500">Dựa trên các giao dịch mua bán thành công</p>
      </div>
    </div>

    {/* List nhận xét */}
    <h4 className="font-bold text-lg mb-4">Nhận xét từ cộng đồng</h4>
    <div className="space-y-4">
      {/* Item 1 */}
      <div className="border p-4 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <span className="font-bold">Seller123</span>
            <span className="text-xs text-gray-400 ml-2">2 ngày trước</span>
          </div>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">👍 +1</span>
        </div>
        <p className="text-gray-600 mt-2">"Người mua thanh toán nhanh, rất uy tín!"</p>
        <p className="text-xs text-gray-400 mt-1 italic">Sản phẩm: iPhone 13 Pro Max</p>
      </div>

      {/* Item 2 */}
      <div className="border p-4 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <span className="font-bold">ShopGiaRe</span>
            <span className="text-xs text-gray-400 ml-2">1 tuần trước</span>
          </div>
          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">👎 -1</span>
        </div>
        <p className="text-gray-600 mt-2">"Đấu giá thắng nhưng không liên lạc được để nhận hàng."</p>
        <p className="text-xs text-gray-400 mt-1 italic">Sản phẩm: Tai nghe Sony</p>
      </div>
    </div>
  </div>
);

// 2.5 Đăng ký bán hàng (Upgrade to Seller)
const UpgradeToSeller = ({ profile, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Calculate days left if rejected
  const getDaysLeftAfterRejection = () => {
    if (!profile?.upgrade_rejected_at) return 0;
    const rejectedDate = new Date(profile.upgrade_rejected_at);
    const sevenDaysLater = new Date(rejectedDate);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const now = new Date();
    const daysLeft = Math.ceil((sevenDaysLater - now) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  const daysLeft = getDaysLeftAfterRejection();
  const isPending = profile?.upgrade_requested === true;
  const wasRejected = profile?.upgrade_rejected_at && daysLeft > 0;

  const handleRequestUpgrade = async () => {
    try {
      setLoading(true);
      setError(null);
      // Truyền profile.id vào requestUpgrade theo route backend
      await UserService.requestUpgrade(profile.id);
      setSuccess(true);
      if (onRefresh) await onRefresh();
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Gửi yêu cầu thất bại';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 border-b pb-2">Đăng ký trở thành Người bán</h3>
      
      <div className="max-w-2xl">
        {/* Benefits */}
        <div className="bg-linear-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100 mb-6">
          <h4 className="font-bold text-lg text-blue-800 mb-4 flex items-center gap-2">
            <Store size={20} /> Lợi ích khi trở thành Người bán
          </h4>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
              <span>Đăng bán sản phẩm đấu giá không giới hạn</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
              <span>Quản lý sản phẩm và theo dõi lượt đấu giá</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
              <span>Nhận thanh toán an toàn qua hệ thống</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
              <span>Hỗ trợ ưu tiên từ đội ngũ chăm sóc khách hàng</span>
            </li>
          </ul>
        </div>

        {/* Status display */}
        {isPending && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock size={24} className="text-yellow-600" />
              </div>
              <div>
                <h4 className="font-bold text-yellow-800">Đang chờ duyệt</h4>
                <p className="text-sm text-yellow-700">
                  Yêu cầu của bạn đã được gửi và đang chờ Admin phê duyệt.
                  Thời gian xử lý thông thường từ 1-3 ngày làm việc.
                </p>
              </div>
            </div>
          </div>
        )}

        {wasRejected && !isPending && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle size={24} className="text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-red-800">Yêu cầu đã bị từ chối</h4>
                <p className="text-sm text-red-700">
                  Yêu cầu nâng cấp trước đó của bạn đã bị từ chối. 
                  Bạn có thể gửi lại yêu cầu sau <strong>{daysLeft} ngày</strong> nữa.
                </p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-green-800">Gửi yêu cầu thành công!</h4>
                <p className="text-sm text-green-700">
                  Yêu cầu của bạn đã được gửi đến Admin. Vui lòng chờ phê duyệt.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Action button */}
        {!isPending && !success && (
          <button
            onClick={handleRequestUpgrade}
            disabled={loading || wasRejected}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              loading || wasRejected
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-linear-to-r from-blue-600 to-purple-600 text-black dark:text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang gửi...
              </span>
            ) : wasRejected ? (
              `Gửi lại sau ${daysLeft} ngày`
            ) : (
              'Gửi yêu cầu nâng cấp'
            )}
          </button>
        )}

        {/* Requirements note */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h5 className="font-semibold text-gray-700 mb-2">Lưu ý:</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Tài khoản cần có điểm đánh giá tốt để được duyệt nhanh hơn</li>
            <li>• Admin sẽ xem xét lịch sử giao dịch của bạn trước khi phê duyệt</li>
            <li>• Nếu bị từ chối, bạn có thể gửi lại yêu cầu sau 7 ngày</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// 3. Sản phẩm yêu thích
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

// 4. Đang đấu giá
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

// 5. Đã thắng & Đánh giá (QUAN TRỌNG)
const WonProducts = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await BidService.getWinningBids(user.id);
        console.log(res);
        setBids(res);
      }
      catch (err) {
        console.log('Error fetching bids', err.message);
      }
    }

    fetchBids();

  }, [user]);
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 border-b pb-2">Sản phẩm đã thắng</h3>
      <div className="space-y-6">
        
        {/* Item đã thắng */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between mb-4">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded"></div>
              <div>
                <h4 className="font-bold text-lg">Macbook Air M1 2020</h4>
                <p className="text-sm text-gray-500">Người bán: <span className="text-blue-600 cursor-pointer">AppleLover</span></p>
                <p className="text-green-600 font-bold text-xl mt-1">Giá thắng: 18.500.000 đ</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Chờ thanh toán</span>
            </div>
          </div>

          {/* Form đánh giá người bán (Theo yêu cầu hình ảnh) */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2">
            <p className="font-bold text-sm mb-2 text-gray-700">Đánh giá người bán:</p>
            <div className="flex gap-2 mb-3">
              <button className="flex items-center gap-1 bg-white border border-gray-300 px-3 py-1 rounded hover:bg-green-50 hover:border-green-500 hover:text-green-600 transition">
                👍 Hài lòng (+1)
              </button>
              <button className="flex items-center gap-1 bg-white border border-gray-300 px-3 py-1 rounded hover:bg-red-50 hover:border-red-500 hover:text-red-600 transition">
                👎 Không hài lòng (-1)
              </button>
            </div>
            <textarea 
              className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500" 
              placeholder="Nhập nhận xét của bạn về người bán này (ví dụ: Giao hàng nhanh, đóng gói kỹ...)"
              rows="2"
            ></textarea>
            <div className="text-right mt-2">
              <button className="bg-gray-800 text-white text-sm px-4 py-2 rounded hover:bg-black">Gửi đánh giá</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper Button Component
const TabButton = ({ id, label, icon, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
      activeTab === id 
      ? 'bg-blue-100 text-blue-700 font-medium' 
      : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default UserPage;