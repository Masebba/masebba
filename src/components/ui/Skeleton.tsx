import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ className = '', variant = 'rectangular', width, height, lines = 1 }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-surface';
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '100%'),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]}`}
            style={{
              width: i === lines - 1 ? '80%' : '100%',
              height: '1rem',
            }}
          />
        ))}
      </div>
    );
  }

  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} style={style} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
      <Skeleton variant="rectangular" height={48} width={48} />
      <Skeleton variant="text" />
      <Skeleton variant="text" lines={3} />
    </div>
  );
}

export function SkeletonProjectCard() {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <Skeleton variant="rectangular" className="aspect-video w-full" />
      <div className="p-6 space-y-3">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" />
        <Skeleton variant="text" lines={2} />
        <div className="flex gap-2 mt-4">
          <Skeleton variant="rectangular" height={24} width={60} />
          <Skeleton variant="rectangular" height={24} width={60} />
          <Skeleton variant="rectangular" height={24} width={60} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonBlogCard() {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <Skeleton variant="rectangular" className="aspect-video w-full" />
      <div className="p-6 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton variant="text" width={80} />
          <Skeleton variant="text" width={100} />
        </div>
        <Skeleton variant="text" lines={2} />
        <Skeleton variant="text" lines={3} />
      </div>
    </div>
  );
}

export function SkeletonTextBlock({ lines = 3 }: { lines?: number }) {
  return <Skeleton variant="text" lines={lines} />;
}
