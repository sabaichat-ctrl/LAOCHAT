import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { getUserProfile, createOrUpdateUserProfile } from '../firebase/services';
import { UserProfile } from '../types';
import { INITIAL_CREATORS } from '../data/mockSeedData';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loginAsDemoUser: (creatorId: string) => void;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isAdmin: false,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  loginAsDemoUser: () => {},
  updateProfileData: async () => {},
});

const ADMIN_EMAILS = ['sabaichatai@gmail.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Check admin privileges against email and admins collection
  const checkAdminStatus = async (currentUser: User | null, profileRole?: string) => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }
    if (currentUser.email && ADMIN_EMAILS.includes(currentUser.email.toLowerCase())) {
      setIsAdmin(true);
      return;
    }
    if (profileRole === 'admin') {
      setIsAdmin(true);
      return;
    }
    try {
      const adminSnap = await getDoc(doc(db, 'admins', currentUser.uid));
      if (adminSnap.exists()) {
        setIsAdmin(true);
        return;
      }
    } catch {
      // not admin
    }
    setIsAdmin(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          let profile = await getUserProfile(currentUser.uid);
          if (!profile) {
            // New user registration flow
            const cleanHandle = (currentUser.displayName || currentUser.email?.split('@')[0] || 'user')
              .toLowerCase()
              .replace(/[^a-zA-Z0-9_]/g, '_')
              .slice(0, 30);

            const isDefaultAdmin = currentUser.email && ADMIN_EMAILS.includes(currentUser.email.toLowerCase());

            profile = {
              id: currentUser.uid,
              displayName: currentUser.displayName || 'ຜູ້ໃຊ້ງານ LAOCHAT',
              handle: cleanHandle,
              email: currentUser.email || '',
              avatarUrl:
                currentUser.photoURL ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`,
              bio: 'ສະບາຍດີ! ຍິນດີຕ້ອນຮັບສູ່ LAOCHAT 🇱🇦',
              role: isDefaultAdmin ? 'admin' : 'creator',
              isVerifiedCreator: isDefaultAdmin ? true : false,
              followersCount: 0,
              followingCount: 0,
              postsCount: 0,
              createdAt: new Date().toISOString(),
            };
            await createOrUpdateUserProfile(profile);
          }
          setUserProfile(profile);
          await checkAdminStatus(currentUser, profile.role);
        } catch (e) {
          console.error('Error fetching user profile:', e);
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      // If popup was blocked or closed, notify user
      if (error?.code !== 'auth/popup-closed-by-user') {
        alert('ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບ: ' + (error?.message || 'ກະລຸນາລອງໃໝ່'));
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  // Demo creator login helper for instant testing
  const loginAsDemoUser = (creatorId: string) => {
    const creator = INITIAL_CREATORS.find((c) => c.id === creatorId);
    if (creator) {
      setUserProfile(creator);
      setUser({
        uid: creator.id,
        displayName: creator.displayName,
        email: `${creator.handle}@laochat.la`,
        photoURL: creator.avatarUrl,
      } as any);
      setIsAdmin(false);
    }
  };

  const updateProfileData = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...updates };
    setUserProfile(updated);
    await createOrUpdateUserProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        loading,
        signInWithGoogle,
        signOut,
        loginAsDemoUser,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
