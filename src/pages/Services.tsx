import React from 'react';
import { ServiceCard } from '../components/ServiceCard';
import { CTASection } from '../components/home/CTASection';
import { useServices } from '../lib/hooks/useServices';
import { CodeIcon, SmartphoneIcon, PenToolIcon, ServerIcon, CloudIcon, LightbulbIcon } from 'lucide-react';
import { SkeletonCard } from '../components/ui/Skeleton';

const iconMap: Record<string, any> = {
  Code: CodeIcon,
  Smartphone: SmartphoneIcon,
  PenTool: PenToolIcon,
  Server: ServerIcon,
  Cloud: CloudIcon,
  Lightbulb: LightbulbIcon,
};

export function Services() {
  const { services, loading } = useServices(true);

  if (loading && services.length === 0) {
    return (
      <div className="flex-1 flex flex-col w-full">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-16 max-w-3xl mx-auto space-y-3">
            <div className="h-4 w-24 rounded-full bg-surface animate-pulse mx-auto" />
            <div className="h-12 w-80 max-w-full rounded-full bg-surface animate-pulse mx-auto" />
            <div className="h-5 w-full max-w-2xl rounded-full bg-surface animate-pulse mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-main mb-6">My Services</h1>
          <p className="text-lg text-muted leading-relaxed">I offer a comprehensive range of technical services to help bring your ideas to life. From initial concept and design to full-stack development and deployment.</p>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-20 text-muted">No services available at the moment.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {services.map((service) => (
              <ServiceCard key={service.id} title={service.title} description={service.description} icon={iconMap[service.icon] || CodeIcon} />
            ))}
          </div>
        )}
      </div>

      <CTASection />
    </div>
  );
}
