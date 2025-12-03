"use client";

import { useEffect } from "react";
import { initSocket, getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { Message, TypingData } from "@/types";
import { useNotificationSound } from "./useNotificationSound";
import { toast } from "sonner";

export function useSocket() {
	const { token, user } = useAuthStore();
	const {
		addMessage,
		deleteMessage,
		setTyping,
		updateMessageStatus,
		conversations,
		setConversations,
		activeConversationId,
	} = useChatStore();
	const { play } = useNotificationSound();

	useEffect(() => {
		if (!token) return;
		const socket = initSocket(token);

		// New message
		socket.on("message:new", (message: Message) => {
			addMessage(message.conversationId, message);

			if (message.senderId !== user?.id) {
				play();

				if (activeConversationId !== message.conversationId) {
					const sender = conversations
						.find((c) => c.id === message.conversationId)
						?.participants.find((p) => p.id === message.senderId);

					toast.success(`New message from ${sender?.username || "Someone"}`, {
						description: message.attachmentType
							? `📎 ${
									message.attachmentType === "image"
										? "Image"
										: message.attachmentType === "audio"
										? "Voice message"
										: "File"
							  }`
							: message.content.length > 50
							? message.content.substring(0, 50) + "..."
							: message.content,
						duration: 4000,
					});
				}
			}
		});

		socket.on(
			"message:deleted",
			(data: { messageId: string; conversationId: string }) => {
				deleteMessage(data.conversationId, data.messageId);
			}
		);

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
			getSocket()?.off("message:deleted");
			getSocket()?.off("message:status");
			getSocket()?.off("typing");
			getSocket()?.off("user:status");
		};
	}, [
		token,
		addMessage,
		deleteMessage,
		setTyping,
		updateMessageStatus,
		user,
		play,
		conversations,
		setConversations,
		activeConversationId,
	]);
}