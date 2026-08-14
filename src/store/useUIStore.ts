import { create } from 'zustand';

export type ViewMode = 'edit' | 'split' | 'preview';
export type ActiveModal = 
  | 'none'
  | 'ats-linter'
  | 'ats-preview'
  | 'job-matcher'
  | 'compare-cv'
  | 'version-history'
  | 'analytics'
  | 'api-key-byok'
  | 'theme-customizer'
  | 'template-picker'
  | 'export-pdf';

interface UIStoreState {
  viewMode: ViewMode;
  zoomLevel: number; // 0.5 to 1.5
  activeModal: ActiveModal;
  isHeatmapActive: boolean;
  isAutoFitActive: boolean;

  setViewMode: (mode: ViewMode) => void;
  setZoomLevel: (zoom: number) => void;
  openModal: (modal: ActiveModal) => void;
  closeModal: () => void;
  toggleHeatmap: () => void;
  toggleAutoFit: () => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  viewMode: 'split',
  zoomLevel: 1.0,
  activeModal: 'none',
  isHeatmapActive: false,
  isAutoFitActive: false,

  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),
  setZoomLevel: (zoom: number) => set({ zoomLevel: Math.min(Math.max(zoom, 0.5), 1.5) }),
  openModal: (modal: ActiveModal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: 'none' }),
  toggleHeatmap: () => set((state) => ({ isHeatmapActive: !state.isHeatmapActive })),
  toggleAutoFit: () => set((state) => ({ isAutoFitActive: !state.isAutoFitActive })),
}));
