import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label &&
        <label htmlFor={inputId} className="text-sm font-medium text-main">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        }
        <input
          ref={ref}
          id={inputId}
          className={`flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props} />
        
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>);

  }
);
Input.displayName = 'Input';