import * as React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-ios-border-light dark:border-ios-border-dark rounded-ios-lg bg-white/40 dark:bg-neutral-900/40 backdrop-blur-md select-none ${className}`}
    >
      {Icon ? (
        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 flex items-center justify-center mb-4 border border-ios-border-light dark:border-ios-border-dark">
          <Icon className="w-6 h-6" />
        </div>
      ) : null}
      <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-1">
        {title}
      </h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mb-5">
        {description}
      </p>
      {action ? <div className="inline-flex">{action}</div> : null}
    </div>
  );
};
