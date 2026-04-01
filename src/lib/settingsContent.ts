export interface CounterItem {
  label: string;
  value: string;
  note?: string;
}

export interface ExperienceItem {
  title: string;
  company: string;
  period: string;
  type: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface EducationItem {
  year: string;
  title: string;
  institution: string;
  description: string;
}

export interface CreativeProjectItem {
  title: string;
  category: string;
  description: string;
  icon: string;
}

export interface StoryItem {
  year: string;
  title: string;
  description: string;
  icon: string;
}

export interface CertificationItem {
  name: string;
  year: string;
}

export interface PublicationItem {
  title: string;
  type: string;
  year: string;
  status: string;
  downloadUrl: string;
  description: string;
}

export function splitLines(value: string | undefined | null): string[] {
  return (value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseCounters(value: string | undefined | null): CounterItem[] {
  return splitLines(value).map((line) => {
    const [label = "", valuePart = "", note = ""] = line.split("|").map((part) => part.trim());
    return { label, value: valuePart, note };
  }).filter((item) => item.label || item.value);
}

export function parseExperiences(value: string | undefined | null): ExperienceItem[] {
  return splitLines(value).map((line) => {
    const [title = "", company = "", period = "", type = "", description = ""] = line.split("||").map((part) => part.trim());
    return { title, company, period, type, description };
  }).filter((item) => item.title || item.company || item.description);
}

export function parseFaqs(value: string | undefined | null): FaqItem[] {
  return splitLines(value).map((line) => {
    const [question = "", answer = ""] = line.split("||").map((part) => part.trim());
    return { question, answer };
  }).filter((item) => item.question || item.answer);
}

export function parseEducation(value: string | undefined | null): EducationItem[] {
  return splitLines(value).map((line) => {
    const [year = "", title = "", institution = "", description = ""] = line.split("||").map((part) => part.trim());
    return { year, title, institution, description };
  }).filter((item) => item.title || item.institution || item.description);
}

export function parseStoryTimeline(value: string | undefined | null): StoryItem[] {
  return splitLines(value).map((line) => {
    const [year = "", title = "", description = "", icon = "Sparkles"] = line.split("||").map((part) => part.trim());
    return { year, title, description, icon };
  }).filter((item) => item.year || item.title || item.description);
}

export function parseCertifications(value: string | undefined | null): CertificationItem[] {
  return splitLines(value).map((line) => {
    const [name = "", year = ""] = line.split("||").map((part) => part.trim());
    return { name, year };
  }).filter((item) => item.name || item.year);
}

export function parseCreativeProjects(value: string | undefined | null): CreativeProjectItem[] {
  return splitLines(value).map((line) => {
    const [title = "", category = "", icon = "Palette", description = ""] = line.split("||").map((part) => part.trim());
    return { title, category, icon, description };
  }).filter((item) => item.title || item.description);
}

export function parsePublications(value: string | undefined | null): PublicationItem[] {
  return splitLines(value).map((line) => {
    const [title = "", type = "", year = "", status = "", downloadUrl = "", description = ""] = line.split("||").map((part) => part.trim());
    return { title, type, year, status, downloadUrl, description };
  }).filter((item) => item.title || item.description);
}

export function parseNameList(value: string | undefined | null): string[] {
  return splitLines(value)
    .flatMap((line) => line.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinLines(values: string[]): string {
  return values.join("\n");
}
