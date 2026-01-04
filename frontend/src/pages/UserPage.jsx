import { Home, ChevronRight, Shield, Store, Clock, CheckCircle, XCircle } from 'lucide-react';
import { UserService, BidService } from '../services/backendService';
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
                <Link to="/admin" className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors bg-linear-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-700 font-medium border border-purple-200">
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
export default UserPage;