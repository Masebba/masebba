import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { collections, updateDocument, deleteDocument } from "../firestore";
import { Project } from "../../types";

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function stripHtml(input: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input || "", "text/html");
  return (doc.body.textContent || "").trim();
}

function normalizeMediaValue(value: unknown): string {
  const raw = cleanText(value);
  if (!raw) return "";

  if (
    raw.startsWith("data:image/") ||
    raw.startsWith("http://") ||
    raw.startsWith("https://")
  ) {
    return raw;
  }

  return "";
}

function normalizeUrl(value: unknown): string {
  const url = cleanText(value);
  if (!url) return "";
  if (url === "#") return "#";

  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    // fall through
  }

  return "";
}

function normalizeTechList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => cleanText(item))
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index);
}

function normalizeProjectInput(
  data: Partial<Project>,
  requireRequiredFields: boolean,
): { data?: Partial<Project>; error?: string } {
  const normalized: Partial<Project> = {};

  if (data.title !== undefined || requireRequiredFields) {
    const title = cleanText(data.title);
    if (!title) return { error: "Project title is required." };
    if (title.length > 120) {
      return { error: "Project title must be 120 characters or less." };
    }
    normalized.title = title;
  }

  if (data.category !== undefined || requireRequiredFields) {
    const category = cleanText(data.category);
    if (!category) return { error: "Category is required." };
    if (category.length > 80) {
      return { error: "Category must be 80 characters or less." };
    }
    normalized.category = category;
  }

  if (data.description !== undefined || requireRequiredFields) {
    const description = stripHtml(cleanText(data.description));
    if (!description) return { error: "Description is required." };
    if (description.length > 2000) {
      return { error: "Description must be 2000 characters or less." };
    }
    normalized.description = description;
  }

  if (data.coverImage !== undefined || requireRequiredFields) {
    normalized.coverImage = normalizeMediaValue(data.coverImage);
  }

  if (data.technologies !== undefined || requireRequiredFields) {
    const technologies = normalizeTechList(data.technologies);
    if (technologies.some((tech) => tech.length > 40)) {
      return { error: "Each technology must be 40 characters or less." };
    }
    normalized.technologies = technologies;
  }

  if (data.liveLink !== undefined || requireRequiredFields) {
    normalized.liveLink = normalizeUrl(data.liveLink);
  }

  if (data.sourceLink !== undefined || requireRequiredFields) {
    normalized.sourceLink = normalizeUrl(data.sourceLink);
  }

  if (data.isFeatured !== undefined || requireRequiredFields) {
    normalized.isFeatured = Boolean(data.isFeatured);
  }

  return { data: normalized };
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

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, collections.projects),
      (snapshot) => {
        const data = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }))
          .sort(
            (a, b) =>
              toMillis((b as any).createdAt) - toMillis((a as any).createdAt),
          ) as Project[];

        setProjects(data);
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

  const addProject = async (data: Omit<Project, "id" | "createdAt">) => {
    const normalized = normalizeProjectInput(data, true);
    if (normalized.error) return { id: null, error: normalized.error };

    try {
      const docRef = await addDoc(collection(db, collections.projects), {
        ...normalized.data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { id: docRef.id, error: null };
    } catch (err: any) {
      return { id: null, error: err.message };
    }
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    const normalized = normalizeProjectInput(data, false);
    if (normalized.error) return { error: normalized.error };

    return await updateDocument<Project>(
      collections.projects,
      id,
      normalized.data as Partial<Project>,
    );
  };

  const deleteProject = async (id: string) => {
    return await deleteDocument(collections.projects, id);
  };

  return {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
  };
}
