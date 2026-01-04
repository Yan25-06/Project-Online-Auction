import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthService } from '../../services/authService';

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
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full mt-2"
            onClick={handleInfoSubmit}
          >
            Lưu thay đổi
          </button>
        </div>
      </form>

      <form>
        <h3 className="text-2xl font-bold mb-4 border-b pb-2">Đổi mật khẩu</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu cũ</label>
            <input 
              name="password" required
              type="password" className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={password} 
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
            <input 
              name="newPassword" required
              type="password" className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
            <input 
              name="confirmPassword" required
              type="password" className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full mt-2" onClick={(e) => handlePasswordSubmit(e)}>
            Đổi mật khẩu
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
