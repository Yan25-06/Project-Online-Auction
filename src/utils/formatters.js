// Format tiền VNĐ
export const formatCurrency = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Logic hiển thị thời gian tương đối
export const formatTimeRelative = (seconds) => {
  if (seconds < 60) return `${seconds} giây`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ`;
  return `${Math.floor(seconds / 86400)} ngày`;
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