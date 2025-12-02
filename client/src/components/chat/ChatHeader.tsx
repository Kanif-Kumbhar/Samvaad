"use client";

import { Conversation, User } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function ChatHeader({
	conversation,
	otherUser,
}: {
	conversation: Conversation;
	otherUser: User | null;
}) {
	return (
		<header className="h-14 border-b px-4 flex items-center justify-between bg-background/80 backdrop-blur">
			<div className="flex items-center gap-3">
				<Avatar className="h-9 w-9">
					<AvatarFallback>
						{otherUser?.username?.[0]?.toUpperCase() ?? "U"}
					</AvatarFallback>
				</Avatar>
				<div className="flex flex-col">
					<span className="text-sm font-semibold">
						{otherUser?.username ?? "Unknown"}
					</span>
					<span className="text-xs text-muted-foreground">
						{otherUser?.isOnline ? "Online" : "Offline"}
					</span>
				</div>
			</div>
			<Badge variant="outline" className="text-[10px] px-2 py-0.5">
				{conversation.isPinned ? "Pinned" : "Chat"}
			</Badge>
		</header>
	);
}