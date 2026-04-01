import React, { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { DataTable } from "../../components/admin/DataTable";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { SocialLinkForm } from "../../components/admin/SocialLinkForm";
import { Spinner } from "../../components/ui/Spinner";
import type { SiteSettings as SiteSettingsType, SocialLink } from "../../types";
import { useSiteSettings } from "../../lib/hooks/useSiteSettings";
import { useSocialLinks } from "../../lib/hooks/useSocialLinks";
import { PlusIcon, EditIcon, TrashIcon, CheckCircleIcon } from "lucide-react";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file locally."));
    reader.readAsDataURL(file);
  });
}

export function SiteSettings() {
  const { settings, loading: settingsLoading, updateSettings } = useSiteSettings();
  const {
    links: socialLinks,
    loading: linksLoading,
    addLink: addSocialLink,
    updateLink: updateSocialLink,
    deleteLink: deleteSocialLink,
  } = useSocialLinks();

  const [formData, setFormData] = useState<Partial<SiteSettingsType>>(settings);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProcessingLink, setIsProcessingLink] = useState(false);

  const [heroBgFile, setHeroBgFile] = useState<File | null>(null);
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  const [heroBgPreview, setHeroBgPreview] = useState(settings.heroBackgroundImageUrl || "");
  const [aboutImagePreview, setAboutImagePreview] = useState(settings.aboutImageUrl || "");
  const [logoPreview, setLogoPreview] = useState(settings.logoUrl || "");
  const [faviconPreview, setFaviconPreview] = useState(settings.faviconUrl || "");

  useEffect(() => {
    setFormData(settings);
    setHeroBgPreview(settings.heroBackgroundImageUrl || "");
    setAboutImagePreview(settings.aboutImageUrl || "");
    setLogoPreview(settings.logoUrl || "");
    setFaviconPreview(settings.faviconUrl || "");
  }, [settings]);

  useEffect(() => {
    if (!heroBgFile) return;
    const url = URL.createObjectURL(heroBgFile);
    setHeroBgPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [heroBgFile]);

  useEffect(() => {
    if (!aboutImageFile) return;
    const url = URL.createObjectURL(aboutImageFile);
    setAboutImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [aboutImageFile]);

  useEffect(() => {
    if (!logoFile) return;
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  useEffect(() => {
    if (!faviconFile) return;
    const url = URL.createObjectURL(faviconFile);
    setFaviconPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [faviconFile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const fields = [
      ["siteName", 120],
      ["siteDescription", 500],
      ["contactEmail", 120],
      ["contactPhone", 60],
      ["contactWhatsapp", 60],
      ["contactLocation", 120],
      ["heroTitle", 120],
      ["heroSubtitle", 500],
      ["aboutHeading", 120],
      ["aboutSubheading", 160],
      ["aboutBio", 5000],
    ] as const;

    fields.forEach(([key, max]) => {
      const value = String((formData as any)[key] || "").trim();
      if (value.length > max) nextErrors[key] = `${key} must be ${max} characters or less.`;
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const basePayload: Partial<SiteSettingsType> = {
        siteName: String(formData.siteName || "").trim(),
        siteDescription: String(formData.siteDescription || "").trim(),
        contactEmail: String(formData.contactEmail || "").trim(),
        contactPhone: String(formData.contactPhone || "").trim(),
        contactWhatsapp: String(formData.contactWhatsapp || "").trim(),
        contactLocation: String(formData.contactLocation || "").trim(),
        heroTitle: String(formData.heroTitle || "").trim(),
        heroSubtitle: String(formData.heroSubtitle || "").trim(),
        heroCounters: String(formData.heroCounters || "").trim(),
        aboutHeading: String(formData.aboutHeading || "").trim(),
        aboutSubheading: String(formData.aboutSubheading || "").trim(),
        aboutBio: String(formData.aboutBio || "").trim(),
        aboutSoftSkills: String(formData.aboutSoftSkills || "").trim(),
        aboutSkillsTechnologies: String(formData.aboutSkillsTechnologies || "").trim(),
        aboutWorkExperience: String(formData.aboutWorkExperience || "").trim(),
        aboutStoryTimeline: String(formData.aboutStoryTimeline || "").trim(),
        aboutFaqs: String(formData.aboutFaqs || "").trim(),
        aboutEducation: String(formData.aboutEducation || "").trim(),
        aboutCertifications: String(formData.aboutCertifications || "").trim(),
        portfolioNonTechProjects: String(formData.portfolioNonTechProjects || "").trim(),
        portfolioPublications: String(formData.portfolioPublications || "").trim(),
      };

      const payload: Partial<SiteSettingsType> = {
        ...basePayload,
      };

      if (heroBgFile) payload.heroBackgroundImageUrl = await fileToDataUrl(heroBgFile);
      if (aboutImageFile) payload.aboutImageUrl = await fileToDataUrl(aboutImageFile);
      if (resumeFile) payload.resumeUrl = await fileToDataUrl(resumeFile);
      if (logoFile) payload.logoUrl = await fileToDataUrl(logoFile);
      if (faviconFile) payload.faviconUrl = await fileToDataUrl(faviconFile);

      const result = await updateSettings(payload);
      if (result.error) {
        throw new Error(result.error);
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      setHeroBgFile(null);
      setAboutImageFile(null);
      setResumeFile(null);
      setLogoFile(null);
      setFaviconFile(null);
    } catch (error: any) {
      console.error("Error saving settings:", error);
      alert(error.message || "Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLink = async (data: Partial<SocialLink>) => {
    setIsProcessingLink(true);
    try {
      if (editingLink) {
        await updateSocialLink(editingLink.id, data);
      } else {
        await addSocialLink(data as Omit<SocialLink, "id">);
      }
      setIsSocialModalOpen(false);
      setEditingLink(null);
    } catch (error) {
      console.error("Error saving social link:", error);
      alert("Failed to save social link.");
    } finally {
      setIsProcessingLink(false);
    }
  };

  const handleDeleteLink = async () => {
    if (!linkToDelete) return;
    setIsProcessingLink(true);
    try {
      await deleteSocialLink(linkToDelete);
      setLinkToDelete(null);
    } catch (error) {
      console.error("Error deleting social link:", error);
      alert("Failed to delete social link.");
    } finally {
      setIsProcessingLink(false);
    }
  };

  const socialColumns = [
    { header: "Platform", accessor: "platform" as keyof SocialLink },
    { header: "URL", accessor: "url" as keyof SocialLink },
    { header: "Visible", cell: (item: SocialLink) => (item.isVisible ? "Yes" : "No") },
    {
      header: "Actions",
      className: "text-right",
      cell: (item: SocialLink) => (
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => { setEditingLink(item); setIsSocialModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
            <EditIcon className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => { setLinkToDelete(item.id); setIsDeleteModalOpen(true); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const fileInputClass = "block w-full text-sm text-muted file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white hover:file:opacity-90";

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-main">Site Settings</h1>
          <p className="text-muted mt-1">Manage global configuration for your portfolio.</p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-md">
            <CheckCircleIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Settings saved successfully</span>
          </div>
        )}
      </div>

      {settingsLoading ? (
        <div className="flex justify-center items-center p-12"><Spinner size="lg" /></div>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-8">
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-main border-b border-border pb-4 mb-6">General & Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Input label="Site Name" name="siteName" value={formData.siteName || ""} onChange={handleChange} error={errors.siteName} />
              <Input label="Contact Email" name="contactEmail" type="email" value={formData.contactEmail || ""} onChange={handleChange} error={errors.contactEmail} />
              <Input label="Contact Phone" name="contactPhone" value={formData.contactPhone || ""} onChange={handleChange} error={errors.contactPhone} />
              <Input label="WhatsApp Number" name="contactWhatsapp" value={formData.contactWhatsapp || ""} onChange={handleChange} error={errors.contactWhatsapp} />
              <Input label="Location" name="contactLocation" value={formData.contactLocation || ""} onChange={handleChange} error={errors.contactLocation} />
            </div>
            <Textarea label="Site Description (SEO)" name="siteDescription" rows={3} value={formData.siteDescription || ""} onChange={handleChange} error={errors.siteDescription} />
          </Card>

          <Card padding="lg">
            <h3 className="text-lg font-semibold text-main border-b border-border pb-4 mb-6">Hero Section</h3>
            <div className="space-y-6">
              <Input label="Hero Title" name="heroTitle" value={formData.heroTitle || ""} onChange={handleChange} error={errors.heroTitle} />
              <Textarea label="Hero Subtitle" name="heroSubtitle" rows={3} value={formData.heroSubtitle || ""} onChange={handleChange} error={errors.heroSubtitle} />
              <Textarea
                label="Hero Counters"
                name="heroCounters"
                rows={4}
                value={formData.heroCounters || ""}
                onChange={handleChange}
                placeholder={"Years Experience|5+\nProjects Completed|50+\nHappy Clients|30+"}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-main">Hero Background Image</label>
                <input type="file" accept="image/*" onChange={(e) => setHeroBgFile(e.target.files?.[0] || null)} className={fileInputClass} />
                {heroBgPreview && <img src={heroBgPreview} alt="Hero background preview" className="w-full max-h-60 object-cover rounded-lg border border-border" />}
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="text-lg font-semibold text-main border-b border-border pb-4 mb-6">About Page Content</h3>
            <div className="space-y-6">
              <Input label="About Heading" name="aboutHeading" value={formData.aboutHeading || ""} onChange={handleChange} error={errors.aboutHeading} />
              <Input label="About Subheading" name="aboutSubheading" value={formData.aboutSubheading || ""} onChange={handleChange} error={errors.aboutSubheading} />
              <Textarea label="Professional Story / Biography" name="aboutBio" rows={6} value={formData.aboutBio || ""} onChange={handleChange} error={errors.aboutBio} />
              <div className="space-y-2">
                <label className="text-sm font-medium text-main">About Image</label>
                <input type="file" accept="image/*" onChange={(e) => setAboutImageFile(e.target.files?.[0] || null)} className={fileInputClass} />
                {aboutImagePreview && <img src={aboutImagePreview} alt="About preview" className="w-full max-h-72 object-cover rounded-lg border border-border" />}
              </div>
              <Textarea label="Soft Skills" name="aboutSoftSkills" rows={4} value={formData.aboutSoftSkills || ""} onChange={handleChange} placeholder={"Communication\nTeamwork\nProblem Solving"} />
              <Textarea label="Skills & Technologies" name="aboutSkillsTechnologies" rows={4} value={formData.aboutSkillsTechnologies || ""} onChange={handleChange} placeholder={"React\nTypeScript\nFirebase"} />
              <Textarea label="Work Experience" name="aboutWorkExperience" rows={6} value={formData.aboutWorkExperience || ""} onChange={handleChange} placeholder={"Senior Frontend Engineer||Tech Innovators Inc.||2021 - Present||Remote||Leading the frontend team in building scalable web applications."} />
              <Textarea label="Professional Story / Timeline" name="aboutStoryTimeline" rows={8} value={formData.aboutStoryTimeline || ""} onChange={handleChange} placeholder={`2016||The Beginning||Started my journey in web development.||Rocket\n2017||First Major Project||Delivered my first enterprise-level project.||Zap`} />
              <Textarea label="Frequently Asked Questions" name="aboutFaqs" rows={6} value={formData.aboutFaqs || ""} onChange={handleChange} placeholder={"What kind of work do you do?||I build websites, dashboards, and mobile-friendly systems."} />
              <Textarea label="Education & Credentials" name="aboutEducation" rows={6} value={formData.aboutEducation || ""} onChange={handleChange} placeholder={"2024||Professional Certification||Tech Academy||Specialized training in full-stack development."} />
              <Textarea label="Certifications" name="aboutCertifications" rows={6} value={formData.aboutCertifications || ""} onChange={handleChange} placeholder={`AWS Certified Solutions Architect||2023\nMeta Frontend Developer Certificate||2023`} />
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="text-lg font-semibold text-main border-b border-border pb-4 mb-6">Portfolio Content</h3>
            <div className="space-y-6">
              <Textarea label="Non-Tech Projects" name="portfolioNonTechProjects" rows={6} value={formData.portfolioNonTechProjects || ""} onChange={handleChange} placeholder={"Photography Portfolio||Creative||Camera||Visual work and creative experiments."} />
              <Textarea label="Papers / Proposals / Concept Notes" name="portfolioPublications" rows={8} value={formData.portfolioPublications || ""} onChange={handleChange} placeholder={"AI-Driven User Experience Optimization||Concept Note||2024||In Review||#||Exploring how machine learning can personalize UI/UX."} />
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="text-lg font-semibold text-main border-b border-border pb-4 mb-6">Brand Assets & CV</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-main">Upload CV (PDF / DOCX)</label>
                <input type="file" accept="application/pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} className={fileInputClass} />
                {resumeFile ? <p className="text-xs text-muted">Selected: {resumeFile.name}</p> : <p className="text-xs text-muted">Current file: {formData.resumeUrl || 'None'}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-main">Logo Image</label>
                  <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className={fileInputClass} />
                  {logoPreview && <img src={logoPreview} alt="Logo preview" className="h-20 w-20 object-contain rounded-lg border border-border bg-background p-2" />}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-main">Favicon Image</label>
                  <input type="file" accept="image/*" onChange={(e) => setFaviconFile(e.target.files?.[0] || null)} className={fileInputClass} />
                  {faviconPreview && <img src={faviconPreview} alt="Favicon preview" className="h-16 w-16 object-contain rounded-lg border border-border bg-background p-2" />}
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" isLoading={isSaving}>Save All Settings</Button>
          </div>
        </form>
      )}

      <Card padding="lg">
        <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
          <h3 className="text-lg font-semibold text-main">Social Links</h3>
          <Button type="button" size="sm" className="gap-2" onClick={() => { setEditingLink(null); setIsSocialModalOpen(true); }}>
            <PlusIcon className="w-4 h-4" /> Add Link
          </Button>
        </div>

        {linksLoading ? (
          <div className="flex justify-center items-center p-6"><Spinner /></div>
        ) : (
          <DataTable columns={socialColumns} data={socialLinks} keyExtractor={(item) => item.id} />
        )}
      </Card>

      <Modal isOpen={isSocialModalOpen} onClose={() => setIsSocialModalOpen(false)} title={editingLink ? "Edit Social Link" : "Add Social Link"}>
        <SocialLinkForm initialData={editingLink || undefined} onSubmit={handleSaveLink} onCancel={() => setIsSocialModalOpen(false)} />
      </Modal>

      <ConfirmDialog isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteLink} title="Delete Social Link" message="Are you sure you want to delete this social link? This action cannot be undone." />
    </div>
  );
}

export default SiteSettings;
