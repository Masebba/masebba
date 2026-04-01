import type { LucideIcon } from 'lucide-react';

interface ContactInfoCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}
export function ContactInfoCard({
  icon: Icon,
  label,
  value,
  href
}: ContactInfoCardProps) {
  const content =
  <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-surface transition-colors duration-300">
      <div className="p-3 bg-primary/10 rounded-full text-primary shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted mb-1">{label}</p>
        <p className="text-base font-semibold text-main">{value}</p>
      </div>
    </div>;

  if (href) {
    return (
      <a
        href={href}
        className="block"
        target={href.startsWith('http') ? '_blank' : undefined}
        rel="noreferrer">
        
        {content}
      </a>);

  }
  return content;
}