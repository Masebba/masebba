export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin';
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactLocation: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBackgroundImageUrl: string;
  heroCounters: string;
  aboutHeading: string;
  aboutSubheading: string;
  aboutBio: string;
  aboutImageUrl: string;
  aboutSoftSkills: string;
  aboutSkillsTechnologies: string;
  aboutWorkExperience: string;
  aboutFaqs: string;
  aboutStoryTimeline: string;
  aboutEducation: string;
  aboutCertifications: string;
  portfolioNonTechProjects: string;
  portfolioPublications: string;
  resumeUrl: string;
  logoUrl: string;
  faviconUrl: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  isVisible: boolean;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: any;
  isDeleted?: boolean;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  detailImage1?: string;
  detailImage2?: string;
  technologies: string[];
  liveLink?: string;
  sourceLink?: string;
  isFeatured: boolean;
  showOnHome: boolean;
  order: number;
  homeOrder: number;
  createdAt: any;
  updatedAt?: any;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: any;
  isDeleted?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  categories: string[];
  category?: string;
  tags: string[];
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: any;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: any;
  isDeleted?: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  subject?: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: any;
  updatedAt?: any;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: any;
  isDeleted?: boolean;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  isVisible: boolean;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: any;
  isDeleted?: boolean;
}
