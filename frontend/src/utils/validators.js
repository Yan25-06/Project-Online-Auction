// ===== VALIDATORS.JS =====
// Custom validation functions (không dùng HTML5 validation)

/**
 * Kiểm tra email hợp lệ
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Kiểm tra mật khẩu đủ mạnh (ít nhất 6 ký tự)
 */
export const isValidPassword = (password, minLength = 6) => {
  return password && password.length >= minLength;
};

/**
 * Kiểm tra trường không rỗng
 */
export const isNotEmpty = (value) => {
  return value && value.toString().trim().length > 0;
};

/**
 * Kiểm tra số dương
 */
export const isPositiveNumber = (value) => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

/**
 * Kiểm tra số không âm
 */
export const isNonNegativeNumber = (value) => {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
};

/**
 * Kiểm tra OTP (6 chữ số)
 */
export const isValidOtp = (otp) => {
  return /^\d{6}$/.test(otp);
};

/**
 * Kiểm tra ngày trong tương lai
 */
export const isFutureDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date > new Date();
};

/**
 * Kiểm tra số điện thoại Việt Nam
 */
export const isValidPhone = (phone) => {
  const regex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
  return regex.test(phone);
};

// ===== FORM VALIDATORS =====

/**
 * Validate form đăng nhập
 */
export const validateLoginForm = (formData) => {
  const errors = {};

  if (!isNotEmpty(formData.email)) {
    errors.email = 'Email không được để trống';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Email không đúng định dạng';
  }

  if (!isNotEmpty(formData.password)) {
    errors.password = 'Mật khẩu không được để trống';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate form đăng ký
 */
export const validateRegisterForm = (formData) => {
  const errors = {};

  if (!isNotEmpty(formData.full_name)) {
    errors.full_name = 'Họ và tên không được để trống';
  } else if (formData.full_name.trim().length < 2) {
    errors.full_name = 'Họ và tên phải có ít nhất 2 ký tự';
  }

  if (!isNotEmpty(formData.email)) {
    errors.email = 'Email không được để trống';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Email không đúng định dạng';
  }

  if (!isNotEmpty(formData.address)) {
    errors.address = 'Địa chỉ không được để trống';
  }

  if (!isNotEmpty(formData.password)) {
    errors.password = 'Mật khẩu không được để trống';
  } else if (!isValidPassword(formData.password)) {
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
  }

  if (!isNotEmpty(formData.confirmPassword)) {
    errors.confirmPassword = 'Vui lòng nhập lại mật khẩu';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Mật khẩu nhập lại không khớp';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate OTP
 */
export const validateOtp = (otp) => {
  const errors = {};

  if (!isNotEmpty(otp)) {
    errors.otp = 'Vui lòng nhập mã OTP';
  } else if (!isValidOtp(otp)) {
    errors.otp = 'Mã OTP phải là 6 chữ số';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate form quên mật khẩu - bước nhập email
 */
export const validateForgotPasswordEmail = (email) => {
  const errors = {};

  if (!isNotEmpty(email)) {
    errors.email = 'Email không được để trống';
  } else if (!isValidEmail(email)) {
    errors.email = 'Email không đúng định dạng';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate form đặt lại mật khẩu
 */
export const validateResetPassword = (newPassword, confirmPassword) => {
  const errors = {};

  if (!isNotEmpty(newPassword)) {
    errors.newPassword = 'Mật khẩu mới không được để trống';
  } else if (!isValidPassword(newPassword)) {
    errors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
  }

  if (!isNotEmpty(confirmPassword)) {
    errors.confirmPassword = 'Vui lòng nhập lại mật khẩu';
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'Mật khẩu nhập lại không khớp';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate form đăng sản phẩm
 */
export const validateProductForm = (formData, mainImage, additionalImages) => {
  const errors = {};

  // Ảnh
  if (!mainImage) {
    errors.mainImage = 'Vui lòng tải lên ảnh chính cho sản phẩm';
  }

  if (!additionalImages || additionalImages.length < 3) {
    errors.additionalImages = 'Vui lòng tải lên ít nhất 3 ảnh phụ';
  }

  // Tên sản phẩm
  if (!isNotEmpty(formData.name)) {
    errors.name = 'Tên sản phẩm không được để trống';
  } else if (formData.name.trim().length < 10) {
    errors.name = 'Tên sản phẩm phải có ít nhất 10 ký tự';
  }

  // Danh mục
  if (!isNotEmpty(formData.categoryId)) {
    errors.categoryId = 'Vui lòng chọn danh mục';
  }

  // Thời gian kết thúc
  if (!isNotEmpty(formData.endsAt)) {
    errors.endsAt = 'Vui lòng chọn thời gian kết thúc';
  } else if (!isFutureDate(formData.endsAt)) {
    errors.endsAt = 'Thời gian kết thúc phải lớn hơn thời gian hiện tại';
  }

  // Giá khởi điểm
  if (!isNotEmpty(formData.startingPrice)) {
    errors.startingPrice = 'Giá khởi điểm không được để trống';
  } else if (!isPositiveNumber(formData.startingPrice)) {
    errors.startingPrice = 'Giá khởi điểm phải là số dương';
  }

  // Bước giá
  if (!isNotEmpty(formData.stepPrice)) {
    errors.stepPrice = 'Bước giá không được để trống';
  } else if (!isPositiveNumber(formData.stepPrice)) {
    errors.stepPrice = 'Bước giá phải là số dương';
  }

  // Giá mua ngay (tùy chọn)
  if (isNotEmpty(formData.buyNowPrice)) {
    if (!isPositiveNumber(formData.buyNowPrice)) {
      errors.buyNowPrice = 'Giá mua ngay phải là số dương';
    } else if (Number(formData.buyNowPrice) <= Number(formData.startingPrice)) {
      errors.buyNowPrice = 'Giá mua ngay phải lớn hơn giá khởi điểm';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate form cập nhật thông tin cá nhân
 */
export const validateProfileForm = (userData) => {
  const errors = {};

  if (!isNotEmpty(userData.full_name)) {
    errors.full_name = 'Họ và tên không được để trống';
  }

  if (!isNotEmpty(userData.email)) {
    errors.email = 'Email không được để trống';
  } else if (!isValidEmail(userData.email)) {
    errors.email = 'Email không đúng định dạng';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate form đổi mật khẩu
 */
export const validateChangePassword = (currentPassword, newPassword, confirmPassword) => {
  const errors = {};

  if (!isNotEmpty(currentPassword)) {
    errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
  }

  if (!isNotEmpty(newPassword)) {
    errors.newPassword = 'Mật khẩu mới không được để trống';
  } else if (!isValidPassword(newPassword)) {
    errors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
  }

  if (!isNotEmpty(confirmPassword)) {
    errors.confirmPassword = 'Vui lòng nhập lại mật khẩu mới';
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'Mật khẩu nhập lại không khớp';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
