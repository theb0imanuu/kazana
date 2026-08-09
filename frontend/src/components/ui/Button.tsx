import * as React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-semibold rounded-ios-md transition-all duration-200 active:scale-98 select-none disabled:opacity-50 disabled:pointer-events-none focus:outline-none';

  const variants = {
    primary: 'bg-ios-blue text-white hover:bg-blue-600 shadow-sm shadow-blue-500/20',
    secondary: 'bg-white/80 dark:bg-neutral-800/80 border border-ios-border-light dark:border-ios-border-dark text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50',
    danger: 'bg-ios-red text-white hover:bg-red-600 shadow-sm shadow-red-500/20',
    ghost: 'bg-transparent text-ios-blue hover:bg-neutral-100 dark:hover:bg-neutral-800/50',
  };

  const sizes = {
    sm: 'h-9 px-3 text-xs rounded-ios-sm',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-base rounded-ios-lg',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
};
