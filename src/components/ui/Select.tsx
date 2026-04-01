import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';

interface Option {
  value: string;
  label: string;
}
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label &&
        <label htmlFor={selectId} className="text-sm font-medium text-main">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        }
        <select
          ref={ref}
          id={selectId}
          className={`flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props}>
          
          <option value="" disabled>
            Select an option
          </option>
          {options.map((opt) =>
          <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )}
        </select>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>);

  }
);
Select.displayName = 'Select';