import React from 'react';
import { Code, Laptop, Smartphone, Palette, Globe, Database, Cloud, Shield, Zap, Layers, PenTool, Wrench, LineChart, MessageSquare, Briefcase, LayoutGrid, Sparkles, Brain, BookOpen, Camera, type LucideIcon } from 'lucide-react';
import { useServices } from '../../lib/hooks/useServices';
import { SkeletonCard } from '../ui/Skeleton';

const iconMap: Record<string, LucideIcon> = { Code, Laptop, Smartphone, Palette, Globe, Database, Cloud, Shield, Zap, Layers, PenTool, Wrench, LineChart, MessageSquare, Briefcase, LayoutGrid, Sparkles, Brain, BookOpen, Camera };

function normalizeIconName(value: unknown) {
  return String(value ?? '').trim().replace(/\s+/g, '').replace(/[-_]/g, '');
}

function resolveIcon(value: unknown): LucideIcon {
  const raw = String(value ?? '').trim();
  const normalized = normalizeIconName(raw);
  return iconMap[raw] || iconMap[normalized] || iconMap[normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase()] || Code;
}

export function FeaturedServices() {
  const { services, loading } = useServices(true);

  if (loading && services.length === 0) {
    return (
      <section className="py-20 md:py-24">
        <div className="container mx-auto w-full max-w-6xl px-4">
          <div className="text-center mb-12 space-y-3">
            <div className="h-4 w-24 rounded-full bg-surface animate-pulse mx-auto" />
            <div className="h-10 w-72 rounded-full bg-surface animate-pulse mx-auto" />
            <div className="h-4 w-full max-w-2xl rounded-full bg-surface animate-pulse mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)}
          </div>
        </div>
      </section>
    );
  }

  if (!services.length) return null;

  return (
    <section className="py-20 md:py-24">
      <div className="container mx-auto w-full max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">What I Do</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-main mb-4">Services & Expertise</h3>
          <p className="text-muted max-w-2xl mx-auto">I offer a comprehensive range of technical services to help bring your ideas to life. I’m passionate about creating work that feels clear, and modern. My focus is on solving real problems with simple design, strong structure, and careful attention to detail.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = resolveIcon(service.icon);
            return (
              <div key={service.id} className="group rounded-lg border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="mb-1 flex items-start justify-start items-center gap-4 md:gap-6">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary ring-1 ring-primary/10 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-semibold text-main mb-2">{service.title}</h4>
                </div>
                <p className="text-muted leading-relaxed">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
