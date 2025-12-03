import { create } from "zustand";
import { Conversation, Message } from "@/types";

interface ChatState {
	conversations: Conversation[];
	messages: Record<string, Message[]>;
	activeConversationId: string | null;
	typingUsers: Record<string, string[]>;

	setConversations: (conversations: Conversation[]) => void;
	addConversation: (conversation: Conversation) => void;
	setMessages: (conversationId: string, messages: Message[]) => void;
	addMessage: (conversationId: string, message: Message) => void;
	deleteMessage: (conversationId: string, messageId: string) => void;
	setActiveConversation: (id: string | null) => void;
	setTyping: (
		conversationId: string,
		userId: string,
		isTyping: boolean
	) => void;
	updateMessageStatus: (messageId: string, status: Message["status"]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
	conversations: [],
	messages: {},
	activeConversationId: null,
	typingUsers: {},

	setConversations: (conversations) => set({ conversations }),

	addConversation: (conversation) =>
		set((state) => ({ conversations: [conversation, ...state.conversations] })),

	setMessages: (conversationId, messages) =>
		set((state) => ({
			messages: { ...state.messages, [conversationId]: messages },
		})),

	addMessage: (conversationId, message) =>
		set((state) => ({
			messages: {
				...state.messages,
				[conversationId]: [...(state.messages[conversationId] || []), message],
			},
		})),

	deleteMessage: (conversationId, messageId) =>
		set((state) => ({
			messages: {
				...state.messages,
				[conversationId]: (state.messages[conversationId] || []).filter(
					(m) => m.id !== messageId
				),
			},
		})),

	setActiveConversation: (id) => set({ activeConversationId: id }),

	setTyping: (conversationId, userId, isTyping) =>
		set((state) => {
			const current = state.typingUsers[conversationId] || [];
			const updated = isTyping
				? [...current, userId]
				: current.filter((id) => id !== userId);

			return {
				typingUsers: { ...state.typingUsers, [conversationId]: updated },
			};
		}),

	updateMessageStatus: (messageId, status) =>
		set((state) => {
			const updatedMessages = { ...state.messages };
			Object.keys(updatedMessages).forEach((convId) => {
				updatedMessages[convId] = updatedMessages[convId].map((msg) =>
					msg.id === messageId ? { ...msg, status } : msg
				);
			});
			return { messages: updatedMessages };
		}),
}));