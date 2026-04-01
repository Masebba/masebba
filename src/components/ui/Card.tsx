import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}
export function Card({
  children,
  className = '',
  padding = 'md',
  onClick
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  return (
    <div
      className={`bg-surface rounded-xl border border-border shadow-sm overflow-hidden ${paddingClasses[padding]} ${className}`}
      onClick={onClick}>
      
      {children}
    </div>);

}