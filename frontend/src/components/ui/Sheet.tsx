import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  side?: 'left' | 'right';
  children: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  side = 'right',
  children,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const slideVariants = {
    left: {
      hidden: { x: '-100%' },
      visible: { x: 0 },
    },
    right: {
      hidden: { x: '100%' },
      visible: { x: 0 },
    },
  };

  const sideStyle = side === 'left' ? 'left-0 border-r' : 'right-0 border-l';

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={slideVariants[side]}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`absolute top-0 bottom-0 w-full max-w-md bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg border-ios-border-light dark:border-ios-border-dark shadow-2xl p-6 flex flex-col ${sideStyle}`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-ios-border-light dark:border-ios-border-dark">
              {title ? (
                <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
                  {title}
                </h3>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 flex items-center justify-center transition-colors focus:ring-1 focus:ring-ios-blue"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pt-4 pr-1">
              {children}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};
