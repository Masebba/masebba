import { Button } from '../ui/Button';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-surface border border-border rounded-xl border-dashed">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-main mb-2">{title}</h3>
      <p className="text-muted max-w-sm mb-6">{description}</p>
      {actionLabel && onAction &&
      <Button onClick={onAction}>{actionLabel}</Button>
      }
    </div>);

}