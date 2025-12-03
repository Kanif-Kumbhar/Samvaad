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
import { AnimatePresence, motion } from "framer-motion";

interface Props {
	conversationId: string;
}

export default function ChatScreen({ conversationId }: Props) {
	const { token, user } = useAuthStore();
	const { conversations, setMessages, messages, typingUsers } = useChatStore();
	const [loading, setLoading] = useState(true);
	const [page] = useState(1);
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const lastMessageRef = useRef<HTMLDivElement | null>(null);

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
				lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
			}, 100);
		};

		fetchMessages();
	}, [token, conversationId, page, setMessages]);

	const currentMessages = messages[conversationId];
	const messageCount = currentMessages?.length || 0;

	useEffect(() => {
		if (messageCount > 0) {
			setTimeout(() => {
				lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
			}, 100);
		}
	}, [messageCount]);

	const typingUserIds = typingUsers[conversationId] || [];
	const showTyping =
		typingUserIds.length > 0 && typingUserIds.some((id) => id !== user?.id);

	if (!conversation || !user) {
		return (
			<div className="flex-1 flex items-center justify-center bg-slate-950">
				<p className="text-sm text-slate-400">
					Select a conversation to start chatting
				</p>
			</div>
		);
	}

	return (
		<div className="flex-1 flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
			{/* Animated Background Pattern */}
			<div className="absolute inset-0 opacity-5">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.2) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)`,
					}}
				/>
			</div>

			<ChatHeader conversation={conversation} otherUser={otherUser} />

			{/* Messages Container */}
			<div
				ref={scrollRef}
				className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 relative z-10"
			>
				{loading ? (
					<div className="flex-1 flex items-center justify-center h-full">
						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							className="flex flex-col items-center gap-3"
						>
							<Loader2 className="w-8 h-8 animate-spin text-primary" />
							<p className="text-sm text-slate-400">Loading messages...</p>
						</motion.div>
					</div>
				) : (
					<div className="space-y-2">
						{currentMessages?.length === 0 ? (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className="flex flex-col items-center justify-center h-full py-20"
							>
								<div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
									<span className="text-4xl">👋</span>
								</div>
								<p className="text-lg font-semibold text-slate-300 mb-2">
									Start the conversation
								</p>
								<p className="text-sm text-slate-500">
									Send a message to {otherUser?.username}
								</p>
							</motion.div>
						) : (
							<AnimatePresence initial={false}>
								{currentMessages?.map((m, index) => (
									<MessageBubble
										key={m.id}
										message={m}
										isLast={index === currentMessages.length - 1}
										ref={
											index === currentMessages.length - 1
												? lastMessageRef
												: null
										}
									/>
								))}
							</AnimatePresence>
						)}

						{showTyping && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 10 }}
								className="flex justify-start"
							>
								<TypingIndicator username={otherUser?.username} />
							</motion.div>
						)}
					</div>
				)}
			</div>

			<MessageInput conversationId={conversationId} />
		</div>
	);
}