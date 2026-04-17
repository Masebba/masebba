import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { addDocument, collections, deleteDocument, updateDocument } from '../firestore';
import { cleanText, readCachedValue, toIsoString, writeCachedValue } from '../dataHelpers';
import { SocialLink } from '../../types';

const SOCIAL_LINKS_CACHE_KEY = 'portfolio:socialLinks:v2';

function normalizePlatform(value: unknown): string {
  return cleanText(value).replace(/\s+/g, ' ');
}

function normalizeUrl(value: unknown): string {
  const url = cleanText(value);
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.toString();
  } catch {
    // fall through
  }
  return '';
}

function normalizeSocialLinkInput(data: Partial<SocialLink>, requireRequiredFields: boolean): { data?: Partial<SocialLink>; error?: string } {
  const normalized: Partial<SocialLink> = {};

  if (data.platform !== undefined || requireRequiredFields) {
    const platform = normalizePlatform(data.platform);
    if (!platform) return { error: 'Platform name is required.' };
    if (platform.length > 80) return { error: 'Platform name must be 80 characters or less.' };
    normalized.platform = platform;
  }

  if (data.url !== undefined || requireRequiredFields) {
    const url = normalizeUrl(data.url);
    if (!url) return { error: 'URL is required.' };
    normalized.url = url;
  }

  if (data.isVisible !== undefined || requireRequiredFields) normalized.isVisible = Boolean(data.isVisible);

  return { data: normalized };
}

function normalizeLinkSnapshot(item: any): SocialLink {
  return {
    id: item.id,
    platform: cleanText(item.platform),
    url: cleanText(item.url),
    isVisible: Boolean(item.isVisible),
    createdAt: toIsoString(item.createdAt),
    updatedAt: toIsoString(item.updatedAt),
    createdBy: cleanText(item.createdBy),
    updatedBy: cleanText(item.updatedBy),
    deletedAt: toIsoString(item.deletedAt),
    isDeleted: Boolean(item.isDeleted),
  } as SocialLink;
}

function prepareCachedLinks(items: SocialLink[]): SocialLink[] {
  return items.filter((item) => !item.isDeleted).sort((a, b) => String(a.platform ?? '').localeCompare(String(b.platform ?? '')));
}

export function useSocialLinks(visibleOnly = false) {
  const [links, setLinks] = useState<SocialLink[]>(() => {
    const cached = prepareCachedLinks(readCachedValue<SocialLink[]>(SOCIAL_LINKS_CACHE_KEY, []));
    return visibleOnly ? cached.filter((link) => link.isVisible) : cached;
  });
  const [loading, setLoading] = useState(links.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const baseRef = collection(db, collections.socialLinks);
    const sourceRef = visibleOnly ? query(baseRef, where('isVisible', '==', true)) : baseRef;

    const unsubscribe = onSnapshot(
      sourceRef,
      (snapshot) => {
        const data = snapshot.docs
          .map((docSnap) => normalizeLinkSnapshot({ id: docSnap.id, ...docSnap.data() }))
          .filter((item) => !item.isDeleted)
          .sort((a, b) => String((a as any).platform ?? '').localeCompare(String((b as any).platform ?? '')));

        setLinks(data);
        writeCachedValue(SOCIAL_LINKS_CACHE_KEY, data);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [visibleOnly]);

  const addLink = async (data: Omit<SocialLink, 'id'>) => {
    const normalized = normalizeSocialLinkInput(data, true);
    if (normalized.error) return { id: null, error: normalized.error };

    try {
      return await addDocument<SocialLink>(collections.socialLinks, normalized.data as Partial<SocialLink>);
    } catch (err: any) {
      return { id: null, error: err.message };
    }
  };

  const updateLink = async (id: string, data: Partial<SocialLink>) => {
    const normalized = normalizeSocialLinkInput(data, false);
    if (normalized.error) return { error: normalized.error };

    return await updateDocument<SocialLink>(collections.socialLinks, id, normalized.data as Partial<SocialLink>);
  };

  const deleteLink = async (id: string) => {
    return await deleteDocument(collections.socialLinks, id);
  };

  return { links, loading, error, addLink, updateLink, deleteLink };
}
