import { create } from 'zustand';

interface AppState {
  isListening: boolean;
  detectedObjects: Array<{
    class: string;
    score: number;
    bbox: [number, number, number, number];
  }>;
  recognizedText: string;
  setIsListening: (isListening: boolean) => void;
  setDetectedObjects: (objects: Array<{
    class: string;
    score: number;
    bbox: [number, number, number, number];
  }>) => void;
  setRecognizedText: (text: string) => void;
}

export const useStore = create<AppState>((set) => ({
  isListening: false,
  detectedObjects: [],
  recognizedText: '',
  setIsListening: (isListening) => set({ isListening }),
  setDetectedObjects: (objects) => set({ detectedObjects: objects }),
  setRecognizedText: (text) => set({ recognizedText: text }),
}));