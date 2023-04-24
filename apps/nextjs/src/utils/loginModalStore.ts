import { create } from 'zustand';

export const useLoginStore = create((set) => ({
	bears: false,
	setModal: (option: boolean) => set({ bears: option })
}));
