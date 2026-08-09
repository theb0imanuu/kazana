import { create } from 'zustand';

interface UiState {
  isSidebarOpen: boolean;
  isMobileNavOpen: boolean;
  activeModal: string | null;
  activeSheet: string | null;
  theme: 'light' | 'dark';
  setSidebarOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  openModal: (modalId: string | null) => void;
  openSheet: (sheetId: string | null) => void;
  toggleTheme: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  isMobileNavOpen: false,
  activeModal: null,
  activeSheet: null,
  theme: 'light',
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
  openModal: (modalId) => set({ activeModal: modalId }),
  openSheet: (sheetId) => set({ activeSheet: sheetId }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));
