"use client";

import { useRouter } from "next/navigation";
import { Conversation } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatMessageTime, cn } from "@/lib/utils";
import { useChatStore } from "@/store/chatStore";
import { motion } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";

export default function ChatItem({
	conversation,
}: {
	conversation: Conversation;
}) {
	const router = useRouter();
	const { activeConversationId, setActiveConversation } = useChatStore();

	const last = conversation.lastMessage;
	const isActive = activeConversationId === conversation.id;
	const otherUser = conversation.participants[0];

	return (
		<motion.button
			layout
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			onClick={() => {
				setActiveConversation(conversation.id);
				router.push(`/chat/${conversation.id}`);
			}}
			className={cn(
				"w-full flex items-center gap-3 rounded-xl px-3 py-3 mb-1 transition-all duration-200",
				isActive
					? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30"
					: "hover:bg-slate-800/60"
			)}
		>
			{/* Avatar with Online Status */}
			<div className="relative shrink-0">
				<Avatar className="h-12 w-12 ring-2 ring-slate-700">
					<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
						{otherUser?.username?.[0]?.toUpperCase() ?? "U"}
					</AvatarFallback>
				</Avatar>
				{otherUser?.isOnline && (
					<span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-slate-900" />
				)}
			</div>

			{/* Content */}
			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between mb-1">
					<span
						className={cn(
							"text-sm font-semibold truncate",
							isActive ? "text-white" : "text-slate-200"
						)}
					>
						{otherUser?.username || "Unknown"}
					</span>
					{last && (
						<span className="text-[10px] text-slate-500 ml-2 shrink-0">
							{formatMessageTime(last.createdAt)}
						</span>
					)}
				</div>

				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-1 min-w-0 flex-1">
						{last && (
							<>
								{last.status === "SEEN" ? (
									<CheckCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
								) : last.status === "DELIVERED" ? (
									<CheckCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
								) : (
									<Check className="w-3.5 h-3.5 text-slate-500 shrink-0" />
								)}
							</>
						)}
						<p className="text-xs text-slate-400 truncate">
							{last ? last.content : "No messages yet"}
						</p>
					</div>

					{/* Unread Badge */}
					{conversation.unreadCount > 0 && (
						<motion.span
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							className="shrink-0 min-w-[20px] h-5 px-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
						>
							{conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
						</motion.span>
					)}
				</div>
			</div>
		</motion.button>
	);
}