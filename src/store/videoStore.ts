import { create } from 'zustand';

export interface VideoData {
    id: string;
    videoUrl: string;
    title: string;
    channelName: string;
    views: string;
    time: string;
    thumbnailUrl: string;
}

interface VideoStore {
    activeVideo: VideoData | null;
    setActiveVideo: (video: VideoData) => void;
    clearActiveVideo: () => void;
}

export const useVideoStore = create<VideoStore>((set) => ({
    activeVideo: null,
    setActiveVideo: (video) => set({ activeVideo: video }),
    clearActiveVideo: () => set({ activeVideo: null }),
}));
