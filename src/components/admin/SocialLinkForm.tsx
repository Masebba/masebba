import React, { useEffect, useState } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { SocialLink } from "../../types";

interface SocialLinkFormProps {
  initialData?: Partial<SocialLink>;
  onSubmit: (data: Partial<SocialLink>) => void;
  onCancel: () => void;
}

interface FormErrors {
  platform?: string;
  url?: string;
}

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizePlatform(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeUrl(value: string): string {
  return value.trim();
}

export function SocialLinkForm({
  initialData,
  onSubmit,
  onCancel,
}: SocialLinkFormProps) {
  const [formData, setFormData] = useState<Partial<SocialLink>>({
    platform: "",
    url: "",
    isVisible: true,
    ...initialData,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setFormData({
      platform: "",
      url: "",
      isVisible: true,
      ...initialData,
    });
    setErrors({});
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    const platform = normalizePlatform(formData.platform || "");
    const url = normalizeUrl(formData.url || "");

    if (!platform) {
      nextErrors.platform = "Platform name is required.";
    } else if (platform.length > 80) {
      nextErrors.platform = "Platform name must be 80 characters or less.";
    }

    if (!url) {
      nextErrors.url = "URL is required.";
    } else if (!isValidUrl(url)) {
      nextErrors.url = "Enter a valid http or https URL.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      platform: normalizePlatform(formData.platform || ""),
      url: normalizeUrl(formData.url || ""),
      isVisible: Boolean(formData.isVisible),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Platform Name"
        name="platform"
        value={formData.platform || ""}
        onChange={handleChange}
        placeholder="e.g., GitHub, LinkedIn, Twitter"
        required
        error={errors.platform}
      />

      <Input
        label="URL"
        name="url"
        type="url"
        value={formData.url || ""}
        onChange={handleChange}
        placeholder="https://..."
        required
        error={errors.url}
      />

      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          id="isVisible"
          name="isVisible"
          checked={Boolean(formData.isVisible)}
          onChange={handleChange}
          className="rounded border-border text-primary focus:ring-primary"
        />
        <label htmlFor="isVisible" className="text-sm font-medium text-main">
          Visible on public site
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Link</Button>
      </div>
    </form>
  );
}
