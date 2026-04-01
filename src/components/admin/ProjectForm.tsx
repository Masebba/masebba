import React, { useEffect, useState } from "react";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { Project } from "../../types";

interface ProjectFormProps {
  initialData?: Partial<Project>;
  onSubmit: (data: Partial<Project>) => void;
  onCancel: () => void;
}

interface FormErrors {
  title?: string;
  category?: string;
  description?: string;
  technologies?: string;
  liveLink?: string;
  sourceLink?: string;
  coverImage?: string;
}

function stripHtml(input: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input || "", "text/html");
  return (doc.body.textContent || "").trim();
}

function isValidUrl(value: string): boolean {
  if (!value || value === "#") return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeTechList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index);
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

export function ProjectForm({
  initialData,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const [formData, setFormData] = useState<Partial<Project>>({
    title: "",
    category: "",
    description: "",
    coverImage: "",
    technologies: [],
    liveLink: "",
    sourceLink: "",
    isFeatured: false,
    ...initialData,
  });

  const [techInput, setTechInput] = useState(
    initialData?.technologies?.join(", ") || "",
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>(
    initialData?.coverImage || "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setFormData({
      title: "",
      category: "",
      description: "",
      coverImage: "",
      technologies: [],
      liveLink: "",
      sourceLink: "",
      isFeatured: false,
      ...initialData,
    });

    setTechInput(initialData?.technologies?.join(", ") || "");
    setCoverFile(null);
    setCoverPreview(initialData?.coverImage || "");
    setErrors({});
    setUploadProgress(0);
  }, [initialData]);

  useEffect(() => {
    if (!coverFile) return;

    const objectUrl = URL.createObjectURL(coverFile);
    setCoverPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [coverFile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleTechChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTechInput(value);

    setFormData((prev) => ({
      ...prev,
      technologies: normalizeTechList(value),
    }));

    setErrors((prev) => ({
      ...prev,
      technologies: undefined,
    }));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        coverImage: "Please choose a valid image file.",
      }));
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        coverImage: "Image must be smaller than 5MB.",
      }));
      e.target.value = "";
      return;
    }

    setCoverFile(file);
    setErrors((prev) => ({
      ...prev,
      coverImage: undefined,
    }));
  };

  const removeCoverImage = () => {
    setCoverFile(null);
    setCoverPreview("");
    setFormData((prev) => ({
      ...prev,
      coverImage: "",
    }));
    setErrors((prev) => ({
      ...prev,
      coverImage: undefined,
    }));
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    const title = (formData.title || "").trim();
    const category = (formData.category || "").trim();
    const description = stripHtml(formData.description || "");
    const liveLink = (formData.liveLink || "").trim();
    const sourceLink = (formData.sourceLink || "").trim();
    const technologies = formData.technologies || [];

    if (!title) {
      nextErrors.title = "Project title is required.";
    } else if (title.length > 120) {
      nextErrors.title = "Project title must be 120 characters or less.";
    }

    if (!category) {
      nextErrors.category = "Category is required.";
    } else if (category.length > 80) {
      nextErrors.category = "Category must be 80 characters or less.";
    }

    if (!description) {
      nextErrors.description = "Description is required.";
    } else if (description.length > 2000) {
      nextErrors.description = "Description must be 2000 characters or less.";
    }

    if (liveLink && !isValidUrl(liveLink)) {
      nextErrors.liveLink = "Live demo link must be a valid http or https URL or #.";
    }

    if (sourceLink && !isValidUrl(sourceLink)) {
      nextErrors.sourceLink =
        "Source code link must be a valid http or https URL or #.";
    }

    if (!Array.isArray(technologies)) {
      nextErrors.technologies = "Technologies must be a valid list.";
    } else if (technologies.some((tech) => tech.length > 40)) {
      nextErrors.technologies =
        "Each technology name must be 40 characters or less.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSaving(true);

    try {
      let coverImage = (formData.coverImage || "").trim();

      if (coverFile) {
        setUploadProgress(25);
        coverImage = await fileToDataUrl(coverFile);
        setUploadProgress(100);
      }

      const safeData: Partial<Project> = {
        title: (formData.title || "").trim(),
        category: (formData.category || "").trim(),
        description: stripHtml(formData.description || ""),
        coverImage,
        technologies: normalizeTechList(techInput),
        liveLink: (formData.liveLink || "").trim(),
        sourceLink: (formData.sourceLink || "").trim(),
        isFeatured: Boolean(formData.isFeatured),
      };

      onSubmit(safeData);
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Project Title"
          name="title"
          value={formData.title || ""}
          onChange={handleChange}
          required
          error={errors.title}
        />

        <Input
          label="Category"
          name="category"
          value={formData.category || ""}
          onChange={handleChange}
          required
          error={errors.category}
        />
      </div>

      <Textarea
        label="Description"
        name="description"
        value={formData.description || ""}
        onChange={handleChange}
        required
        rows={4}
        error={errors.description}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-main">
          Project Cover Image
        </label>
        <div className="rounded-lg border border-dashed border-border p-4 space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="block w-full text-sm text-muted file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white hover:file:opacity-90"
          />

          {coverPreview ? (
            <div className="space-y-3">
              <img
                src={coverPreview}
                alt="Cover preview"
                className="w-full max-h-56 object-cover rounded-lg border border-border"
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted break-all">
                  {coverFile ? coverFile.name : "Current cover image"}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={removeCoverImage}
                >
                  Remove Image
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">
              Upload an image instead of pasting a URL. JPG, PNG, WebP, GIF, or
              AVIF up to 5MB.
            </p>
          )}

          {uploadProgress > 0 && uploadProgress < 100 ? (
            <div className="space-y-1">
              <div className="h-2 rounded-full bg-surface overflow-hidden">
                <div
                  className="h-2 bg-primary transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted">
                Uploading image... {Math.round(uploadProgress)}%
              </p>
            </div>
          ) : null}

          {errors.coverImage ? (
            <p className="text-sm text-red-500">{errors.coverImage}</p>
          ) : null}
        </div>
      </div>

      <Input
        label="Technologies (comma separated)"
        value={techInput}
        onChange={handleTechChange}
        placeholder="React, Node.js, Tailwind..."
        error={errors.technologies}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Live Demo URL"
          name="liveLink"
          value={formData.liveLink || ""}
          onChange={handleChange}
          placeholder="https://..."
          error={errors.liveLink}
        />

        <Input
          label="Source Code URL"
          name="sourceLink"
          value={formData.sourceLink || ""}
          onChange={handleChange}
          placeholder="https://..."
          error={errors.sourceLink}
        />
      </div>

      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          id="isFeatured"
          name="isFeatured"
          checked={Boolean(formData.isFeatured)}
          onChange={handleChange}
          className="rounded border-border text-primary focus:ring-primary"
        />

        <label htmlFor="isFeatured" className="text-sm font-medium text-main">
          Feature on homepage
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isSaving}>
          Save Project
        </Button>
      </div>
    </form>
  );
}
