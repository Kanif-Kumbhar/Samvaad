"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { useSocket } from "@/hooks/useSocket";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import { Message } from "@/types";
import { Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";

interface Props {
	conversationId: string;
}

export default function ChatScreen({ conversationId }: Props) {
	const { token, user } = useAuthStore();
	const { conversations, setMessages, messages, typingUsers } = useChatStore();
	const [loading, setLoading] = useState(true);
	const [page] = useState(1);
	const scrollRef = useRef<HTMLDivElement | null>(null);

	useSocket();

	const conversation = useMemo(
		() => conversations.find((c) => c.id === conversationId) || null,
		[conversations, conversationId]
	);

	const otherUser = useMemo(() => {
		if (!conversation || !user) return null;
		return conversation.participants.find((p) => p.id !== user.id) || null;
	}, [conversation, user]);

	useEffect(() => {
		if (!token || !conversationId) return;

		const fetchMessages = async () => {
			setLoading(true);
			const data = await api.getMessages(conversationId, token, page);
			setMessages(conversationId, (data.messages || []) as Message[]);
			setLoading(false);

			setTimeout(() => {
				if (scrollRef.current) {
					scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
				}
			}, 50);
		};

		fetchMessages();
	}, [token, conversationId, page, setMessages]);

	const currentMessages = messages[conversationId];
	const messageCount = currentMessages?.length || 0;

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messageCount]);

	const typingUserIds = typingUsers[conversationId] || [];
	const showTyping =
		typingUserIds.length > 0 && typingUserIds.some((id) => id !== user?.id);

	if (!conversation || !user) {
		return (
			<div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-100">
				<p className="text-sm text-muted-foreground">
					Select a conversation to start chatting.
				</p>
			</div>
		);
	}

	return (
		<div className="flex-1 flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
			<ChatHeader conversation={conversation} otherUser={otherUser} />

			<div
				ref={scrollRef}
				className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 flex flex-col space-y-1"
			>
				{loading ? (
					<div className="flex-1 flex items-center justify-center">
						<Loader2 className="w-5 h-5 animate-spin text-slate-400" />
					</div>
				) : (
					<>
						<AnimatePresence initial={false}>
							{currentMessages?.map((m) => (
								<MessageBubble key={m.id} message={m} />
							))}
						</AnimatePresence>
						{showTyping && (
							<div className="mt-2 flex justify-start">
								<TypingIndicator />
							</div>
						)}
					</>
				)}
			</div>

			<MessageInput conversationId={conversationId} />
		</div>
	);
}