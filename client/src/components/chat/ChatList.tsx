"use client";

import { useChatStore } from "@/store/chatStore";
import ChatItem from "./ChatItem";

export default function ChatList({ empty = false }: { empty?: boolean }) {
	const { conversations } = useChatStore();

	if (empty || conversations.length === 0) {
		return (
			<div className="text-center space-y-2">
				<p className="text-lg font-semibold">Welcome to ChatApp</p>
				<p className="text-sm text-muted-foreground">
					Search for a user and start a conversation.
				</p>
			</div>
		);
	}

	return (
		<div className="flex-1 w-full h-full overflow-y-auto custom-scrollbar px-3 py-2">
			{conversations.map((c) => (
				<ChatItem key={c.id} conversation={c} />
			))}
		</div>
	);
}