// Helper function to mask name: "Nguyễn Văn Khoa" -> "****Khoa"
export const maskName = (name: string): string => {
  if (!name) return "****";
  
  const str = name.trim();
  const parts = str.split(" ");
  
  // Lấy phần cuối cùng của tên (tên gọi)
  const lastName = parts[parts.length - 1];
  
  return `****${lastName}`;
};
