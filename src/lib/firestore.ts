import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export const collections = {
  admin: "admin",
  siteSettings: "siteSettings",
  services: "services",
  projects: "projects",
  blogPosts: "blogPosts",
  contactMessages: "contactMessages",
  socialLinks: "socialLinks",
};

export const addDocument = async <T>(
  collectionName: string,
  data: Partial<T>,
) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const updateDocument = async <T>(
  collectionName: string,
  id: string,
  data: Partial<T>,
) => {
  try {
    await updateDoc(doc(db, collectionName, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const formatTimestamp = (timestamp: Timestamp | undefined): string => {
  if (!timestamp) return "";
  return timestamp.toDate().toLocaleDateString();
};
