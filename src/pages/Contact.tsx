import React, { useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { ContactInfoCard } from "../components/ContactInfoCard";
import {
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SendIcon,
  CheckCircleIcon,
  MessageCircleIcon,
} from "lucide-react";
import { useSiteSettings } from "../lib/hooks/useSiteSettings";
import { useSocialLinks } from "../lib/hooks/useSocialLinks";
import { useMessages } from "../lib/hooks/useMessages";

type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export function Contact() {
  const { settings } = useSiteSettings();
  const { links: socialLinks } = useSocialLinks(true);
  const { addMessage } = useMessages();

  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await addMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setErrors({});
      setIsSuccess(true);

      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (errors[id as keyof ContactFormData]) {
      setErrors((prev) => ({
        ...prev,
        [id]: "",
      }));
    }
  };

  const whatsappNumber =
    settings.contactWhatsapp || settings.contactPhone || "";
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}`
    : "";

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-6xl">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-main mb-6">
          Let's Work Together
        </h1>
        <p className="text-lg text-muted leading-relaxed">
          Have a project in mind, a question, or just want to say hi? Fill out
          the form below and I'll get back to you as soon as possible.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-main mb-6">Contact Info</h3>
            <div className="space-y-1">
              <ContactInfoCard
                icon={MailIcon}
                label="Email"
                value={settings.contactEmail}
                href={`mailto:${settings.contactEmail}`}
              />
              <ContactInfoCard
                icon={PhoneIcon}
                label="Phone"
                value={settings.contactPhone}
              />
              {whatsappHref && (
                <ContactInfoCard
                  icon={MessageCircleIcon}
                  label="WhatsApp"
                  value={settings.contactWhatsapp || settings.contactPhone}
                  href={whatsappHref}
                />
              )}
              <ContactInfoCard
                icon={MapPinIcon}
                label="Location"
                value={settings.contactLocation}
              />
            </div>
          </div>

          {socialLinks.length > 0 && (
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-bold text-main mb-4">
                Connect With Me
              </h3>
              <div className="flex gap-3 flex-wrap">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-full bg-surface border border-border text-sm font-medium text-muted hover:bg-primary hover:text-background hover:border-primary transition-colors"
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="pt-8 border-t border-border">
            <h3 className="text-lg font-bold text-main mb-3">Availability</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-main">
                Currently available for work
              </span>
            </div>
            <p className="text-sm text-muted">
              I typically respond within 24 hours. For urgent inquiries, please
              reach out via email or WhatsApp directly.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <Card padding="lg" className="shadow-xl">
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 text-center h-full min-h-[400px]">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircleIcon className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-main mb-2">
                  Message Sent!
                </h3>
                <p className="text-muted max-w-md">
                  Thank you for reaching out. I've received your message and
                  will get back to you shortly.
                </p>
                <Button
                  className="mt-8"
                  variant="outline"
                  onClick={() => setIsSuccess(false)}
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-main mb-2">
                    Send Me a Message
                  </h3>
                  <p className="text-muted">
                    Fill out the form and I'll respond as quickly as possible.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    id="name"
                    label="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                  />

                  <Input
                    id="email"
                    label="Your Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                  />
                </div>

                <Input
                  id="subject"
                  label="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  error={errors.subject}
                />

                <Textarea
                  id="message"
                  label="Your Message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  error={errors.message}
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="gap-2"
                    isLoading={isSubmitting}
                  >
                    <SendIcon className="w-4 h-4" />
                    Send Message
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
