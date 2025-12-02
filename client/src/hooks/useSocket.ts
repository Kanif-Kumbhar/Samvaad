"use client";

import { useEffect } from "react";
import { initSocket, getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { Message, TypingData } from "@/types";

export function useSocket() {
	const { token } = useAuthStore();
	const { addMessage, setTyping, updateMessageStatus } = useChatStore();

	useEffect(() => {
		if (!token) return;
		const socket = initSocket(token);

		socket.on("message:new", (message: Message) => {
			addMessage(message.conversationId, message);
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

		return () => {
			getSocket()?.off("message:new");
			getSocket()?.off("message:status");
			getSocket()?.off("typing");
		};
	}, [token, addMessage, setTyping, updateMessageStatus]);
}