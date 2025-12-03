"use client";

import { useEffect } from "react";
import { initSocket, getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { Message, TypingData } from "@/types";
import { useNotificationSound } from "./useNotificationSound";

export function useSocket() {
	const { token, user } = useAuthStore();
	const {
		addMessage,
		setTyping,
		updateMessageStatus,
		conversations,
		setConversations,
	} = useChatStore();
	const { play } = useNotificationSound();

	useEffect(() => {
		if (!token) return;
		const socket = initSocket(token);

		socket.on("message:new", (message: Message) => {
			addMessage(message.conversationId, message);

			if (message.senderId !== user?.id) {
				play();
			}
		});

		socket.on(
			"message:status",
			({
				messageId,
				status,
			}: {
				messageId: string;
				status: Message["status"];
			}) => {
				updateMessageStatus(messageId, status);
			}
		);

		socket.on("typing", (data: TypingData) => {
			setTyping(data.conversationId, data.userId, data.isTyping);
		});

		socket.on("user:status", (data: { userId: string; isOnline: boolean }) => {
			setConversations(
				conversations.map((conv) => ({
					...conv,
					participants: conv.participants.map((p) =>
						p.id === data.userId ? { ...p, isOnline: data.isOnline } : p
					),
				}))
			);
		});

		return () => {
			getSocket()?.off("message:new");
			getSocket()?.off("message:status");
			getSocket()?.off("typing");
			getSocket()?.off("user:status");
		};
	}, [
		token,
		addMessage,
		setTyping,
		updateMessageStatus,
		user,
		play,
		conversations,
		setConversations,
	]);
}
