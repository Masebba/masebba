import type { LucideIcon } from 'lucide-react';

interface SkillBadgeProps {
  name: string;
  icon?: LucideIcon;
}
export function SkillBadge({ name, icon: Icon }: SkillBadgeProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-surface border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors duration-300">
      {Icon && <Icon className="w-5 h-5 text-primary" />}
      <span className="font-medium text-main text-sm">{name}</span>
    </div>);

}