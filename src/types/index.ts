/** الأنواع الأساسية للمنصة */

export type Role = "USER" | "MODERATOR" | "ADMIN";

export type ServiceStatus = "ACTIVE" | "HIDDEN" | "SUSPENDED";

export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID";

export type ReportStatus = "PENDING" | "REVIEWED" | "RESOLVED";

/** المستخدم */
export interface User {
  id: string;
  name: string;
  username: string;
  phone: string;
  email?: string | null;
  avatar?: string | null;
  bio?: string | null;
  city?: string | null;
  role: Role;
  isVerified: boolean;
  isBlocked: boolean;
  rating: number;
  totalRatings: number;
  createdAt: Date;
  updatedAt: Date;
}

/** تصنيف الخدمة */
export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

/** المنطقة */
export interface Region {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  order: number;
  cities: City[];
}

/** المدينة */
export interface City {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  regionId: string;
}

/** صورة الخدمة */
export interface ServiceImage {
  id: string;
  url: string;
  publicId: string;
  width: number;
  height: number;
  sizeKb: number;
  order: number;
  serviceId: string;
}

/** الخدمة */
export interface Service {
  id: string;
  title: string;
  description: string;
  suggestedNote?: string | null;
  status: ServiceStatus;
  views: number;
  deliveryTime?: string | null;
  tags: string[];
  categoryId: string;
  category?: ServiceCategory;
  providerId: string;
  provider?: User;
  regionId: string;
  region?: Region;
  cityId: string;
  city?: City;
  images: ServiceImage[];
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    bookings: number;
    ratings: number;
    favoritedBy: number;
  };
  averageRating?: number;
}

/** الحجز */
export interface Booking {
  id: string;
  status: BookingStatus;
  notes?: string | null;
  serviceFee: number;
  paymentStatus: PaymentStatus;
  paymentRef?: string | null;
  canRate: boolean;
  serviceId: string;
  service?: Service;
  clientId: string;
  client?: User;
  rating?: Rating | null;
  createdAt: Date;
  updatedAt: Date;
}

/** التقييم */
export interface Rating {
  id: string;
  score: number;
  comment?: string | null;
  bookingId: string;
  raterId: string;
  rater?: User;
  providerId: string;
  provider?: User;
  serviceId: string;
  service?: Service;
  createdAt: Date;
}

/** الرسالة */
export interface Message {
  id: string;
  content: string;
  isRead: boolean;
  senderId: string;
  sender?: User;
  receiverId: string;
  receiver?: User;
  serviceId?: string | null;
  service?: Service | null;
  createdAt: Date;
}

/** البلاغ */
export interface Report {
  id: string;
  reason: string;
  description?: string | null;
  status: ReportStatus;
  reporterId: string;
  reporter?: User;
  serviceId: string;
  service?: Service;
  createdAt: Date;
}

/** الإعداد */
export interface Setting {
  id: string;
  key: string;
  value: string;
  updatedAt: Date;
}

/** استجابة API */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Pagination */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}
