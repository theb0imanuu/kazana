import * as React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-ios-border-light dark:border-ios-border-dark rounded-ios-lg p-5 shadow-sm transition-all duration-200 ${
        hoverable ? 'hover:shadow-md hover:-translate-y-0.5 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
