import * as React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  className = '',
  ...props
}) => {
  const variants = {
    blue: 'bg-ios-blue/10 text-ios-blue border-ios-blue/20',
    green: 'bg-ios-green/10 text-ios-green border-ios-green/20',
    orange: 'bg-ios-orange/10 text-ios-orange border-ios-orange/20',
    red: 'bg-ios-red/10 text-ios-red border-ios-red/20',
    purple: 'bg-ios-purple/10 text-ios-purple border-ios-purple/20',
    gray: 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
