"use client";

import { useRouter } from "next/navigation";
import { Conversation } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatMessageTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chatStore";

export default function ChatItem({
	conversation,
}: {
	conversation: Conversation;
}) {
	const router = useRouter();
	const { activeConversationId, setActiveConversation } = useChatStore();

	const last = conversation.lastMessage;
	const isActive = activeConversationId === conversation.id;

	return (
		<button
			onClick={() => {
				setActiveConversation(conversation.id);
				router.push(`/chat/${conversation.id}`);
			}}
			className={cn(
				"w-full flex items-center gap-3 rounded-xl px-3 py-2 mb-1 hover:bg-slate-800/80 transition-colors",
				isActive && "bg-slate-800"
			)}
		>
			<Avatar className="h-9 w-9">
				<AvatarFallback>
					{conversation.participants[0]?.username?.[0]?.toUpperCase() ?? "U"}
				</AvatarFallback>
			</Avatar>
			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between mb-0.5">
					<p className="text-sm font-medium truncate">
						{conversation.participants.map((p) => p.username).join(", ")}
					</p>
					{last && (
						<span className="text-[10px] text-slate-400 ml-2">
							{formatMessageTime(last.createdAt)}
						</span>
					)}
				</div>
				<div className="flex items-center justify-between">
					<p className="text-xs text-slate-400 truncate">
						{last ? last.content : "No messages yet"}
					</p>
					{conversation.unreadCount > 0 && (
						<span className="ml-2 text-[10px] px-2 py-0.5 bg-primary/80 text-primary-foreground rounded-full">
							{conversation.unreadCount}
						</span>
					)}
				</div>
			</div>
		</button>
	);
}