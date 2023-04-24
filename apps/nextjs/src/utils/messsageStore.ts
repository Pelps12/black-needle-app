import { Types } from 'ably';
import { create } from 'zustand';

interface MessageState {
	messages: Types.Message[];
	addMessage: (message: Types.Message) => void;
}

export const useBearStore = create((set) => ({
	bears: 0,
	increasePopulation: () => set((state: { bears: number }) => ({ bears: state.bears + 1 })),
	setBears: (bears: number) => set({ bears })
}));

export const useMessageCountStore = create<MessageState>((set) => ({
	messages: [],
	addMessage: (message) =>
		set(({ messages }) => ({
			messages: [...messages, message]
		}))
}));
