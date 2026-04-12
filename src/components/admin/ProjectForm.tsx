import React, { useEffect, useMemo, useState } from "react";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { Project } from "../../types";
import { uploadImage } from "../../lib/storage";

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
  detailImage1?: string;
  detailImage2?: string;
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

type ImageFieldKey = "coverImage" | "detailImage1" | "detailImage2";

interface ImageFileState {
  file: File | null;
  preview: string;
}

const emptyImageState: ImageFileState = {
  file: null,
  preview: "",
};

function ImageUploadSection({
  label,
  fieldKey,
  description,
  fileState,
  error,
  onFileChange,
  onRemove,
}: {
  label: string;
  fieldKey: ImageFieldKey;
  description: string;
  fileState: ImageFileState;
  error?: string;
  onFileChange: (fieldKey: ImageFieldKey, file: File | null) => void;
  onRemove: (fieldKey: ImageFieldKey) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-main">{label}</label>
      <div className="rounded-lg border border-dashed border-border p-4 space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onFileChange(fieldKey, e.target.files?.[0] || null)}
          className="block w-full text-sm text-muted file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white hover:file:opacity-90"
        />

        {fileState.preview ? (
          <div className="space-y-3">
            <img
              src={fileState.preview}
              alt={`${label} preview`}
              className="w-full max-h-56 object-cover rounded-lg border border-border"
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted break-all">
                {fileState.file ? fileState.file.name : "Current image"}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => onRemove(fieldKey)}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">{description}</p>
        )}

        {error ? <p className="text-sm text-red-500">{error}</p> : null}
      </div>
    </div>
  );
}

async function uploadSelectedImage(
  file: File,
  fieldKey: ImageFieldKey,
  setUploadProgress: (value: number) => void,
): Promise<string> {
  const path = `projects/${fieldKey}/${Date.now()}-${safeFileName(file.name)}`;
  const result = await uploadImage(file, path, (progress) => {
    setUploadProgress(progress);
  });

  if (result.error || !result.url) {
    throw new Error(result.error || "Failed to upload image.");
  }

  return result.url;
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
    detailImage1: "",
    detailImage2: "",
    technologies: [],
    liveLink: "",
    sourceLink: "",
    isFeatured: false,
    showOnHome: false,
    ...initialData,
  });

  const [techInput, setTechInput] = useState(
    initialData?.technologies?.join(", ") || "",
  );
  const [coverState, setCoverState] = useState<ImageFileState>({
    file: null,
    preview: initialData?.coverImage || "",
  });
  const [detail1State, setDetail1State] = useState<ImageFileState>({
    file: null,
    preview: initialData?.detailImage1 || "",
  });
  const [detail2State, setDetail2State] = useState<ImageFileState>({
    file: null,
    preview: initialData?.detailImage2 || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeUploadLabel, setActiveUploadLabel] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setFormData({
      title: "",
      category: "",
      description: "",
      coverImage: "",
      detailImage1: "",
      detailImage2: "",
      technologies: [],
      liveLink: "",
      sourceLink: "",
      isFeatured: false,
      showOnHome: false,
      ...initialData,
    });

    setTechInput(initialData?.technologies?.join(", ") || "");
    setCoverState({
      file: null,
      preview: initialData?.coverImage || "",
    });
    setDetail1State({
      file: null,
      preview: initialData?.detailImage1 || "",
    });
    setDetail2State({
      file: null,
      preview: initialData?.detailImage2 || "",
    });
    setErrors({});
    setUploadProgress(0);
    setActiveUploadLabel(null);
  }, [initialData]);

  const imageStateMap = useMemo(
    () => ({
      coverImage: coverState,
      detailImage1: detail1State,
      detailImage2: detail2State,
    }),
    [coverState, detail1State, detail2State],
  );

  const setImageState = (
    fieldKey: ImageFieldKey,
    updater: (prev: ImageFileState) => ImageFileState,
  ) => {
    if (fieldKey === "coverImage") {
      setCoverState(updater);
    } else if (fieldKey === "detailImage1") {
      setDetail1State(updater);
    } else {
      setDetail2State(updater);
    }
  };

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

  const handleImageChange = (fieldKey: ImageFieldKey, file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        [fieldKey]: "Please choose a valid image file.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [fieldKey]: "Image must be smaller than 5MB.",
      }));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImageState(fieldKey, () => ({
      file,
      preview: objectUrl,
    }));
    setErrors((prev) => ({
      ...prev,
      [fieldKey]: undefined,
    }));
  };

  const removeImage = (fieldKey: ImageFieldKey) => {
    setImageState(fieldKey, () => ({
      file: null,
      preview: "",
    }));

    setFormData((prev) => ({
      ...prev,
      [fieldKey]: "",
    }));

    setErrors((prev) => ({
      ...prev,
      [fieldKey]: undefined,
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

  const finalizeImageValue = async (
    fieldKey: ImageFieldKey,
    currentValue: string,
  ): Promise<string> => {
    const file = imageStateMap[fieldKey].file;
    if (!file) {
      return currentValue.trim();
    }

    const label =
      fieldKey === "coverImage"
        ? "Project cover image"
        : fieldKey === "detailImage1"
          ? "Project detail image 1"
          : "Project detail image 2";

    setActiveUploadLabel(label);
    const uploadedUrl = await uploadSelectedImage(file, fieldKey, setUploadProgress);
    return uploadedUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSaving(true);

    try {
      const coverImage = await finalizeImageValue(
        "coverImage",
        (formData.coverImage || "").trim(),
      );
      const detailImage1 = await finalizeImageValue(
        "detailImage1",
        (formData.detailImage1 || "").trim(),
      );
      const detailImage2 = await finalizeImageValue(
        "detailImage2",
        (formData.detailImage2 || "").trim(),
      );

      const safeData: Partial<Project> = {
        title: (formData.title || "").trim(),
        category: (formData.category || "").trim(),
        description: stripHtml(formData.description || ""),
        coverImage,
        detailImage1,
        detailImage2,
        technologies: normalizeTechList(techInput),
        liveLink: (formData.liveLink || "").trim(),
        sourceLink: (formData.sourceLink || "").trim(),
        isFeatured: Boolean(formData.isFeatured),
        showOnHome: Boolean(formData.showOnHome),
      };

      onSubmit(safeData);
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        coverImage: prev.coverImage || err.message || "Failed to save project.",
      }));
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
      setActiveUploadLabel(null);
    }
  };

  const progressLabel = activeUploadLabel || "Uploading images...";

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

      <div className="space-y-4">
        <ImageUploadSection
          label="Project Cover Image"
          fieldKey="coverImage"
          description="Upload the main cover image shown on the portfolio cards. JPG, PNG, WebP, GIF, or AVIF up to 5MB."
          fileState={coverState}
          error={errors.coverImage}
          onFileChange={handleImageChange}
          onRemove={removeImage}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageUploadSection
            label="Project Detail Image 1"
            fieldKey="detailImage1"
            description="Upload the first gallery image shown inside the project details page."
            fileState={detail1State}
            error={errors.detailImage1}
            onFileChange={handleImageChange}
            onRemove={removeImage}
          />

          <ImageUploadSection
            label="Project Detail Image 2"
            fieldKey="detailImage2"
            description="Upload the second gallery image shown inside the project details page."
            fileState={detail2State}
            error={errors.detailImage2}
            onFileChange={handleImageChange}
            onRemove={removeImage}
          />
        </div>

        {uploadProgress > 0 && uploadProgress < 100 ? (
          <div className="space-y-1">
            <div className="h-2 rounded-full bg-surface overflow-hidden">
              <div
                className="h-2 bg-primary transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted">
              {progressLabel}... {Math.round(uploadProgress)}%
            </p>
          </div>
        ) : null}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <label className="flex items-center gap-2 text-sm font-medium text-main">
          <input
            type="checkbox"
            id="isFeatured"
            name="isFeatured"
            checked={Boolean(formData.isFeatured)}
            onChange={handleChange}
            className="rounded border-border text-primary focus:ring-primary"
          />
          Feature badge on card
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-main">
          <input
            type="checkbox"
            id="showOnHome"
            name="showOnHome"
            checked={Boolean(formData.showOnHome)}
            onChange={handleChange}
            className="rounded border-border text-primary focus:ring-primary"
          />
          Show on home page
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
