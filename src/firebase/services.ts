import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './errorHandler';
import {
  Post,
  UserProfile,
  Comment,
  Advertisement,
  CreatorEarnings,
  PayoutRequest,
  ContentReport,
} from '../types';
import { INITIAL_POSTS, INITIAL_SPONSOR_ADS, INITIAL_CREATORS } from '../data/mockSeedData';

// --- Users Service ---

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path, auth.currentUser);
  }
}

export async function createOrUpdateUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.id}`;
  try {
    await setDoc(doc(db, 'users', profile.id), profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, auth.currentUser);
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, path));
    const users: UserProfile[] = [];
    snap.forEach((d) => users.push(d.data() as UserProfile));
    return users;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path, auth.currentUser);
  }
}

export async function setCreatorVerified(userId: string, isVerified: boolean): Promise<void> {
  const path = `users/${userId}`;
  try {
    await updateDoc(doc(db, 'users', userId), {
      isVerifiedCreator: isVerified,
      role: isVerified ? 'creator' : 'user',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path, auth.currentUser);
  }
}

// --- Posts Service ---

export async function getPosts(filter?: {
  category?: string;
  type?: string;
  authorId?: string;
  searchQuery?: string;
}): Promise<Post[]> {
  const path = 'posts';
  try {
    const postsRef = collection(db, path);
    const snap = await getDocs(postsRef);
    let posts: Post[] = [];
    snap.forEach((d) => {
      posts.push(d.data() as Post);
    });

    // If Firestore has no posts yet, fall back to initial seeded items
    if (posts.length === 0) {
      posts = [...INITIAL_POSTS];
    }

    // Filter in-memory for flexible combination
    if (filter?.category && filter.category !== 'all') {
      if (filter.category === 'video') {
        posts = posts.filter((p) => p.type === 'video');
      } else if (filter.category === 'photo') {
        posts = posts.filter((p) => p.type === 'image');
      } else if (filter.category === 'article') {
        posts = posts.filter((p) => p.type === 'article');
      } else {
        // match category label
        const catMap: Record<string, string> = {
          news: 'ຂ່າວສານ & ເຫດການ',
          food_travel: 'ອາຫານ & ທ່ອງທ່ຽວ',
          entertainment: 'ບັນເທີງ & ດົນຕີ',
          tech_business: 'ທຸລະກິດ & ໄອທີ',
          education: 'ສຶກສາ & ຄວາມຮູ້',
          lifestyle: 'ຊີວິດປະຈຳວັນ',
        };
        const targetCategory = catMap[filter.category] || filter.category;
        posts = posts.filter((p) => p.category.includes(targetCategory) || targetCategory.includes(p.category));
      }
    }

    if (filter?.type) {
      posts = posts.filter((p) => p.type === filter.type);
    }

    if (filter?.authorId) {
      posts = posts.filter((p) => p.authorId === filter.authorId);
    }

    if (filter?.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase().trim();
      posts = posts.filter(
        (p) =>
          p.content.toLowerCase().includes(q) ||
          (p.title && p.title.toLowerCase().includes(q)) ||
          p.authorName.toLowerCase().includes(q) ||
          p.authorHandle.toLowerCase().includes(q) ||
          (p.tags && p.tags.toLowerCase().includes(q))
      );
    }

    // Sort by createdAt descending
    posts.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return posts;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path, auth.currentUser);
  }
}

export async function createPost(post: Post): Promise<void> {
  const path = `posts/${post.id}`;
  try {
    await setDoc(doc(db, 'posts', post.id), post);

    // Increment user's postsCount
    try {
      await updateDoc(doc(db, 'users', post.authorId), {
        postsCount: increment(1),
      });
    } catch {
      // ignore if user doc not yet created
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path, auth.currentUser);
  }
}

export async function deletePost(postId: string, authorId: string): Promise<void> {
  const path = `posts/${postId}`;
  try {
    await deleteDoc(doc(db, 'posts', postId));
    try {
      await updateDoc(doc(db, 'users', authorId), {
        postsCount: increment(-1),
      });
    } catch {
      // ignore
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path, auth.currentUser);
  }
}

export async function trackPostView(postId: string, creatorId: string): Promise<void> {
  const path = `posts/${postId}`;
  try {
    // Increment post views
    await updateDoc(doc(db, 'posts', postId), {
      viewsCount: increment(1),
    });

    // Record viewEvent
    const viewId = `view_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await setDoc(doc(db, 'viewEvents', viewId), {
      id: viewId,
      postId,
      creatorId,
      viewerId: auth.currentUser?.uid || 'anonymous',
      durationSeconds: 5,
      createdAt: new Date().toISOString(),
    });
  } catch {
    // Fail gracefully for view tracking
  }
}

// --- Likes Service ---

export async function toggleLike(postId: string, userId: string): Promise<boolean> {
  const likeId = `${postId}_${userId}`;
  const path = `likes/${likeId}`;
  try {
    const likeRef = doc(db, 'likes', likeId);
    const snap = await getDoc(likeRef);
    const postRef = doc(db, 'posts', postId);

    if (snap.exists()) {
      // Remove like
      await deleteDoc(likeRef);
      await updateDoc(postRef, { likesCount: increment(-1) });
      return false;
    } else {
      // Add like
      await setDoc(likeRef, {
        id: likeId,
        postId,
        userId,
        createdAt: new Date().toISOString(),
      });
      await updateDoc(postRef, { likesCount: increment(1) });
      return true;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, auth.currentUser);
  }
}

export async function checkUserLiked(postId: string, userId: string): Promise<boolean> {
  const likeId = `${postId}_${userId}`;
  const path = `likes/${likeId}`;
  try {
    const snap = await getDoc(doc(db, 'likes', likeId));
    return snap.exists();
  } catch {
    return false;
  }
}

// --- Follows Service ---

export async function toggleFollow(followerId: string, creatorId: string): Promise<boolean> {
  const followId = `${followerId}_${creatorId}`;
  const path = `follows/${followId}`;
  try {
    const followRef = doc(db, 'follows', followId);
    const snap = await getDoc(followRef);

    if (snap.exists()) {
      await deleteDoc(followRef);
      // Decrement creator followers & user following
      await updateDoc(doc(db, 'users', creatorId), { followersCount: increment(-1) }).catch(() => {});
      await updateDoc(doc(db, 'users', followerId), { followingCount: increment(-1) }).catch(() => {});
      return false;
    } else {
      await setDoc(followRef, {
        id: followId,
        followerId,
        creatorId,
        createdAt: new Date().toISOString(),
      });
      await updateDoc(doc(db, 'users', creatorId), { followersCount: increment(1) }).catch(() => {});
      await updateDoc(doc(db, 'users', followerId), { followingCount: increment(1) }).catch(() => {});
      return true;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, auth.currentUser);
  }
}

export async function checkUserFollowing(followerId: string, creatorId: string): Promise<boolean> {
  const followId = `${followerId}_${creatorId}`;
  try {
    const snap = await getDoc(doc(db, 'follows', followId));
    return snap.exists();
  } catch {
    return false;
  }
}

// --- Comments Service ---

export async function getComments(postId: string): Promise<Comment[]> {
  const path = 'comments';
  try {
    const q = query(collection(db, path), where('postId', '==', postId));
    const snap = await getDocs(q);
    const comments: Comment[] = [];
    snap.forEach((d) => comments.push(d.data() as Comment));
    comments.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tA - tB;
    });
    return comments;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path, auth.currentUser);
  }
}

export async function addComment(comment: Comment): Promise<void> {
  const path = `comments/${comment.id}`;
  try {
    await setDoc(doc(db, 'comments', comment.id), comment);
    await updateDoc(doc(db, 'posts', comment.postId), {
      commentsCount: increment(1),
    }).catch(() => {});
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path, auth.currentUser);
  }
}

export async function deleteComment(commentId: string, postId: string): Promise<void> {
  const path = `comments/${commentId}`;
  try {
    await deleteDoc(doc(db, 'comments', commentId));
    await updateDoc(doc(db, 'posts', postId), {
      commentsCount: increment(-1),
    }).catch(() => {});
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path, auth.currentUser);
  }
}

// --- Advertisements Service ---

export async function getAdvertisements(): Promise<Advertisement[]> {
  const path = 'advertisements';
  try {
    const snap = await getDocs(collection(db, path));
    const ads: Advertisement[] = [];
    snap.forEach((d) => ads.push(d.data() as Advertisement));
    if (ads.length === 0) {
      return INITIAL_SPONSOR_ADS;
    }
    return ads.filter((a) => a.status === 'active');
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path, auth.currentUser);
  }
}

export async function saveAdvertisement(ad: Advertisement): Promise<void> {
  const path = `advertisements/${ad.id}`;
  try {
    await setDoc(doc(db, 'advertisements', ad.id), ad, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, auth.currentUser);
  }
}

export async function trackAdImpression(adId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'advertisements', adId), {
      impressionsCount: increment(1),
    });
  } catch {
    // ignore
  }
}

export async function trackAdClick(adId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'advertisements', adId), {
      clicksCount: increment(1),
    });
  } catch {
    // ignore
  }
}

// --- Creator Studio & Monetization Service ---

export async function getCreatorEarnings(creatorId: string): Promise<CreatorEarnings> {
  const path = `creatorEarnings/${creatorId}`;
  try {
    const snap = await getDoc(doc(db, 'creatorEarnings', creatorId));
    if (snap.exists()) {
      return snap.data() as CreatorEarnings;
    }

    // Default structure for new creators
    return {
      id: creatorId,
      creatorId,
      totalViews: 0,
      eligibleViews: 0,
      estimatedKip: 0,
      estimatedUsd: 0,
      balanceAvailableKip: 0,
      totalPaidOutKip: 0,
      isMonetized: false,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    // If permission or doesn't exist, provide safe default
    return {
      id: creatorId,
      creatorId,
      totalViews: 0,
      eligibleViews: 0,
      estimatedKip: 0,
      estimatedUsd: 0,
      balanceAvailableKip: 0,
      totalPaidOutKip: 0,
      isMonetized: false,
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function requestPayout(req: PayoutRequest): Promise<void> {
  const path = `payoutRequests/${req.id}`;
  try {
    await setDoc(doc(db, 'payoutRequests', req.id), req);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path, auth.currentUser);
  }
}

export async function getPayoutRequests(creatorId?: string): Promise<PayoutRequest[]> {
  const path = 'payoutRequests';
  try {
    let snap;
    if (creatorId) {
      const q = query(collection(db, path), where('creatorId', '==', creatorId));
      snap = await getDocs(q);
    } else {
      snap = await getDocs(collection(db, path));
    }
    const requests: PayoutRequest[] = [];
    snap.forEach((d) => requests.push(d.data() as PayoutRequest));
    requests.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });
    return requests;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path, auth.currentUser);
  }
}

export async function updatePayoutStatus(
  requestId: string,
  status: 'approved' | 'rejected',
  adminNotes?: string
): Promise<void> {
  const path = `payoutRequests/${requestId}`;
  try {
    await updateDoc(doc(db, 'payoutRequests', requestId), {
      status,
      adminNotes: adminNotes || '',
      reviewedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path, auth.currentUser);
  }
}

// --- Content Reports (Moderation) ---

export async function submitReport(report: ContentReport): Promise<void> {
  const path = `reports/${report.id}`;
  try {
    await setDoc(doc(db, 'reports', report.id), report);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path, auth.currentUser);
  }
}

export async function getReports(): Promise<ContentReport[]> {
  const path = 'reports';
  try {
    const snap = await getDocs(collection(db, path));
    const reports: ContentReport[] = [];
    snap.forEach((d) => reports.push(d.data() as ContentReport));
    return reports;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path, auth.currentUser);
  }
}

export async function updateReportStatus(reportId: string, status: 'reviewed' | 'dismissed'): Promise<void> {
  const path = `reports/${reportId}`;
  try {
    await updateDoc(doc(db, 'reports', reportId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path, auth.currentUser);
  }
}

// --- Seeding Demo Data ---

export async function seedDemoData(): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Seed initial creators
    for (const c of INITIAL_CREATORS) {
      batch.set(doc(db, 'users', c.id), c);
      // Give initial earnings to show in creator studio
      batch.set(doc(db, 'creatorEarnings', c.id), {
        id: c.id,
        creatorId: c.id,
        creatorName: c.displayName,
        totalViews: 34500,
        eligibleViews: 28900,
        estimatedKip: 1850000,
        estimatedUsd: 85,
        balanceAvailableKip: 1200000,
        totalPaidOutKip: 650000,
        isMonetized: true,
        updatedAt: new Date().toISOString(),
      });
    }

    // Seed posts
    for (const p of INITIAL_POSTS) {
      batch.set(doc(db, 'posts', p.id), p);
    }

    // Seed ads
    for (const a of INITIAL_SPONSOR_ADS) {
      batch.set(doc(db, 'advertisements', a.id), a);
    }

    await batch.commit();
  } catch (error) {
    console.warn('Initial seeding note:', error);
  }
}
