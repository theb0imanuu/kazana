import * as React from 'react';
import { motion } from 'framer-motion';

interface Option {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex p-0.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-ios-md border border-neutral-200/50 dark:border-neutral-700/50 select-none relative ${className}`}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`relative px-4 h-8 text-xs font-semibold rounded-ios-sm transition-colors duration-200 focus:outline-none flex items-center justify-center min-h-[32px] cursor-pointer ${
              isActive
                ? 'text-neutral-900 dark:text-white'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isActive ? (
              <motion.div
                layoutId="segmented-active"
                className="absolute inset-0 bg-white dark:bg-neutral-700 shadow-sm rounded-ios-sm z-0 border border-black/5 dark:border-white/5"
                transition={{ type: 'spring', damping: 24, stiffness: 200 }}
              />
            ) : null}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
