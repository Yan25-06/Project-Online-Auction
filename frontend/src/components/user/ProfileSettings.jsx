import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthService } from '../../services/authService';
import { validateProfileForm, validateChangePassword } from '../../utils/validators';
import { AlertCircle, CheckCircle } from 'lucide-react';

const ProfileSettings = () => {
  const [userData, setUserData] = useState({ full_name: '', email: '', address: ''});
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
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
    });
    // Clear error when user types
    if (profileErrors[name]) {
      setProfileErrors(prev => ({ ...prev, [name]: '' }));
    }
    setProfileSuccess('');
  }

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setProfileErrors({});
    setProfileSuccess('');

    // Custom validation
    const validation = validateProfileForm(userData);
    if (!validation.isValid) {
      setProfileErrors(validation.errors);
      return;
    }

    try {
      const updatedUser = await AuthService.updateProfile(userData);
      console.log('Người dùng đã cập nhật', updatedUser);
      setProfileSuccess('Cập nhật thông tin thành công!');
    } catch (err) {
      console.log(err);
      setProfileErrors({ general: err.message || 'Cập nhật thất bại' });
    }
  } 

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordSuccess('');

    // Custom validation
    const validation = validateChangePassword(password, newPassword, confirmPassword);
    if (!validation.isValid) {
      setPasswordErrors(validation.errors);
      return;
    }

    try {
      const thisUser = await AuthService.login(user.email, password);
      const updatedUser = await AuthService.updatePassword(newPassword);
      console.log('Người dùng đã cập nhật', updatedUser);
      setPasswordSuccess('Đổi mật khẩu thành công!');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    catch (err) {
      console.error(err);
      if (err.message == "Invalid login credentials") {
        setPasswordErrors({ currentPassword: 'Mật khẩu cũ không đúng' });
      } else {
        setPasswordErrors({ general: err.message || 'Đổi mật khẩu thất bại' });
      }
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
      <form noValidate onSubmit={handleInfoSubmit}>
        <h3 className="text-2xl font-bold mb-4 border-b pb-2">Thông tin cá nhân</h3>
        
        {profileErrors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {profileErrors.general}
          </div>
        )}
        
        {profileSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
            <CheckCircle size={16} /> {profileSuccess}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
            <input 
              name="full_name"
              type="text" 
              className={`mt-1 block w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                profileErrors.full_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              value={userData.full_name} 
              onChange={(e) => handleInputChange(e)} 
            />
            {profileErrors.full_name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} /> {profileErrors.full_name}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              name="email"
              type="text"
              className={`mt-1 block w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                profileErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              value={userData.email} 
              onChange={(e) => handleInputChange(e)} 
            />
            {profileErrors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} /> {profileErrors.email}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
            <input 
              name="address"
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={userData.address}
              onChange={(e) => handleInputChange(e)}
            />
          </div>
          <button 
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full mt-2 transition-colors"
          >
            Lưu thay đổi
          </button>
        </div>
      </form>

      <form noValidate onSubmit={handlePasswordSubmit}>
        <h3 className="text-2xl font-bold mb-4 border-b pb-2">Đổi mật khẩu</h3>
        
        {passwordErrors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {passwordErrors.general}
          </div>
        )}
        
        {passwordSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
            <CheckCircle size={16} /> {passwordSuccess}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu cũ</label>
            <input 
              name="password"
              type="password"
              className={`mt-1 block w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                passwordErrors.currentPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              value={password} 
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordErrors.currentPassword) setPasswordErrors(prev => ({ ...prev, currentPassword: '' }));
                setPasswordSuccess('');
              }}
            />
            {passwordErrors.currentPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} /> {passwordErrors.currentPassword}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
            <input 
              name="newPassword"
              type="password"
              className={`mt-1 block w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                passwordErrors.newPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              value={newPassword} 
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (passwordErrors.newPassword) setPasswordErrors(prev => ({ ...prev, newPassword: '' }));
                setPasswordSuccess('');
              }}
            />
            {passwordErrors.newPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} /> {passwordErrors.newPassword}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
            <input 
              name="confirmPassword"
              type="password"
              className={`mt-1 block w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                passwordErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              value={confirmPassword} 
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (passwordErrors.confirmPassword) setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
                setPasswordSuccess('');
              }}
            />
            {passwordErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} /> {passwordErrors.confirmPassword}
              </p>
            )}
          </div>
          <button 
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full mt-2 transition-colors"
          >
            Đổi mật khẩu
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
