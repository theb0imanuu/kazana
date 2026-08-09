import * as React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label ? (
          <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 px-1 select-none">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          className={`h-11 px-3.5 bg-white/70 dark:bg-neutral-800/70 border border-ios-border-light dark:border-ios-border-dark rounded-ios-md text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 transition-all duration-200 focus:border-ios-blue focus:ring-1 focus:ring-ios-blue disabled:opacity-50 disabled:bg-neutral-50 dark:disabled:bg-neutral-900/50 ${
            error ? 'border-ios-red focus:border-ios-red focus:ring-ios-red' : ''
          } ${className}`}
          {...props}
        />
        {error ? (
          <span className="text-xs font-medium text-ios-red px-1 select-none">
            {error}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
