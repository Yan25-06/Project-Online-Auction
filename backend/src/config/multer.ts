import multer from 'multer';

// Cấu hình lưu trữ vào bộ nhớ (RAM) để lấy được file.buffer
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB mỗi ảnh
  }
});

export default upload;