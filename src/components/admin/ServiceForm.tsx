import React, { useEffect, useMemo, useState } from "react";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { Service } from "../../types";

interface ServiceFormProps {
  initialData?: Partial<Service>;
  onSubmit: (data: Partial<Service>) => void;
  onCancel: () => void;
}

interface FormErrors {
  title?: string;
  description?: string;
  icon?: string;
  order?: string;
}

const PRELOADED_ICONS = [
  "Code",
  "Laptop",
  "Smartphone",
  "Palette",
  "Globe",
  "Database",
  "Cloud",
  "Shield",
  "Zap",
  "Layers",
  "PenTool",
  "Wrench",
  "LineChart",
  "MessageSquare",
  "Briefcase",
  "LayoutGrid",
  "Sparkles",
  "Brain",
  "BookOpen",
  "Camera",
];

function stripHtml(input: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input || "", "text/html");
  return (doc.body.textContent || "").trim();
}

function isValidIconName(value: string): boolean {
  return /^[A-Za-z][A-Za-z0-9]*$/.test(value);
}

export function ServiceForm({
  initialData,
  onSubmit,
  onCancel,
}: ServiceFormProps) {
  const [formData, setFormData] = useState<Partial<Service>>({
    title: "",
    description: "",
    icon: "Code",
    isVisible: true,
    order: 0,
    ...initialData,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setFormData({
      title: "",
      description: "",
      icon: "Code",
      isVisible: true,
      order: 0,
      ...initialData,
    });
    setErrors({});
  }, [initialData]);

  const iconOptions = useMemo(
    () => PRELOADED_ICONS.map((icon) => ({ value: icon, label: icon })),
    [],
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "order"
            ? value === ""
              ? ""
              : Number(value)
            : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    const title = (formData.title || "").trim();
    const description = stripHtml(formData.description || "");
    const icon = (formData.icon || "").trim();
    const order = formData.order;

    if (!title) {
      nextErrors.title = "Service title is required.";
    } else if (title.length > 120) {
      nextErrors.title = "Service title must be 120 characters or less.";
    }

    if (!description) {
      nextErrors.description = "Description is required.";
    } else if (description.length > 1000) {
      nextErrors.description = "Description must be 1000 characters or less.";
    }

    if (!icon) {
      nextErrors.icon = "Icon name is required.";
    } else if (!isValidIconName(icon)) {
      nextErrors.icon = "Icon name must be a valid Lucide icon name.";
    }

    if (order === null || order === undefined || Number.isNaN(Number(order))) {
      nextErrors.order = "Display order must be a number.";
    } else if (!Number.isInteger(Number(order))) {
      nextErrors.order = "Display order must be a whole number.";
    } else if (Number(order) < 0) {
      nextErrors.order = "Display order cannot be negative.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const safeData: Partial<Service> = {
      title: (formData.title || "").trim(),
      description: stripHtml(formData.description || ""),
      icon: (formData.icon || "").trim(),
      isVisible: Boolean(formData.isVisible),
      order: Number(formData.order ?? 0),
    };

    onSubmit(safeData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Service Title"
        name="title"
        value={formData.title || ""}
        onChange={handleChange}
        required
        error={errors.title}
      />

      <Textarea
        label="Description"
        name="description"
        value={formData.description || ""}
        onChange={handleChange}
        required
        rows={3}
        error={errors.description}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Choose a Preloaded Icon"
          name="iconPreset"
          value={PRELOADED_ICONS.includes(String(formData.icon || "")) ? String(formData.icon || "") : ""}
          onChange={(e) => {
            const value = e.target.value;
            setFormData((prev) => ({ ...prev, icon: value }));
            setErrors((prev) => ({ ...prev, icon: undefined }));
          }}
          options={iconOptions}
        />

        <Input
          label="Icon Name (Lucide)"
          name="icon"
          value={formData.icon || ""}
          onChange={handleChange}
          placeholder="e.g., Code, Smartphone, Rocket"
          required
          error={errors.icon}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Display Order"
          name="order"
          type="number"
          value={formData.order ?? 0}
          onChange={handleChange}
          required
          error={errors.order}
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
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Service</Button>
      </div>
    </form>
  );
}
