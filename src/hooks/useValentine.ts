import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface Photo {
  id: string;
  url: string;
  caption: string;
  uploadedAt: Date;
}

export interface Reaction {
  type: 'love' | 'emotional' | 'cute';
  timestamp: Date;
}

export interface AIIllustration {
  scene: 'proposal' | 'date' | 'stars';
  mood: 'cute' | 'emotional' | 'magical';
  colorTheme: 'pink' | 'lavender' | 'gold';
  imageUrl?: string;
}

export interface Valentine {
  id: string;
  creatorId: string;
  creatorEmail: string;
  viewerEmail: string;
  photos: Photo[];
  loveMessage: string;
  showLoveMessage: boolean;
  aiIllustration: AIIllustration | null;
  autoExpiry: boolean;
  expiryDate: Date;
  createdAt: Date;
  reactions: Reaction[];
}

export const useValentine = () => {
  const { valentineId, role, user } = useAuth();
  const [valentine, setValentine] = useState<Valentine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!valentineId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'valentines', valentineId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setValentine({
            id: doc.id,
            ...data,
            expiryDate: data.expiryDate?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            photos: data.photos || [],
            reactions: data.reactions || []
          } as Valentine);
        } else {
          setValentine(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching valentine:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [valentineId]);

  const uploadPhoto = async (file: File, caption: string) => {
    if (!valentineId || !user) throw new Error('No valentine or user');

    const photoId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const storageRef = ref(storage, `valentines/${valentineId}/photos/${photoId}`);
    
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    const newPhoto: Photo = {
      id: photoId,
      url,
      caption,
      uploadedAt: new Date()
    };

    const currentPhotos = valentine?.photos || [];
    await updateDoc(doc(db, 'valentines', valentineId), {
      photos: [...currentPhotos, newPhoto]
    });

    return newPhoto;
  };

  const removePhoto = async (photoId: string) => {
    if (!valentineId || !valentine) return;

    try {
      const storageRef = ref(storage, `valentines/${valentineId}/photos/${photoId}`);
      await deleteObject(storageRef);
    } catch (e) {
      console.log('Photo might not exist in storage');
    }

    const updatedPhotos = valentine.photos.filter(p => p.id !== photoId);
    await updateDoc(doc(db, 'valentines', valentineId), {
      photos: updatedPhotos
    });
  };

  const updateLoveMessage = async (message: string, show: boolean) => {
    if (!valentineId) return;

    await updateDoc(doc(db, 'valentines', valentineId), {
      loveMessage: message,
      showLoveMessage: show
    });
  };

  const updateViewerEmail = async (email: string) => {
    if (!valentineId) return;

    await updateDoc(doc(db, 'valentines', valentineId), {
      viewerEmail: email
    });
  };

  const updateAIIllustration = async (illustration: AIIllustration | null) => {
    if (!valentineId) return;

    await updateDoc(doc(db, 'valentines', valentineId), {
      aiIllustration: illustration
    });
  };

  const addReaction = async (type: Reaction['type']) => {
    if (!valentineId || !valentine) return;

    const newReaction: Reaction = {
      type,
      timestamp: new Date()
    };

    await updateDoc(doc(db, 'valentines', valentineId), {
      reactions: [...valentine.reactions, newReaction]
    });
  };

  const deleteValentine = async () => {
    if (!valentineId) return;

    // Delete all photos from storage
    if (valentine?.photos) {
      for (const photo of valentine.photos) {
        try {
          const storageRef = ref(storage, `valentines/${valentineId}/photos/${photo.id}`);
          await deleteObject(storageRef);
        } catch (e) {
          console.log('Photo might not exist');
        }
      }
    }

    // Delete the document
    await deleteDoc(doc(db, 'valentines', valentineId));
  };

  return {
    valentine,
    loading,
    error,
    uploadPhoto,
    removePhoto,
    updateLoveMessage,
    updateViewerEmail,
    updateAIIllustration,
    addReaction,
    deleteValentine
  };
};

// Hook to find Valentine for viewer
export const useFindValentineForViewer = () => {
  const [valentine, setValentine] = useState<Valentine | null>(null);
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(false);

  useEffect(() => {
    const findValentine = async () => {
      if (!auth.currentUser?.email) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'valentines'),
          where('viewerEmail', '==', auth.currentUser.email)
        );
        const docs = await getDocs(q);

        if (!docs.empty) {
          const data = docs.docs[0].data();
          setValentine({
            id: docs.docs[0].id,
            ...data,
            expiryDate: data.expiryDate?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
          } as Valentine);
          setExists(true);
        } else {
          setExists(false);
        }
      } catch (err) {
        console.error('Error finding valentine:', err);
      }
      setLoading(false);
    };

    findValentine();
  }, []);

  return { valentine, loading, exists };
};
