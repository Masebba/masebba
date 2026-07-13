import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, rows = 4, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const errorId = `${textareaId}-error`;
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label &&
        <label htmlFor={textareaId} className="text-sm font-medium text-main">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        }
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : props['aria-describedby']}
          rows={rows}
          className={`flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 resize-y ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props} />
        
        {error && <span id={errorId} role="alert" className="text-xs text-red-500">{error}</span>}
      </div>);

  }
);
Textarea.displayName = 'Textarea';
