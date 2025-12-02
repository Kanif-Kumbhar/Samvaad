"use client";

import { useChatStore } from "@/store/chatStore";
import { useRouter } from "next/navigation";
import ChatList from "@/components/chat/ChatList";

export default function DashboardHome() {
	const { activeConversationId } = useChatStore();
	const router = useRouter();

	if (activeConversationId) {
		router.replace(`/chat/${activeConversationId}`);
	}

	return (
		<div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-100">
			<ChatList empty />
		</div>
	);
}