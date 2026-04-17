import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { collections } from '../firestore';
import { cleanText, readCachedValue, readCachedValueMaybe, stripHtml, writeCachedValue } from '../dataHelpers';
import { SiteSettings } from '../../types';

const SITE_SETTINGS_CACHE_KEY = 'portfolio:siteSettings:v2';

export const defaultSettings: SiteSettings = {
  siteName: 'Your Portfolio',
  siteDescription: 'Personal portfolio and blog',
  contactEmail: 'hello@yourdomain.com',
  contactPhone: '',
  contactWhatsapp: '',
  contactLocation: 'Uganda',
  heroTitle: 'Your Name Here',
  heroSubtitle: 'Web and Mobile Application Developer',
  heroBackgroundImageUrl: '',
  heroCounters: '',
  aboutHeading: 'About Me',
  aboutSubheading: 'Full Stack Developer based in Uganda.',
  aboutBio: 'Write a short introduction about yourself, your experience, and the kind of work you do.',
  aboutImageUrl: '',
  aboutSoftSkills: '',
  aboutSkillsTechnologies: '',
  aboutWorkExperience: '',
  aboutFaqs: '',
  aboutStoryTimeline: '',
  aboutEducation: '',
  aboutCertifications: '',
  portfolioNonTechProjects: '',
  portfolioPublications: '',
  resumeUrl: '',
  logoUrl: '',
  faviconUrl: '',
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string): boolean {
  if (!value) return true;
  if (value === '#') return true;
  if (value.startsWith('data:')) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeSettingsInput(data: Partial<SiteSettings>): { data?: Partial<SiteSettings>; error?: string } {
  const normalized: Partial<SiteSettings> = {};

  const copyText = (key: keyof SiteSettings, maxLength?: number) => {
    const value = data[key];
    if (value === undefined) return;
    const text = stripHtml(cleanText(value));
    if (typeof maxLength === 'number' && text.length > maxLength) {
      throw new Error(`${String(key)} must be ${maxLength} characters or less.`);
    }
    normalized[key] = text as any;
  };

  try {
    if (data.siteName !== undefined) {
      const siteName = stripHtml(cleanText(data.siteName));
      if (!siteName) return { error: 'Site name is required.' };
      if (siteName.length > 120) return { error: 'Site name must be 120 characters or less.' };
      normalized.siteName = siteName;
    }

    if (data.siteDescription !== undefined) copyText('siteDescription', 500);

    if (data.contactEmail !== undefined) {
      const contactEmail = cleanText(data.contactEmail).toLowerCase();
      if (contactEmail && !isValidEmail(contactEmail)) return { error: 'Enter a valid contact email address.' };
      normalized.contactEmail = contactEmail;
    }

    if (data.contactPhone !== undefined) copyText('contactPhone', 60);
    if (data.contactWhatsapp !== undefined) copyText('contactWhatsapp', 60);
    if (data.contactLocation !== undefined) copyText('contactLocation', 120);

    if (data.heroTitle !== undefined) copyText('heroTitle', 120);
    if (data.heroSubtitle !== undefined) copyText('heroSubtitle', 500);
    if (data.heroBackgroundImageUrl !== undefined) {
      const value = cleanText(data.heroBackgroundImageUrl);
      if (value && !isValidUrl(value)) return { error: 'Hero background image must be a valid URL, data URL, or #.' };
      normalized.heroBackgroundImageUrl = value;
    }
    if (data.heroCounters !== undefined) normalized.heroCounters = cleanText(data.heroCounters);

    if (data.aboutHeading !== undefined) copyText('aboutHeading', 120);
    if (data.aboutSubheading !== undefined) copyText('aboutSubheading', 160);
    if (data.aboutBio !== undefined) copyText('aboutBio', 5000);
    if (data.aboutImageUrl !== undefined) {
      const value = cleanText(data.aboutImageUrl);
      if (value && !isValidUrl(value)) return { error: 'About image must be a valid URL, data URL, or #.' };
      normalized.aboutImageUrl = value;
    }
    if (data.aboutSoftSkills !== undefined) normalized.aboutSoftSkills = cleanText(data.aboutSoftSkills);
    if (data.aboutSkillsTechnologies !== undefined) normalized.aboutSkillsTechnologies = cleanText(data.aboutSkillsTechnologies);
    if (data.aboutWorkExperience !== undefined) normalized.aboutWorkExperience = cleanText(data.aboutWorkExperience);
    if (data.aboutFaqs !== undefined) normalized.aboutFaqs = cleanText(data.aboutFaqs);
    if (data.aboutStoryTimeline !== undefined) normalized.aboutStoryTimeline = cleanText(data.aboutStoryTimeline);
    if (data.aboutEducation !== undefined) normalized.aboutEducation = cleanText(data.aboutEducation);
    if (data.aboutCertifications !== undefined) normalized.aboutCertifications = cleanText(data.aboutCertifications);

    if (data.portfolioNonTechProjects !== undefined) normalized.portfolioNonTechProjects = cleanText(data.portfolioNonTechProjects);
    if (data.portfolioPublications !== undefined) normalized.portfolioPublications = cleanText(data.portfolioPublications);

    if (data.resumeUrl !== undefined) {
      const resumeUrl = cleanText(data.resumeUrl);
      if (resumeUrl && !isValidUrl(resumeUrl)) return { error: 'Resume/CV URL must be a valid URL, data URL, or #.' };
      normalized.resumeUrl = resumeUrl;
    }

    if (data.logoUrl !== undefined) {
      const value = cleanText(data.logoUrl);
      if (value && !isValidUrl(value)) return { error: 'Logo URL must be a valid URL, data URL, or #.' };
      normalized.logoUrl = value;
    }

    if (data.faviconUrl !== undefined) {
      const value = cleanText(data.faviconUrl);
      if (value && !isValidUrl(value)) return { error: 'Favicon URL must be a valid URL, data URL, or #.' };
      normalized.faviconUrl = value;
    }

    return { data: normalized };
  } catch (error: any) {
    return { error: error.message };
  }
}

export function useSiteSettings() {
  const cachedSettings = readCachedValueMaybe<SiteSettings>(SITE_SETTINGS_CACHE_KEY);
  const [settings, setSettings] = useState<SiteSettings>(() => cachedSettings || defaultSettings);
  const [loading, setLoading] = useState(cachedSettings === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const docRef = doc(db, collections.siteSettings, 'main');

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const merged = {
            ...defaultSettings,
            ...(docSnap.data() as Partial<SiteSettings>),
          } as SiteSettings;
          setSettings(merged);
          writeCachedValue(SITE_SETTINGS_CACHE_KEY, merged);
        } else {
          setSettings(defaultSettings);
          writeCachedValue(SITE_SETTINGS_CACHE_KEY, defaultSettings);
        }
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setSettings(readCachedValue<SiteSettings>(SITE_SETTINGS_CACHE_KEY, defaultSettings));
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const updateSettings = async (data: Partial<SiteSettings>) => {
    const normalized = normalizeSettingsInput(data);
    if (normalized.error) return { error: normalized.error };

    try {
      const docRef = doc(db, collections.siteSettings, 'main');
      const payload = {
        ...(normalized.data as Partial<SiteSettings>),
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser?.uid || null,
        updatedByEmail: auth.currentUser?.email?.toLowerCase() || null,
        updatedByName: auth.currentUser?.displayName?.trim() || null,
      };

      await setDoc(docRef, payload, { merge: true });
      setSettings((prev) => {
        const next = { ...prev, ...(normalized.data as Partial<SiteSettings>) };
        writeCachedValue(SITE_SETTINGS_CACHE_KEY, next);
        return next;
      });
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return { settings, loading, error, updateSettings, refetch: () => {} };
}

