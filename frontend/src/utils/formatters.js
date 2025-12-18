// Format tiền VNĐ
export const formatCurrency = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export const maskName = (name) => {
  if (!name) return "Người dùng";
  
  const str = name.trim();
  
  // Nếu tên quá ngắn (ví dụ: "An") -> "A*"
  if (str.length <= 2) {
    return str[0] + "*";
  }

  // Nếu tên ngắn vừa (3-4 ký tự) -> "Kh**"
  if (str.length <= 4) {
    return str.substring(0, 2) + "**";
  }

  // Tên dài: Giữ 2 ký tự đầu + "***" + 2 ký tự cuối
  const firstChars = str.substring(0, 2);
  const lastChars = str.substring(str.length - 2);
  
  return `${firstChars}****${lastChars}`;
};

export const formatTimeRelative = (dateString) => {
  if (!dateString) return '';

  const now = new Date();
  const endDate = new Date(dateString);
  const diff = endDate - now; // Tính khoảng cách millisecond

  // Nếu đã quá hạn
  if (diff <= 0) {
    return 'Đã kết thúc';
  }

  // Quy đổi ra đơn vị thời gian
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `Còn ${days} ngày ${hours} giờ`;
  }
  if (hours > 0) {
    return `Còn ${hours} giờ ${minutes} phút`;
  }
  return `Còn ${minutes} phút`;
};

// Kiểm tra sản phẩm mới
export const isProductNew = (createdAt, minutes = 30) => {
  if (!createdAt) return false;
  return new Date() - new Date(createdAt) < minutes * 60 * 1000;
};

export const formatPostDate = (timestamp) => {
  return new Date(timestamp).toLocaleString('vi-VN', { 
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' 
  });
};

// Hàm mới: Format thời gian kết thúc tương đối (< 3 ngày)
export const formatEndTime = (secondsLeft) => {
  const threeDaysInSeconds = 3 * 24 * 60 * 60;
  if (secondsLeft <= threeDaysInSeconds) {
    if (secondsLeft < 60) return `Còn ${secondsLeft} giây nữa`;
    const minutes = Math.floor(secondsLeft / 60);
    if (minutes < 60) return `Còn ${minutes} phút nữa`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Còn ${hours} giờ ${minutes % 60} phút nữa`;
    const days = Math.floor(hours / 24);
    return `Còn ${days} ngày ${hours % 24} giờ nữa`;
  } else {
    // Nếu > 3 ngày, hiển thị ngày cụ thể
    const endDate = new Date(Date.now() + secondsLeft * 1000);
    return endDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
};