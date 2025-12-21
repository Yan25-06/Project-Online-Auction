import React, { useState, useEffect } from 'react';
import { UserService, WatchlistService, RatingService } from '../services/backendService';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/product/ProductCard';
import { useWatchList } from '../context/WatchListContext';
import { AuthService } from '../services/authService';
// Icon đơn giản (dùng text hoặc icon library tùy bạn)
const IconUser = () => <span>👤</span>;
const IconLock = () => <span>🔒</span>;
const IconHeart = () => <span>❤️</span>;
const IconGavel = () => <span>🔨</span>;
const IconTrophy = () => <span>🏆</span>;
const IconStar = () => <span>⭐</span>;

const UserPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuth();
  const { watchList } = useWatchList();

  // useEffect(() => {
  //   const fetchUser = () => {
  //     if (user) {
  //       console.log(user);
  //       setUserData({ 
  //         full_name: user.user_metadata.full_name || '', 
  //         email: user.email || '',
  //         address: user.user_metadata.address || '',
  //       });
  //     }

  //     console.log(userData);
  //   }

  //   fetchUser();
  // }, [user]);

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
      case 'favorites':
        return <FavoriteProducts watchList={watchList}/>;
      case 'bidding':
        return <BiddingProducts />;
      case 'won':
        return <WonProducts />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-screen mx-auto bg-white rounded-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* SIDEBAR MENU */}
        <div className="w-full basis-1/4 md:w-1/4 bg-gray-50 border-r border-gray-200 p-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold mb-2">
              {user?.user_metadata.full_name.charAt(0).toUpperCase() || "U"}
            </div>
            <h2 className="text-xl font-bold text-gray-800">{user?.user_metadata.full_name || user?.email}</h2>
          </div>

          <nav className="space-y-2">
            <TabButton id="profile" label="Thông tin tài khoản" icon={<IconUser />} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton id="ratings" label="Điểm đánh giá" icon={<IconStar />} activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="border-t my-2"></div>
            <TabButton id="favorites" label="Sản phẩm yêu thích" icon={<IconHeart />} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton id="bidding" label="Đang đấu giá" icon={<IconGavel />} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton id="won" label="Sản phẩm đã thắng" icon={<IconTrophy />} activeTab={activeTab} setActiveTab={setActiveTab} />
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
    <div className="space-y-8 flex flex-col items-center">
      <form>
        <h3 className="text-2xl font-bold mb-4 border-b pb-2">Thông tin cá nhân</h3>
        <div className="grid grid-cols-1 gap-4 max-w-md">
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
        <div className="grid grid-cols-1 gap-4 max-w-md">
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
const BiddingProducts = () => (
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
          <tr className="border-b">
            <td className="p-3 font-medium">Bàn phím cơ Keychron</td>
            <td className="p-3">1.200.000 đ</td>
            <td className="p-3 text-blue-600 font-bold">1.200.000 đ</td>
            <td className="p-3"><span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs">Đang dẫn đầu</span></td>
          </tr>
          <tr className="border-b">
            <td className="p-3 font-medium">Đồng hồ Casio</td>
            <td className="p-3">550.000 đ</td>
            <td className="p-3 text-gray-500">400.000 đ</td>
            <td className="p-3"><span className="text-red-600 bg-red-100 px-2 py-1 rounded text-xs">Bị vượt mặt</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

// 5. Đã thắng & Đánh giá (QUAN TRỌNG)
const WonProducts = () => (
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