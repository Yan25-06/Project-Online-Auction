import { Mail, Lock, User, MapPin, UserPlus, RefreshCw, ShieldCheck } from 'lucide-react';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
    recaptcha: false
  });
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (!formData.recaptcha) {
      setError('Vui lòng xác thực bạn không phải là người máy.');
      return;
    }
    
    setLoading(true);

    // Simulate async server check
    setTimeout(() => {
      // Mock unique email check
      if (formData.email === 'test@gmail.com') {
         setError('Email này đã được sử dụng. Vui lòng chọn email khác.');
         setLoading(false);
         return;
      }

      // Generate OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      // In real app, this sends email. Here we alert.
      alert(`[DEMO] Mã OTP xác thực của bạn là: ${newOtp}`);
      
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp === generatedOtp) {
       // Simulate bcrypt hashing (client-side demo only)
       // In reality, password should be sent raw over HTTPS and hashed on server
       const salt = "$2b$10$EixZaYVK1fsbw1ZfbX3OXe"; // Mock salt
       const hashedPassword = `bcrypt(${formData.password}, ${salt})`; 
       
       console.log('--- ĐĂNG KÝ THÀNH CÔNG ---');
       console.log('User:', { ...formData, password: hashedPassword });
       console.log('Algorithm: bcrypt/scrypt');
       
       alert('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
       navigate('/login');
    } else {
       setError('Mã OTP không chính xác. Vui lòng kiểm tra lại.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 animate-fadeIn">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            {step === 1 ? <UserPlus size={24} /> : <ShieldCheck size={24} />}
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 1 ? 'Đăng ký tài khoản mới' : 'Xác thực OTP'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 1 ? 'Tham gia ngay để bắt đầu đấu giá' : `Mã OTP đã được gửi đến ${formData.email}`}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">
            <p>{error}</p>
          </div>
        )}

        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    name="fullName"
                    type="text"
                    required
                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <MapPin size={18} />
                  </div>
                  <input
                    name="address"
                    type="text"
                    required
                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Số nhà, đường, quận/huyện..."
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock size={18} />
                    </div>
                    <input
                      name="password"
                      type="password"
                      required
                      className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="******"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock size={18} />
                    </div>
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="******"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ReCaptcha Mock */}
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
               <input
                 id="recaptcha"
                 name="recaptcha"
                 type="checkbox"
                 className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                 checked={formData.recaptcha}
                 onChange={handleInputChange}
               />
               <label htmlFor="recaptcha" className="ml-2 block text-sm text-gray-900 cursor-pointer select-none">
                 I'm not a robot (reCaptcha)
               </label>
               <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="recaptcha" className="ml-auto h-8 w-8 opacity-50" />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all"
              >
                {loading ? (
                  <RefreshCw className="animate-spin h-5 w-5" />
                ) : (
                  'Tiếp tục'
                )}
              </button>
            </div>
            
            <div className="text-center text-sm">
               <span className="text-gray-500">Đã có tài khoản? </span>
               <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                 Đăng nhập
               </Link>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
             <div className="rounded-md shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-1 text-center">Nhập mã OTP (6 số)</label>
                <input
                  name="otp"
                  type="text"
                  required
                  maxLength={6}
                  className="appearance-none rounded-lg relative block w-2/3 mx-auto px-3 py-3 border border-gray-300 placeholder-gray-300 text-gray-900 text-center text-2xl tracking-widest focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                />
             </div>
             
             <button
                type="submit"
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
              >
                Xác nhận
             </button>
             
             <div className="text-center mt-4">
               <button 
                 type="button"
                 onClick={() => setStep(1)} 
                 className="text-sm text-gray-500 hover:text-gray-700 underline"
               >
                 Quay lại bước trước
               </button>
             </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;