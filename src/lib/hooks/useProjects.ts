import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { addDocument, collections, deleteDocument, updateDocument } from '../firestore';
import { cleanText, readCachedValue, stripHtml, toIsoString, toMillis, toNumber, writeCachedValue } from '../dataHelpers';
import { Project } from '../../types';

const PROJECTS_CACHE_KEY = 'portfolio:projects:v2';

function normalizeMediaValue(value: unknown): string {
  const raw = cleanText(value);
  if (!raw) return '';
  if (raw.startsWith('data:image/') || raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }
  return '';
}

function normalizeUrl(value: unknown): string {
  const url = cleanText(value);
  if (!url) return '';
  if (url === '#') return '#';

  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.toString();
  } catch {
    // ignore
  }

  return '';
}

function normalizeTechList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => cleanText(item))
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index);
}

function normalizeProjectRecord(id: string, raw: Record<string, unknown>, fallbackOrder: number): Project {
  const showOnHome = Boolean(raw.showOnHome);
  const homeOrder = showOnHome ? toNumber(raw.homeOrder, fallbackOrder) : 0;

  return {
    id,
    title: cleanText(raw.title),
    category: cleanText(raw.category),
    description: cleanText(raw.description),
    coverImage: normalizeMediaValue(raw.coverImage),
    detailImage1: normalizeMediaValue(raw.detailImage1),
    detailImage2: normalizeMediaValue(raw.detailImage2),
    technologies: normalizeTechList(raw.technologies),
    liveLink: normalizeUrl(raw.liveLink),
    sourceLink: normalizeUrl(raw.sourceLink),
    isFeatured: Boolean(raw.isFeatured),
    showOnHome,
    order: toNumber(raw.order, fallbackOrder),
    homeOrder,
    createdAt: toIsoString(raw.createdAt),
    updatedAt: toIsoString(raw.updatedAt),
    createdBy: cleanText(raw.createdBy),
    updatedBy: cleanText(raw.updatedBy),
    deletedAt: toIsoString(raw.deletedAt),
    isDeleted: Boolean(raw.isDeleted),
  } as Project;
}

function normalizeProjectInput(data: Partial<Project>, requireRequiredFields: boolean): { data?: Partial<Project>; error?: string } {
  const normalized: Partial<Project> = {};

  if (data.title !== undefined || requireRequiredFields) {
    const title = cleanText(data.title);
    if (!title) return { error: 'Project title is required.' };
    if (title.length > 120) return { error: 'Project title must be 120 characters or less.' };
    normalized.title = title;
  }

  if (data.category !== undefined || requireRequiredFields) {
    const category = cleanText(data.category);
    if (!category) return { error: 'Category is required.' };
    if (category.length > 80) return { error: 'Category must be 80 characters or less.' };
    normalized.category = category;
  }

  if (data.description !== undefined || requireRequiredFields) {
    const description = stripHtml(cleanText(data.description));
    if (!description) return { error: 'Description is required.' };
    if (description.length > 2000) return { error: 'Description must be 2000 characters or less.' };
    normalized.description = description;
  }

  if (data.coverImage !== undefined || requireRequiredFields) normalized.coverImage = normalizeMediaValue(data.coverImage);
  if (data.detailImage1 !== undefined || requireRequiredFields) normalized.detailImage1 = normalizeMediaValue(data.detailImage1);
  if (data.detailImage2 !== undefined || requireRequiredFields) normalized.detailImage2 = normalizeMediaValue(data.detailImage2);

  if (data.technologies !== undefined || requireRequiredFields) {
    const technologies = normalizeTechList(data.technologies);
    if (technologies.some((tech) => tech.length > 40)) {
      return { error: 'Each technology must be 40 characters or less.' };
    }
    normalized.technologies = technologies;
  }

  if (data.liveLink !== undefined || requireRequiredFields) normalized.liveLink = normalizeUrl(data.liveLink);
  if (data.sourceLink !== undefined || requireRequiredFields) normalized.sourceLink = normalizeUrl(data.sourceLink);
  if (data.isFeatured !== undefined || requireRequiredFields) normalized.isFeatured = Boolean(data.isFeatured);
  if (data.showOnHome !== undefined || requireRequiredFields) normalized.showOnHome = Boolean(data.showOnHome);

  if (data.order !== undefined || requireRequiredFields) {
    const order = toNumber(data.order, 0);
    normalized.order = order > 0 ? Math.floor(order) : 0;
  }

  if (data.homeOrder !== undefined || requireRequiredFields) {
    const homeOrder = toNumber(data.homeOrder, 0);
    normalized.homeOrder = homeOrder > 0 ? Math.floor(homeOrder) : 0;
  }

  return { data: normalized };
}

function compareProjects(a: Project, b: Project): number {
  const orderA = toNumber(a.order, Number.MAX_SAFE_INTEGER);
  const orderB = toNumber(b.order, Number.MAX_SAFE_INTEGER);
  if (orderA !== orderB) return orderA - orderB;
  return toMillis(b.createdAt) - toMillis(a.createdAt);
}

function compareHomeProjects(a: Project, b: Project): number {
  const homeA = toNumber(a.homeOrder, Number.MAX_SAFE_INTEGER);
  const homeB = toNumber(b.homeOrder, Number.MAX_SAFE_INTEGER);
  if (homeA !== homeB) return homeA - homeB;
  return compareProjects(a, b);
}

function prepareCachedProjects(value: Project[]): Project[] {
  return [...value]
    .filter((project) => !project.isDeleted)
    .sort(compareProjects);
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(() => prepareCachedProjects(readCachedValue<Project[]>(PROJECTS_CACHE_KEY, [])));
  const [loading, setLoading] = useState(projects.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, collections.projects),
      (snapshot) => {
        const normalized = snapshot.docs.map((docSnap, index) =>
          normalizeProjectRecord(docSnap.id, docSnap.data() as Record<string, unknown>, index + 1),
        );

        const filtered = normalized.filter((project) => !project.isDeleted).sort(compareProjects);
        setProjects(filtered);
        writeCachedValue(PROJECTS_CACHE_KEY, filtered);
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

  const nextOrder = useMemo(() => {
    const numericOrders = projects.map((project) => toNumber(project.order, 0)).filter((value) => value > 0);
    return (numericOrders.length ? Math.max(...numericOrders) : 0) + 1;
  }, [projects]);

  const nextHomeOrder = useMemo(() => {
    const numericOrders = projects
      .filter((project) => project.showOnHome)
      .map((project) => toNumber(project.homeOrder, 0))
      .filter((value) => value > 0);
    return (numericOrders.length ? Math.max(...numericOrders) : 0) + 1;
  }, [projects]);

  const addProject = async (data: Omit<Project, 'id' | 'createdAt'>) => {
    const normalized = normalizeProjectInput(data, true);
    if (normalized.error) return { id: null, error: normalized.error };

    try {
      const docData = {
        ...normalized.data,
        order: normalized.data?.order && normalized.data.order > 0 ? normalized.data.order : nextOrder,
        showOnHome: Boolean(normalized.data?.showOnHome),
        homeOrder:
          normalized.data?.showOnHome && normalized.data.homeOrder && normalized.data.homeOrder > 0
            ? normalized.data.homeOrder
            : normalized.data?.showOnHome
              ? nextHomeOrder
              : 0,
      };
      const result = await addDocument<Project>(collections.projects, docData as Partial<Project>);
      return result;
    } catch (err: any) {
      return { id: null, error: err.message };
    }
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    const normalized = normalizeProjectInput(data, false);
    if (normalized.error) return { error: normalized.error };
    return await updateDocument<Project>(collections.projects, id, normalized.data as Partial<Project>);
  };

  const deleteProject = async (id: string) => {
    return await deleteDocument(collections.projects, id);
  };

  const moveProjectOrder = async (id: string, direction: -1 | 1) => {
    const ordered = [...projects].sort(compareProjects);
    const currentIndex = ordered.findIndex((project) => project.id === id);
    const targetIndex = currentIndex + direction;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= ordered.length) {
      return { error: 'Cannot move project further in that direction.' };
    }

    const current = ordered[currentIndex];
    const target = ordered[targetIndex];

    try {
      await updateDocument<Project>(collections.projects, current.id, { order: target.order });
      await updateDocument<Project>(collections.projects, target.id, { order: current.order });
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const moveProjectHomeOrder = async (id: string, direction: -1 | 1) => {
    const ordered = [...projects].filter((project) => project.showOnHome).sort(compareHomeProjects);
    const currentIndex = ordered.findIndex((project) => project.id === id);
    const targetIndex = currentIndex + direction;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= ordered.length) {
      return { error: 'Cannot move project further in that direction.' };
    }

    const current = ordered[currentIndex];
    const target = ordered[targetIndex];

    try {
      await updateDocument<Project>(collections.projects, current.id, { homeOrder: target.homeOrder });
      await updateDocument<Project>(collections.projects, target.id, { homeOrder: current.homeOrder });
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const setProjectHomeVisibility = async (id: string, showOnHome: boolean) => {
    const current = projects.find((project) => project.id === id);
    if (!current) return { error: 'Project not found.' };

    const nextData: Partial<Project> = {
      showOnHome,
      homeOrder: showOnHome ? (current.showOnHome ? current.homeOrder : nextHomeOrder) : 0,
    };

    return await updateDocument<Project>(collections.projects, id, nextData);
  };

  return {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    moveProjectOrder,
    moveProjectHomeOrder,
    setProjectHomeVisibility,
  };
}
