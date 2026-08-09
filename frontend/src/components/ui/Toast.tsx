import * as React from 'react';
import { create } from 'zustand';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

export const toast = {
  success: (message: string) => useToastStore.getState().addToast(message, 'success'),
  error: (message: string) => useToastStore.getState().addToast(message, 'error'),
  info: (message: string) => useToastStore.getState().addToast(message, 'info'),
};

export const ToastProvider: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-ios-green" />,
    error: <AlertCircle className="w-5 h-5 text-ios-red" />,
    info: <Info className="w-5 h-5 text-ios-blue" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            className="flex items-center gap-3 p-4 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-lg border border-ios-border-light dark:border-ios-border-dark rounded-ios-lg shadow-lg pointer-events-auto select-none"
          >
            <div className="flex-shrink-0">{icons[item.type]}</div>
            <p className="flex-1 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              {item.message}
            </p>
            <button
              onClick={() => removeToast(item.id)}
              className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 dark:text-neutral-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
