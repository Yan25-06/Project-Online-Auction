// Shared types for Online Auction Platform

export enum UserRole {
  GUEST = 'guest',
  BIDDER = 'bidder',
  SELLER = 'seller',
  ADMIN = 'admin'
}

export enum AuctionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  ENDED = 'ended',
  CANCELLED = 'cancelled'
}

export enum BidStatus {
  ACTIVE = 'active',
  OUTBID = 'outbid',
  WON = 'won',
  REJECTED = 'rejected'
}

export enum RatingType {
  POSITIVE = 1,
  NEGATIVE = -1
}

export enum TransactionStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum UpgradeRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// ==================== Database Entity Types ====================

// User Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  address?: string;
  date_of_birth?: Date;
  role: 'bidder' | 'seller' | 'admin';
  rating_score?: number;
  positive_ratings: number;
  total_ratings: number;
  upgrade_requested: boolean;
  upgrade_requested_at?: Date;
  upgrade_rejected_at?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  parent_id?: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
}

// Product Types
export interface Product {
  id: string;
  seller_id: string;
  category_id: string;
  name: string;
  description?: string;
  starting_price: number;
  current_price: number;
  bid_increment: number;
  buy_now_price?: number;
  main_image_url: string;
  ends_at: Date;
  status: 'active' | 'ended' | 'sold' | 'cancelled';
  is_auto_extend: boolean;
  auto_extend_minutes: number;
  bid_count: number;
  view_count: number;
  watch_count: number;
  listed_at: Date;
  created_at: Date;
  updated_at: Date;
}

// Product Image Types
export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  image_order: number;
  created_at: Date;
}

// Product Description Types
export interface ProductDescription {
  id: string;
  product_id: string;
  description_text: string;
  description_order: number;
  created_at: Date;
}

// Bid Types
export interface Bid {
  id: string;
  product_id: string;
  bidder_id: string;
  bid_amount: number;
  max_bid_amount?: number;
  is_auto_bid: boolean;
  is_rejected: boolean;
  created_at: Date;
}

// Watchlist Types
export interface WatchlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: Date;
}

// Question Types
export interface Question {
  id: string;
  product_id: string;
  user_id: string;
  question_text: string;
  is_answered: boolean;
  created_at: Date;
}

// Answer Types
export interface Answer {
  id: string;
  question_id: string;
  seller_id: string;
  answer_text: string;
  created_at: Date;
}

// Rating Types
export interface Rating {
  id: string;
  order_id: string;
  rated_user_id: string;
  rating_user_id: string;
  score: 'positive' | 'negative';
  feedback?: string;
  created_at: Date;
  updated_at: Date;
}

// Order Types
export interface Order {
  id: string;
  product_id: string;
  seller_id: string;
  winner_id: string;
  final_price: number;
  status: 'pending_payment' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'completed';
  shipping_address?: string;
  payment_proof_url?: string;
  shipping_proof_url?: string;
  seller_rating?: number;
  buyer_rating?: number;
  seller_feedback?: string;
  buyer_feedback?: string;
  cancelled_by?: 'seller' | 'buyer';
  cancellation_reason?: string;
  created_at: Date;
  updated_at: Date;
}

// Blocked Bidder Types
export interface BlockedBidder {
  id: string;
  product_id: string;
  bidder_id: string;
  seller_id: string;
  reason?: string;
  created_at: Date;
}

// ==================== Extended/Joined Types ====================

// Product with relations
export interface ProductWithDetails extends Product {
  seller: User;
  category: Category;
  product_images: ProductImage[];
  product_descriptions: ProductDescription[];
}

// Bid with relations
export interface BidWithUser extends Bid {
  bidder: Partial<User>;
}

// Bid history item (masked)
export interface BidHistoryItem {
  id: string;
  bid_amount: number;
  created_at: Date;
  bidder_name: string;
}

// Question with relations
export interface QuestionWithDetails extends Question {
  user: Partial<User>;
  product?: Partial<Product>;
  answers: AnswerWithSeller[];
}

// Answer with seller
export interface AnswerWithSeller extends Answer {
  seller: Partial<User>;
}

// Rating with relations
export interface RatingWithDetails extends Rating {
  rater: Partial<User>;
  order: {
    id: string;
    product: Partial<Product>;
  };
}

// Order with relations
export interface OrderWithDetails extends Order {
  product: Product;
  seller: User;
  winner: User;
}

// Watchlist with product details
export interface WatchlistWithProduct extends WatchlistItem {
  product: ProductWithSellerAndCategory;
}

// Product with seller and category
export interface ProductWithSellerAndCategory extends Product {
  seller: Partial<User>;
  category: Partial<Category>;
}

// Category with subcategories
export interface CategoryHierarchy extends Category {
  subcategories: Category[];
}

// ==================== Input Types ====================

export interface CreateUserInput {
  email: string;
  full_name: string;
  address?: string;
  date_of_birth?: Date;
}

export interface UpdateUserInput {
  full_name?: string;
  address?: string;
  date_of_birth?: Date;
}

export interface CreateCategoryInput {
  name: string;
  parent_id?: string;
  description?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
}

export interface CreateProductInput {
  seller_id: string;
  category_id: string;
  name: string;
  description?: string;
  starting_price: number;
  bid_increment: number;
  buy_now_price?: number;
  main_image_url: string;
  ends_at: Date;
  is_auto_extend?: boolean;
}

export interface UpdateProductInput {
  description?: string;
  buy_now_price?: number;
}

export interface CreateBidInput {
  product_id: string;
  bidder_id: string;
  bid_amount: number;
  max_bid_amount?: number;
  is_auto_bid?: boolean;
}

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== Search & Filter Types ====================

export interface ProductSearchParams {
  query?: string;
  category_id?: string;
  sort_by?: 'end_time_desc' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}
