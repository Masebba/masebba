import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { collections, updateDocument, deleteDocument } from "../firestore";
import { ContactMessage } from "../../types";

type ContactMessageInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

function stripHtml(input: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input || "", "text/html");
  return (doc.body.textContent || "").trim();
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown): string {
  return cleanText(value).toLowerCase();
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function toMillis(value: unknown): number {
  if (!value) return 0;

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  if (
    typeof value === "object" &&
    value &&
    "toDate" in value &&
    typeof (value as any).toDate === "function"
  ) {
    return (value as any).toDate().getTime();
  }

  return 0;
}

function normalizeMessageInput(data: ContactMessageInput): {
  data?: ContactMessageInput;
  error?: string;
} {
  const payload = data as Record<string, unknown>;

  const name = stripHtml(cleanText(payload.name));
  const email = normalizeEmail(payload.email);
  const subject = stripHtml(cleanText(payload.subject));
  const message = stripHtml(cleanText(payload.message));

  if (!name) return { error: "Name is required." };
  if (name.length > 120)
    return { error: "Name must be 120 characters or less." };

  if (!email) return { error: "Email is required." };
  if (!isValidEmail(email)) return { error: "Enter a valid email address." };

  if (!subject) return { error: "Subject is required." };
  if (subject.length > 160)
    return { error: "Subject must be 160 characters or less." };

  if (!message) return { error: "Message is required." };
  if (message.length > 5000)
    return { error: "Message must be 5000 characters or less." };

  return {
    data: {
      name,
      email,
      subject,
      message,
    },
  };
}

export function useMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, collections.contactMessages),
      (snapshot) => {
        const data = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }))
          .sort(
            (a, b) =>
              toMillis((b as any).createdAt) - toMillis((a as any).createdAt),
          ) as ContactMessage[];

        setMessages(data);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const addMessage = async (data: ContactMessageInput) => {
    const normalized = normalizeMessageInput(data);
    if (normalized.error) {
      throw new Error(normalized.error);
    }

    await addDoc(collection(db, collections.contactMessages), {
      ...normalized.data,
      status: "unread",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return true;
  };

  const updateMessageStatus = async (
    id: string,
    status: ContactMessage["status"],
  ) => {
    const allowed = new Set(["unread", "read", "replied"]);
    if (!allowed.has(String(status))) {
      throw new Error("Invalid message status.");
    }

    return updateDocument<ContactMessage>(collections.contactMessages, id, {
      status,
    });
  };

  const deleteMessage = async (id: string) => {
    return deleteDocument(collections.contactMessages, id);
  };

  return {
    messages,
    loading,
    error,
    addMessage,
    updateMessageStatus,
    updateMessage: updateMessageStatus,
    deleteMessage,
  };
}
