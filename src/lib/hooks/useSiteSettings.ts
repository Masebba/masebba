import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { collections } from "../firestore";
import { SiteSettings } from "../../types";

export const defaultSettings: SiteSettings = {
  siteName: "Masebba Portfolio",
  siteDescription: "Full-stack developer portfolio and blog",
  contactEmail: "hello@masebba.com",
  contactPhone: "+1 (555) 123-4567",
  contactWhatsapp: "+1 (555) 123-4567",
  contactLocation: "San Francisco, CA",
  heroTitle: "My name is Masebba A. Nasser",
  heroSubtitle: "Web and Mobile Application Developer",
  heroBackgroundImageUrl: "",
  heroCounters: "",
  aboutHeading: "Hi, I'm Masebba.",
  aboutSubheading: "Full Stack Developer based in San Francisco, CA.",
  aboutBio:
    "With over 5 years of experience in web development, I specialize in building exceptional digital experiences that are fast, accessible, and built with best practices.",
  aboutImageUrl: "",
  aboutSoftSkills: "",
  aboutSkillsTechnologies: "",
  aboutWorkExperience: "",
  aboutFaqs: "",
  aboutStoryTimeline: "",
  aboutEducation: "",
  aboutCertifications: "",
  portfolioNonTechProjects: "",
  portfolioPublications: "",
  resumeUrl: "",
  logoUrl: "/logo.svg",
  faviconUrl: "/favicon.svg",
};

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function stripHtml(input: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input || "", "text/html");
  return (doc.body.textContent || "").trim();
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string): boolean {
  if (!value) return true;
  if (value === "#") return true;
  if (value.startsWith("data:")) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeSettingsInput(data: Partial<SiteSettings>): {
  data?: Partial<SiteSettings>;
  error?: string;
} {
  const normalized: Partial<SiteSettings> = {};

  const copyText = (key: keyof SiteSettings, maxLength?: number, required = false) => {
    const value = data[key];
    if (value === undefined) return;
    const text = stripHtml(cleanText(value));
    if (required && !text) throw new Error(`${String(key)} is required.`);
    if (typeof maxLength === "number" && text.length > maxLength) {
      throw new Error(`${String(key)} must be ${maxLength} characters or less.`);
    }
    normalized[key] = text as any;
  };

  try {
    if (data.siteName !== undefined) {
      const siteName = stripHtml(cleanText(data.siteName));
      if (!siteName) return { error: "Site name is required." };
      if (siteName.length > 120)
        return { error: "Site name must be 120 characters or less." };
      normalized.siteName = siteName;
    }

    if (data.siteDescription !== undefined) copyText("siteDescription", 500);

    if (data.contactEmail !== undefined) {
      const contactEmail = cleanText(data.contactEmail).toLowerCase();
      if (contactEmail && !isValidEmail(contactEmail)) {
        return { error: "Enter a valid contact email address." };
      }
      normalized.contactEmail = contactEmail;
    }

    if (data.contactPhone !== undefined) copyText("contactPhone", 60);
    if (data.contactWhatsapp !== undefined) copyText("contactWhatsapp", 60);
    if (data.contactLocation !== undefined) copyText("contactLocation", 120);

    if (data.heroTitle !== undefined) copyText("heroTitle", 120);
    if (data.heroSubtitle !== undefined) copyText("heroSubtitle", 500);
    if (data.heroBackgroundImageUrl !== undefined) {
      const value = cleanText(data.heroBackgroundImageUrl);
      if (value && !isValidUrl(value)) return { error: "Hero background image must be a valid URL, data URL, or #." };
      normalized.heroBackgroundImageUrl = value;
    }
    if (data.heroCounters !== undefined) normalized.heroCounters = cleanText(data.heroCounters);

    if (data.aboutHeading !== undefined) copyText("aboutHeading", 120);
    if (data.aboutSubheading !== undefined) copyText("aboutSubheading", 160);
    if (data.aboutBio !== undefined) copyText("aboutBio", 5000);
    if (data.aboutImageUrl !== undefined) {
      const value = cleanText(data.aboutImageUrl);
      if (value && !isValidUrl(value)) return { error: "About image must be a valid URL, data URL, or #." };
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
      if (resumeUrl && !isValidUrl(resumeUrl)) {
        return { error: "Resume/CV URL must be a valid URL, data URL, or #." };
      }
      normalized.resumeUrl = resumeUrl;
    }

    if (data.logoUrl !== undefined) {
      const value = cleanText(data.logoUrl);
      if (value && !isValidUrl(value)) return { error: "Logo URL must be a valid URL, data URL, or #." };
      normalized.logoUrl = value;
    }

    if (data.faviconUrl !== undefined) {
      const value = cleanText(data.faviconUrl);
      if (value && !isValidUrl(value)) return { error: "Favicon URL must be a valid URL, data URL, or #." };
      normalized.faviconUrl = value;
    }

    return { data: normalized };
  } catch (error: any) {
    return { error: error.message };
  }
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const docRef = doc(db, collections.siteSettings, "main");

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings({
            ...defaultSettings,
            ...(docSnap.data() as Partial<SiteSettings>),
          });
        } else {
          setSettings(defaultSettings);
        }
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setSettings(defaultSettings);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const updateSettings = async (data: Partial<SiteSettings>) => {
    const normalized = normalizeSettingsInput(data);
    if (normalized.error) return { error: normalized.error };

    try {
      const docRef = doc(db, collections.siteSettings, "main");
      const nextSettings = {
        ...(normalized.data as Partial<SiteSettings>),
      };

      await setDoc(docRef, nextSettings, { merge: true });
      setSettings((prev) => ({
        ...prev,
        ...(normalized.data as Partial<SiteSettings>),
      }));

      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return { settings, loading, error, updateSettings, refetch: () => {} };
}
