import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { RichTextEditor } from "../../components/admin/RichTextEditor";
import { BlogPost } from "../../types";
import { useBlogPosts } from "../../lib/hooks/useBlogPosts";
import { Spinner } from "../../components/ui/Spinner";
import { sanitizeHtml } from "../../lib/sanitize";
import { prepareInlineImageDataUrl } from "../../lib/media";

type FormErrors = Partial<
  Record<
    | "title"
    | "slug"
    | "excerpt"
    | "content"
    | "coverImage"
    | "category"
    | "status",
    string
  >
>;

const MAX_TITLE_LENGTH = 160;
const MAX_EXCERPT_LENGTH = 500;
const MAX_SLUG_LENGTH = 120;
const MAX_CONTENT_LENGTH = 200000;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-")
    .slice(0, MAX_SLUG_LENGTH);
}

function stripHtmlForValidation(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html || "", "text/html");
  return (doc.body.textContent || "").trim();
}


export function BlogPostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const { posts, loading: postsLoading, addPost, updatePost } = useBlogPosts();

  const [isSaving, setIsSaving] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: "",
    slug: "",
    excerpt: "",
    content: "<p>Start writing your post here...</p>",
    category: "Development",
    status: "draft",
    coverImage: "",
    tags: [],
  });

  useEffect(() => {
    if (isEditing && !postsLoading && !initialLoadDone) {
      const existingPost = posts.find((p) => p.id === id);

      if (existingPost) {
        setFormData({
          title: existingPost.title || "",
          slug: existingPost.slug || "",
          excerpt: existingPost.excerpt || "",
          content: existingPost.content || "<p></p>",
          category: existingPost.categories?.[0] || "Development",
          status: existingPost.status || "draft",
          coverImage: existingPost.coverImage || "",
          tags: existingPost.tags || [],
        });
        setCoverPreview(existingPost.coverImage || "");
      }

      setInitialLoadDone(true);
    }
  }, [isEditing, posts, postsLoading, id, initialLoadDone]);

  useEffect(() => {
    if (!isEditing && formData.title) {
      const generatedSlug = slugify(formData.title);
      setFormData((prev) => ({
        ...prev,
        slug: prev.slug?.trim() ? prev.slug : generatedSlug,
      }));
    }
  }, [formData.title, isEditing]);

  useEffect(() => {
    if (!coverFile) return;

    const objectUrl = URL.createObjectURL(coverFile);
    setCoverPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [coverFile]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
    setErrors((prev) => ({
      ...prev,
      content: undefined,
    }));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (!file) return;

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
    const slug = (formData.slug || "").trim();
    const excerpt = (formData.excerpt || "").trim();
    const content = formData.content || "";
    const category = (formData.category || "").trim();
    const status = (formData.status || "").trim();

    if (!title) {
      nextErrors.title = "Title is required.";
    } else if (title.length > MAX_TITLE_LENGTH) {
      nextErrors.title = `Title must be ${MAX_TITLE_LENGTH} characters or less.`;
    }

    if (!slug) {
      nextErrors.slug = "Slug is required.";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      nextErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens.";
    } else if (slug.length > MAX_SLUG_LENGTH) {
      nextErrors.slug = `Slug must be ${MAX_SLUG_LENGTH} characters or less.`;
    }

    if (excerpt.length > MAX_EXCERPT_LENGTH) {
      nextErrors.excerpt = `Excerpt must be ${MAX_EXCERPT_LENGTH} characters or less.`;
    }

    if (!stripHtmlForValidation(content)) {
      nextErrors.content = "Content cannot be empty.";
    } else if (content.length > MAX_CONTENT_LENGTH) {
      nextErrors.content = `Content is too long. Keep it under ${MAX_CONTENT_LENGTH} characters.`;
    }

    if (!category) {
      nextErrors.category = "Category is required.";
    }

    if (!["draft", "published"].includes(status)) {
      nextErrors.status = "Status must be draft or published.";
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
        coverImage = await prepareInlineImageDataUrl(coverFile, {
          maxWidth: 1400,
          maxHeight: 1400,
          quality: 0.82,
          maxInputBytes: 5 * 1024 * 1024,
          maxOutputBytes: 250 * 1024,
        });
        setUploadProgress(100);
      }

      const postData = {
        title: (formData.title || "").trim(),
        slug: slugify((formData.slug || "").trim() || formData.title || "post"),
        excerpt: (formData.excerpt || "").trim(),
        content: sanitizeHtml(formData.content || ""),
        categories: [(formData.category || "Development") as string],
        tags: formData.tags || [],
        status: (formData.status || "draft") as "draft" | "published",
        coverImage,
      };

      const result =
        isEditing && id
          ? await updatePost(id, postData)
          : await addPost(postData);

      if ((result as any)?.error) {
        throw new Error((result as any).error);
      }

      navigate("/admin/blog");
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Failed to save post.");
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  };

  if (isEditing && postsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/blog")}
            className="p-2 rounded-full hover:bg-surface text-muted hover:text-main transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-main">
              {isEditing ? "Edit Post" : "Create New Post"}
            </h1>
            <p className="text-sm text-muted">
              Write and publish your blog content.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/blog")}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button type="submit" className="gap-2" isLoading={isSaving}>
            <SaveIcon className="w-4 h-4" />
            Save Post
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg">
            <div className="space-y-6">
              <Input
                label="Post Title"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                placeholder="Enter an engaging title..."
                required
                error={errors.title}
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-main">Content</label>
                <RichTextEditor
                  content={formData.content || ""}
                  onChange={handleContentChange}
                />
                {errors.content ? (
                  <p className="text-sm text-red-500 mt-1">{errors.content}</p>
                ) : null}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-main mb-4 border-b border-border pb-2">
              Publishing
            </h3>

            <div className="space-y-4">
              <Select
                label="Status"
                name="status"
                value={formData.status || "draft"}
                onChange={handleChange}
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "published", label: "Published" },
                ]}
              />
              {errors.status ? (
                <p className="text-sm text-red-500">{errors.status}</p>
              ) : null}

              <Input
                label="URL Slug"
                name="slug"
                value={formData.slug || ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    slug: raw.toLowerCase(),
                  }));
                  setErrors((prev) => ({ ...prev, slug: undefined }));
                }}
                placeholder="my-post-url"
                error={errors.slug}
              />

              <Select
                label="Category"
                name="category"
                value={formData.category as string}
                onChange={handleChange}
                options={[
                  { value: "Development", label: "Development" },
                  { value: "Design", label: "Design" },
                  { value: "Backend", label: "Backend" },
                  { value: "DevOps", label: "DevOps" },
                ]}
              />
              {errors.category ? (
                <p className="text-sm text-red-500">{errors.category}</p>
              ) : null}
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="text-lg font-semibold text-main mb-4 border-b border-border pb-2">
              Meta & SEO
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-main">
                  Cover Image
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
                      Upload an image instead of pasting a URL. JPG, PNG, WebP,
                      GIF, or AVIF up to 5MB.
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

              <Textarea
                label="Excerpt"
                name="excerpt"
                value={formData.excerpt || ""}
                onChange={handleChange}
                placeholder="Brief summary for preview cards..."
                rows={4}
                error={errors.excerpt}
              />
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
