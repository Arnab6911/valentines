import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export type UserRole = 'creator' | 'viewer' | null;

interface AuthContextType {
  user: User | null;
  role: UserRole;
  selectedRole: UserRole;
  setSelectedRole: (role: UserRole) => void;
  loading: boolean;
  valentineId: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, isCreator: boolean) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [valentineId, setValentineId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser && selectedRole) {
        // Determine role based on Valentine documents
        await determineUserRole(firebaseUser.uid);
      } else {
        setRole(null);
        setValentineId(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [selectedRole]);

  const determineUserRole = async (uid: string) => {
    try {
      // Check if user is a creator of any Valentine
      const creatorQuery = query(
        collection(db, 'valentines'),
        where('creatorId', '==', uid)
      );
      const creatorDocs = await getDocs(creatorQuery);
      
      if (!creatorDocs.empty && selectedRole === 'creator') {
        setRole('creator');
        setValentineId(creatorDocs.docs[0].id);
        return;
      }

      // Check if user is a viewer of any Valentine
      const viewerQuery = query(
        collection(db, 'valentines'),
        where('viewerEmail', '==', auth.currentUser?.email)
      );
      const viewerDocs = await getDocs(viewerQuery);
      
      if (!viewerDocs.empty && selectedRole === 'viewer') {
        setRole('viewer');
        setValentineId(viewerDocs.docs[0].id);
        return;
      }

      // If no existing Valentine, set role based on selection
      setRole(selectedRole);
      
    } catch (error) {
      console.error('Error determining role:', error);
      setRole(selectedRole);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await determineUserRole(result.user.uid);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, isCreator: boolean) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        createdAt: new Date(),
        isCreator
      });

      if (isCreator) {
        // Create initial Valentine document for creator
        const valentineRef = doc(collection(db, 'valentines'));
        await setDoc(valentineRef, {
          creatorId: result.user.uid,
          creatorEmail: email,
          viewerEmail: '',
          photos: [],
          loveMessage: '',
          showLoveMessage: false,
          aiIllustration: null,
          autoExpiry: true,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          reactions: []
        });
        setValentineId(valentineRef.id);
        setRole('creator');
      } else {
        setRole('viewer');
      }
      
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setRole(null);
    setSelectedRole(null);
    setValentineId(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      selectedRole,
      setSelectedRole,
      loading,
      valentineId,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};
