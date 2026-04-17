import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { addDocument, collections, deleteDocument, updateDocument } from '../firestore';
import { cleanText, readCachedValue, toIsoString, toMillis, writeCachedValue } from '../dataHelpers';
import { ContactMessage } from '../../types';

const MESSAGES_CACHE_KEY = 'portfolio:messages:v2';

function normalizeMessageInput(data: ContactMessageInput): { data?: ContactMessageInput; error?: string } {
  const name = cleanText(data.name);
  const email = cleanText(data.email).toLowerCase();
  const subject = cleanText(data.subject ?? '');
  const message = cleanText(data.message);

  if (!name) return { error: 'Name is required.' };
  if (name.length > 80) return { error: 'Name must be 80 characters or less.' };

  if (!email) return { error: 'Email is required.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.' };

  if (subject.length > 160) return { error: 'Subject must be 160 characters or less.' };

  if (!message) return { error: 'Message is required.' };
  if (message.length > 5000) return { error: 'Message must be 5000 characters or less.' };

  return {
    data: {
      name,
      email,
      subject,
      message,
    },
  };
}

interface ContactMessageInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

function normalizeMessageSnapshot(item: any): ContactMessage {
  return {
    id: item.id,
    name: cleanText(item.name),
    email: cleanText(item.email),
    subject: cleanText(item.subject),
    message: cleanText(item.message),
    status: item.status === 'read' || item.status === 'replied' ? item.status : 'unread',
    createdAt: toIsoString(item.createdAt),
    updatedAt: toIsoString(item.updatedAt),
    createdBy: cleanText(item.createdBy),
    updatedBy: cleanText(item.updatedBy),
    deletedAt: toIsoString(item.deletedAt),
    isDeleted: Boolean(item.isDeleted),
  } as ContactMessage;
}

export function useMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>(() => readCachedValue<ContactMessage[]>(MESSAGES_CACHE_KEY, []).filter((message) => !message.isDeleted));
  const [loading, setLoading] = useState(messages.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, collections.contactMessages),
      (snapshot) => {
        const data = snapshot.docs
          .map((docSnap) => normalizeMessageSnapshot({ id: docSnap.id, ...docSnap.data() }))
          .filter((message) => !message.isDeleted)
          .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

        setMessages(data);
        writeCachedValue(MESSAGES_CACHE_KEY, data);
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

    await addDocument<ContactMessage>(collections.contactMessages, {
      ...normalized.data,
      status: 'unread',
    } as Partial<ContactMessage>);

    return true;
  };

  const updateMessageStatus = async (id: string, status: ContactMessage['status']) => {
    const allowed = new Set(['unread', 'read', 'replied']);
    if (!allowed.has(String(status))) {
      throw new Error('Invalid message status.');
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
