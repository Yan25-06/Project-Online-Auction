import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, Gavel, Upload, X, DollarSign, Tag, 
  RefreshCw, Eye, ShieldCheck, AlertCircle , Home
} from 'lucide-react';
import ProductCard from "../components/product/ProductCard"; 
import { CategoryService, ProductService } from '../services/backendService';
import { useToast } from '../components/common/Toast';
import { Editor } from '@tinymce/tinymce-react';
import Header from '../components/common/Header';

const PostProductPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const toast = useToast();

  const user = JSON.parse(localStorage.getItem('user'));
  // State quản lý form
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    startingPrice: '',
    stepPrice: '',
    buyNowPrice: '',
    endsAt: '',
  });

  // State riêng cho Description (Quill) và Images
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]); // File object để gửi lên server
  const [previewImages, setPreviewImages] = useState([]); // URL blob để hiển thị preview

  // 1. Fetch Danh mục từ API khi vào trang
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await CategoryService.getAll();
        setCategories(res.data || res || []);
      } catch (err) {
        console.error("Lỗi lấy danh mục:", err);
      }
    };
    fetchCategories();
  }, []);

  // Xử lý thay đổi input text
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Xử lý chọn ảnh (Preview + Lưu file)
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Giới hạn tối đa 10 ảnh
    if (files.length + selectedFiles.length > 10) {
      toast.show("Bạn chỉ được đăng tối đa 10 ảnh.", { type: 'error' });
      return;
    }

    // Tạo URL preview
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));

    setFiles(prev => [...prev, ...selectedFiles]);
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  // Xóa ảnh đã chọn
  const removeImage = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  // Xử lý Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Validation: Ít nhất 3 ảnh
    if (files.length < 1) {
      setError('Vui lòng tải lên ít nhất 3 hình ảnh sản phẩm.');
      window.scrollTo(0, 0);
      return;
    }
    
    // 2. Validation: Thời gian kết thúc
    const endTime = new Date(formData.endsAt);
    if (endTime <= new Date()) {
      setError('Thời gian kết thúc phải lớn hơn thời gian hiện tại.');
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      if (user && user.id) {
        data.append('seller_id', user.id); 
      } else {
        throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      }
      data.append('name', formData.name);
      data.append('category_id', formData.categoryId);
      data.append('starting_price', formData.startingPrice);
      data.append('bid_increment', formData.stepPrice); 
      
      if (formData.buyNowPrice) {
        data.append('buy_now_price', formData.buyNowPrice);
      }
      
      data.append('ends_at', formData.endsAt);
      data.append('description', description); 

      files.forEach((file) => {
        data.append('image', file);
      });

      await ProductService.create(data);

      toast.show('Đăng sản phẩm thành công!', { type: 'success' });
      navigate('/seller/products');

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Có lỗi xảy ra khi đăng sản phẩm.');
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const previewProduct = useMemo(() => {
    return {
      id: 'preview',
      name: formData.name || 'Tên sản phẩm của bạn...',
      starting_price: formData.startingPrice || 0,
      current_price: formData.startingPrice || 0, // Mới đăng thì giá hiện tại = giá khởi điểm
      bid_increment: formData.stepPrice || 0,
      buy_now_price: formData.buyNowPrice || null,
      main_image_url: previewImages.length > 0 ? previewImages[0] : 'https://placehold.co/800?text=No%20Image&font=roboto',
      category_id: formData.categoryId,
      bid_count: 0,
      view_count: 0,
      ends_at: formData.endsAt || new Date(Date.now() + 86400000).toISOString(),
      created_at: new Date().toISOString()
    };
  }, [formData, previewImages]);

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="flex items-center hover:text-blue-600">
          <Home size={16} className="mr-1" />Trang chủ
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium">Đăng bán sản phẩm</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-2">
          
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 flex items-center gap-2">
              <AlertCircle size={20}/>
              <span>{error}</span>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-50/50 px-8 py-4 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Gavel className="text-blue-600" /> Đăng bán sản phẩm đấu giá
              </h1>
              <p className="text-sm text-gray-500 mt-1">Điền đầy đủ thông tin để sản phẩm được duyệt nhanh chóng.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              
              {/* Upload Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh sản phẩm (Ít nhất 3 ảnh) <span className="text-red-500">*</span></label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors bg-blue-50/20">
                  <input type="file" multiple onChange={handleImageChange} className="hidden" id="image-upload" accept="image/*" />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center">
                      <div className="bg-blue-100 p-3 rounded-full mb-3">
                         <Upload size={24} className="text-blue-600" />
                      </div>
                      <span className="text-blue-600 font-bold hover:underline">Tải ảnh lên</span>
                      <span className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP (Tối đa 5MB)</span>
                  </label>
                </div>
                
                {/* Image Previews */}
                {previewImages.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 mt-4">
                    {previewImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                        <img src={img} alt="preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                          <X size={14} />
                        </button>
                        {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[10px] text-center py-0.5">Ảnh bìa</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
                    <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-300 transition-all" placeholder="Ví dụ: iPhone 15 Pro Max 256GB..." />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục <span className="text-red-500">*</span></label>
                    <select required name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc <span className="text-red-500">*</span></label>
                    <input required type="datetime-local" name="endsAt" value={formData.endsAt} onChange={handleChange} className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-600" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá khởi điểm (VNĐ) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><DollarSign size={16}/></div>
                      <input required type="number" name="startingPrice" value={formData.startingPrice} onChange={handleChange} className="w-full rounded-lg border-gray-300 border pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="0" min="0" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bước giá (VNĐ) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Tag size={16}/></div>
                      <input required type="number" name="stepPrice" value={formData.stepPrice} onChange={handleChange} className="w-full rounded-lg border-gray-300 border pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ví dụ: 50000" min="0"/>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá mua ngay (Tùy chọn)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Tag size={16}/></div>
                      <input type="number" name="buyNowPrice" value={formData.buyNowPrice} onChange={handleChange} className="w-full rounded-lg border-gray-300 border pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Để trống nếu đấu giá thuần túy" min="0"/>
                    </div>
                </div>
              </div>

              {/* Description (TinyMCE Editor) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả chi tiết <span className="text-red-500">*</span>
                </label>
                <div className="rounded-lg overflow-hidden border border-gray-300">
                    <Editor
                        apiKey='jrit7sgj6m59zizasyrljk3egatqvw67jijmuc14itmnzdx6' 
                        value={description}
                        onEditorChange={(newValue, editor) => setDescription(newValue)}
                        init={{
                            height: 300,
                            menubar: false,
                            plugins: [
                                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                            ],
                            toolbar: 'undo redo | blocks | ' +
                                'bold italic forecolor | alignleft aligncenter ' +
                                'alignright alignjustify | bullist numlist outdent indent | ' +
                                'removeformat | help',
                            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                            placeholder: "Mô tả chi tiết về sản phẩm, tình trạng, xuất xứ..."
                        }}
                    />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => navigate('/')} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">Hủy bỏ</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-70 flex items-center gap-2">
                    {loading ? <RefreshCw className="animate-spin h-5 w-5" /> : 'Đăng bán ngay'}
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="lg:col-span-1">
           <div className="sticky top-24 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                 <div className="bg-yellow-100 p-2 rounded-full text-yellow-700 mt-0.5"><Eye size={18}/></div>
                 <div>
                    <h3 className="font-bold text-yellow-800 text-sm">Xem trước sản phẩm</h3>
                    <p className="text-xs text-yellow-700 mt-1">Đây là cách sản phẩm của bạn sẽ hiển thị trên sàn.</p>
                 </div>
              </div>

              {/* Live Preview Card */}
              {/* Scale xuống một chút để vừa vặn hơn ở cột phải */}
              <div className="pointer-events-none select-none origin-top transform scale-95"> 
                 <ProductCard product={previewProduct} />
              </div>

              {/* Seller Tips */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                 <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><ShieldCheck size={16} className="text-green-600"/> Mẹo bán hàng nhanh</h4>
                 <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                    <li>Chụp ảnh rõ nét, đầy đủ các góc cạnh.</li>
                    <li>Mô tả chi tiết tình trạng trầy xước (nếu có).</li>
                    <li>Đặt giá khởi điểm hấp dẫn để thu hút bid.</li>
                    <li>Bước giá hợp lý giúp cuộc đấu giá sôi động hơn.</li>
                 </ul>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PostProductPage;