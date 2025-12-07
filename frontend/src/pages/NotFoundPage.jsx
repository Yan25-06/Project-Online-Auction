import { Link } from 'react-router-dom';
import { FileQuestion, ArrowRight } from 'lucide-react';

const NotFoundPage = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-fadeIn">
    <div className="bg-blue-50 p-6 rounded-full mb-6 relative">
        <FileQuestion size={48} className="text-blue-500" />
        <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
    </div>
    <h1 className="text-5xl font-bold text-gray-900 mb-2">404</h1>
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy trang</h2>
    <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
      Rất tiếc, trang bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc đường dẫn không chính xác.
      Vui lòng kiểm tra lại URL.
    </p>
    <div className="flex gap-4">
      <Link 
        to="/" 
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
      >
        <ArrowRight size={18} className="rotate-180" />
        Về trang chủ
      </Link>
    </div>
  </div>
);

export default NotFoundPage