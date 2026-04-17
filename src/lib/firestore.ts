import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';

export const collections = {
  admin: 'admin',
  siteSettings: 'siteSettings',
  services: 'services',
  projects: 'projects',
  blogPosts: 'blogPosts',
  contactMessages: 'contactMessages',
  socialLinks: 'socialLinks',
};

function buildAuditFields(isCreate: boolean): Record<string, unknown> {
  const user = auth.currentUser;
  const email = user?.email?.toLowerCase() || '';
  const displayName = user?.displayName?.trim() || '';
  const uid = user?.uid || '';

  const audit: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
    updatedBy: uid || null,
    updatedByEmail: email || null,
    updatedByName: displayName || null,
  };

  if (isCreate) {
    audit.createdAt = serverTimestamp();
    audit.createdBy = uid || null;
    audit.createdByEmail = email || null;
    audit.createdByName = displayName || null;
  }

  return audit;
}

export const addDocument = async <T>(collectionName: string, data: Partial<T>) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      ...buildAuditFields(true),
    });
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const updateDocument = async <T>(collectionName: string, id: string, data: Partial<T>) => {
  try {
    await updateDoc(doc(db, collectionName, id), {
      ...data,
      ...buildAuditFields(false),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    await updateDoc(doc(db, collectionName, id), {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      deletedBy: auth.currentUser?.uid || null,
      deletedByEmail: auth.currentUser?.email?.toLowerCase() || null,
      ...buildAuditFields(false),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const formatTimestamp = (timestamp: Timestamp | undefined): string => {
  if (!timestamp) return '';
  return timestamp.toDate().toLocaleDateString();
};
