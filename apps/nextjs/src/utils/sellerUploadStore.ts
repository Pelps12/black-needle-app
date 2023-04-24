import { create } from 'zustand';

interface Load {
	loading: boolean;
	setLoading: (option: boolean) => void;
}

export const useLoadingStore = create<Load>((set) => ({
	loading: false,
	setLoading: (option: boolean) => set({ loading: option })
}));
