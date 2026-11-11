export type ContentType = 'video' | 'image' | 'text' | 'article';

export type UserRole = 'user' | 'creator' | 'admin';

export interface UserProfile {
  id: string;
  displayName: string;
  handle: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  role: UserRole;
  isVerifiedCreator: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt?: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  type: ContentType;
  title?: string;
  content: string;
  mediaUrl?: string;
  category: string;
  tags?: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  sharesCount: number;
  status: 'active' | 'hidden' | 'under_review';
  createdAt?: string;
  updatedAt?: string;
  readTimeMinutes?: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt?: string;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt?: string;
}

export interface Follow {
  id: string;
  followerId: string;
  creatorId: string;
  createdAt?: string;
}

export interface Advertisement {
  id: string;
  title: string;
  brandName: string;
  brandLogo?: string;
  description: string;
  mediaUrl?: string;
  targetUrl: string;
  status: 'active' | 'paused' | 'completed';
  impressionsCount: number;
  clicksCount: number;
  createdAt?: string;
}

export interface CreatorEarnings {
  id: string; // matches creatorId
  creatorId: string;
  creatorName?: string;
  totalViews: number;
  eligibleViews: number;
  estimatedKip: number; // LAK
  estimatedUsd: number; // USD
  balanceAvailableKip: number;
  totalPaidOutKip: number;
  isMonetized: boolean;
  updatedAt?: string;
}

export interface PayoutRequest {
  id: string;
  creatorId: string;
  creatorName: string;
  amountKip: number;
  paymentMethod: 'bcel_one' | 'ldb' | 'bank_transfer';
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt?: string;
  reviewedAt?: string;
}

export interface ContentReport {
  id: string;
  postId: string;
  postTitle?: string;
  reporterId: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt?: string;
}

export interface CategoryInfo {
  id: string;
  labelLao: string;
  labelEn: string;
  icon: string;
  color: string;
}
