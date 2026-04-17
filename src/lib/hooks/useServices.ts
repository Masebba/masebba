import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { addDocument, collections, deleteDocument, updateDocument } from '../firestore';
import { cleanText, readCachedValue, stripHtml, toIsoString, toMillis, writeCachedValue } from '../dataHelpers';
import { Service } from '../../types';

const SERVICES_CACHE_KEY = 'portfolio:services:v2';

function normalizeIconName(value: unknown): string {
  return cleanText(value);
}

function normalizeServiceInput(data: Partial<Service>, requireRequiredFields: boolean): { data?: Partial<Service>; error?: string } {
  const normalized: Partial<Service> = {};

  if (data.title !== undefined || requireRequiredFields) {
    const title = cleanText(data.title);
    if (!title) return { error: 'Service title is required.' };
    if (title.length > 120) return { error: 'Service title must be 120 characters or less.' };
    normalized.title = title;
  }

  if (data.description !== undefined || requireRequiredFields) {
    const description = stripHtml(cleanText(data.description));
    if (!description) return { error: 'Description is required.' };
    if (description.length > 1000) return { error: 'Description must be 1000 characters or less.' };
    normalized.description = description;
  }

  if (data.icon !== undefined || requireRequiredFields) {
    const icon = normalizeIconName(data.icon);
    if (!icon) return { error: 'Icon name is required.' };
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(icon)) return { error: 'Icon name must be a valid Lucide icon name.' };
    normalized.icon = icon;
  }

  if (data.order !== undefined || requireRequiredFields) {
    const orderValue = data.order;
    const order = typeof orderValue === 'string' ? Number(orderValue) : Number(orderValue);
    if (Number.isNaN(order)) return { error: 'Display order must be a number.' };
    if (!Number.isInteger(order)) return { error: 'Display order must be a whole number.' };
    if (order < 0) return { error: 'Display order cannot be negative.' };
    normalized.order = order;
  }

  if (data.isVisible !== undefined || requireRequiredFields) normalized.isVisible = Boolean(data.isVisible);

  return { data: normalized };
}

function normalizeServiceSnapshot(item: any): Service {
  return {
    id: item.id,
    title: cleanText(item.title),
    description: cleanText(item.description),
    icon: cleanText(item.icon),
    order: Number(item.order ?? 0),
    isVisible: Boolean(item.isVisible),
    createdAt: toIsoString(item.createdAt),
    updatedAt: toIsoString(item.updatedAt),
    createdBy: cleanText(item.createdBy),
    updatedBy: cleanText(item.updatedBy),
    deletedAt: toIsoString(item.deletedAt),
    isDeleted: Boolean(item.isDeleted),
  } as Service;
}

function prepareCachedServices(items: Service[]): Service[] {
  return items.filter((service) => !service.isDeleted).sort((a, b) => Number((a as any).order ?? 0) - Number((b as any).order ?? 0));
}

export function useServices(visibleOnly = false) {
  const [services, setServices] = useState<Service[]>(() => {
    const cached = prepareCachedServices(readCachedValue<Service[]>(SERVICES_CACHE_KEY, []));
    return visibleOnly ? cached.filter((service) => service.isVisible) : cached;
  });
  const [loading, setLoading] = useState(services.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, collections.services),
      (snapshot) => {
        const data = snapshot.docs
          .map((docSnap) => normalizeServiceSnapshot({ id: docSnap.id, ...docSnap.data() }))
          .filter((item) => !item.isDeleted)
          .filter((item) => !visibleOnly || item.isVisible)
          .sort((a, b) => Number((a as any).order ?? 0) - Number((b as any).order ?? 0));
        setServices(data);
        writeCachedValue(SERVICES_CACHE_KEY, data);
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

  const addService = async (data: Omit<Service, 'id'>) => {
    const normalized = normalizeServiceInput(data, true);
    if (normalized.error) return { id: null, error: normalized.error };

    try {
      return await addDocument<Service>(collections.services, normalized.data as Partial<Service>);
    } catch (err: any) {
      return { id: null, error: err.message };
    }
  };

  const updateService = async (id: string, data: Partial<Service>) => {
    const normalized = normalizeServiceInput(data, false);
    if (normalized.error) return { error: normalized.error };

    return await updateDocument<Service>(collections.services, id, normalized.data as Partial<Service>);
  };

  const deleteService = async (id: string) => {
    return await deleteDocument(collections.services, id);
  };

  return { services, loading, error, addService, updateService, deleteService };
}
