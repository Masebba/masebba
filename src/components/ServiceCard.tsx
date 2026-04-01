import type { LucideIcon } from 'lucide-react';

import { Card } from './ui/Card';
interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}
export function ServiceCard({
  title,
  description,
  icon: Icon
}: ServiceCardProps) {
  return (
    <Card className="group hover:border-primary transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-main mb-3">{title}</h3>
      <p className="text-muted flex-1 leading-relaxed">{description}</p>
    </Card>);

}