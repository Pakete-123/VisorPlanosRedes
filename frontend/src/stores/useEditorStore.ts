import { create } from 'zustand';

type EditorMode = 'select' | 'move' | 'cable' | 'rotate';

interface EditorState {
  mode: EditorMode;
  selectedDeviceId: string | null;
  cableOriginId: string | null;
  layers: {
    cabling: boolean;
    devices: boolean;
    racks: boolean;
  };
  activeFloorId: string | null;
  setMode: (mode: EditorMode) => void;
  selectDevice: (id: string | null) => void;
  setCableOrigin: (id: string | null) => void;
  toggleLayer: (layer: keyof EditorState['layers']) => void;
  setActiveFloor: (id: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  mode: 'select',
  selectedDeviceId: null,
  cableOriginId: null,
  layers: { cabling: true, devices: true, racks: true },
  activeFloorId: null,
  setMode: (mode) => set({ mode }),
  selectDevice: (id) => set({ selectedDeviceId: id }),
  setCableOrigin: (id) => set({ cableOriginId: id }),
  toggleLayer: (layer) =>
    set((s) => ({ layers: { ...s.layers, [layer]: !s.layers[layer] } })),
  setActiveFloor: (id) => set({ activeFloorId: id }),
}));