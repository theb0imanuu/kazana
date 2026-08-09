import * as React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  className = '',
  ...props
}) => {
  const variants = {
    text: 'h-4 w-full rounded-ios-sm',
    rect: 'h-24 w-full rounded-ios-md',
    circle: 'w-12 h-12 rounded-full',
  };

  return (
    <div
      className={`animate-pulse bg-neutral-200/60 dark:bg-neutral-800/60 ${variants[variant]} ${className}`}
      {...props}
    />
  );
};
