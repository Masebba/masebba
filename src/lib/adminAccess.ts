// src/lib/adminAccess.ts
import { User as FirebaseUser } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { collections } from "./firestore";

interface AdminRecord {
  uid?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  isAdmin?: boolean;
}

function isAllowedAdminRecord(data: AdminRecord): boolean {
  if (data.isActive === false) return false;

  return (
    data.isAdmin === true || data.role === "admin" || data.role === "superadmin"
  );
}

export async function hasAdminAccess(
  user: FirebaseUser | null,
): Promise<boolean> {
  if (!user?.email) return false;

  const email = user.email.toLowerCase();
  const adminCol = collections.admin;

  const docCandidates = [user.uid, user.email, email].filter(
    Boolean,
  ) as string[];

  for (const id of docCandidates) {
    const snap = await getDoc(doc(db, adminCol, id));
    if (snap.exists()) {
      const data = snap.data() as AdminRecord;
      if (isAllowedAdminRecord(data)) return true;
    }
  }

  const snap = await getDocs(
    query(collection(db, adminCol), where("email", "==", email), limit(1)),
  );

  for (const docSnap of snap.docs) {
    const data = docSnap.data() as AdminRecord;
    if (isAllowedAdminRecord(data)) return true;
  }

  return false;
}
