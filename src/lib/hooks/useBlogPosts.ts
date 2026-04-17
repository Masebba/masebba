import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { addDocument, collections, deleteDocument, updateDocument } from '../firestore';
import { cleanText, readCachedValue, stripHtml, toIsoString, toMillis, writeCachedValue } from '../dataHelpers';
import { sanitizeHtml } from '../sanitize';
import { BlogPost } from '../../types';

const BLOG_POSTS_CACHE_KEY = 'portfolio:blogPosts:v2';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
}

function normalizeImageValue(value: unknown): string {
  const raw = cleanText(value);
  if (!raw) return '';
  if (raw.startsWith('data:image/') || raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return '';
}

function normalizeBlogPostInput(data: Partial<BlogPost>, requireRequiredFields: boolean): { data?: Partial<BlogPost>; error?: string } {
  const normalized: Partial<BlogPost> = {};

  if (data.title !== undefined || requireRequiredFields) {
    const title = cleanText(data.title);
    if (!title) return { error: 'Post title is required.' };
    if (title.length > 160) return { error: 'Post title must be 160 characters or less.' };
    normalized.title = title;
  }

  if (data.slug !== undefined || requireRequiredFields) {
    const rawSlug = cleanText(data.slug);
    const fallbackSource = cleanText(data.title);
    const slugSource = rawSlug || (requireRequiredFields ? fallbackSource : '');
    if (!slugSource) return { error: 'Post slug is required.' };

    const slug = slugify(slugSource);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { error: 'Post slug is invalid.' };
    if (slug.length > 120) return { error: 'Post slug must be 120 characters or less.' };
    normalized.slug = slug;
  }

  if (data.excerpt !== undefined || requireRequiredFields) {
    const excerpt = stripHtml(cleanText(data.excerpt));
    if (excerpt.length > 500) return { error: 'Excerpt must be 500 characters or less.' };
    normalized.excerpt = excerpt;
  }

  if (data.content !== undefined || requireRequiredFields) {
    const content = sanitizeHtml(cleanText(data.content));
    const plainText = stripHtml(content);
    if (!plainText) return { error: 'Post content cannot be empty.' };
    if (content.length > 200000) return { error: 'Post content is too large.' };
    normalized.content = content;
  }

  if (data.categories !== undefined || requireRequiredFields) {
    const categories = toStringArray((data as any).categories);
    const legacyCategory = cleanText((data as any).category);
    const merged = categories.length ? categories : legacyCategory ? [legacyCategory] : [];
    if (!merged.length) return { error: 'At least one category is required.' };
    normalized.categories = merged;
  }

  if (data.tags !== undefined || requireRequiredFields) normalized.tags = toStringArray(data.tags);

  if (data.status !== undefined || requireRequiredFields) {
    const status = cleanText(data.status) as BlogPost['status'];
    if (status !== 'draft' && status !== 'published') return { error: 'Post status must be draft or published.' };
    normalized.status = status;
  }

  if (data.coverImage !== undefined || requireRequiredFields) normalized.coverImage = normalizeImageValue(data.coverImage);

  return { data: normalized };
}

function normalizeBlogSnapshot(docData: any): BlogPost {
  const categories = toStringArray(docData.categories);
  const legacyCategory = cleanText(docData.category);

  return {
    id: docData.id,
    title: cleanText(docData.title),
    slug: cleanText(docData.slug),
    excerpt: cleanText(docData.excerpt),
    content: typeof docData.content === 'string' ? docData.content : '',
    categories: categories.length ? categories : legacyCategory ? [legacyCategory] : [],
    tags: toStringArray(docData.tags),
    status: docData.status === 'published' ? 'published' : 'draft',
    coverImage: cleanText(docData.coverImage),
    createdAt: toIsoString(docData.createdAt),
    updatedAt: toIsoString(docData.updatedAt),
    createdBy: cleanText(docData.createdBy),
    updatedBy: cleanText(docData.updatedBy),
    deletedAt: toIsoString(docData.deletedAt),
    isDeleted: Boolean(docData.isDeleted),
  } as BlogPost;
}

function prepareCachedPosts(posts: BlogPost[]): BlogPost[] {
  return posts.filter((post) => !post.isDeleted).sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
}

export function useBlogPosts(publishedOnly = false) {
  const [posts, setPosts] = useState<BlogPost[]>(() => prepareCachedPosts(readCachedValue<BlogPost[]>(BLOG_POSTS_CACHE_KEY, [])).filter((post) => !publishedOnly || post.status === 'published'));
  const [loading, setLoading] = useState(posts.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, collections.blogPosts),
      (snapshot) => {
        const data = snapshot.docs
          .map((docSnap) => normalizeBlogSnapshot({ id: docSnap.id, ...docSnap.data() }))
          .filter((post) => !post.isDeleted)
          .filter((post) => !publishedOnly || post.status === 'published')
          .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

        setPosts(data);
        writeCachedValue(BLOG_POSTS_CACHE_KEY, data);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [publishedOnly]);

  const addPost = async (data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => {
    const normalized = normalizeBlogPostInput(data, true);
    if (normalized.error) return { id: null, error: normalized.error };

    try {
      const result = await addDocument<BlogPost>(collections.blogPosts, {
        ...normalized.data,
      });
      return result;
    } catch (err: any) {
      return { id: null, error: err.message };
    }
  };

  const updatePost = async (id: string, data: Partial<BlogPost>) => {
    const normalized = normalizeBlogPostInput(data, false);
    if (normalized.error) return { error: normalized.error };

    return await updateDocument<BlogPost>(collections.blogPosts, id, normalized.data as Partial<BlogPost>);
  };

  const deletePost = async (id: string) => {
    return await deleteDocument(collections.blogPosts, id);
  };

  return { posts, loading, error, addPost, updatePost, deletePost };
}
