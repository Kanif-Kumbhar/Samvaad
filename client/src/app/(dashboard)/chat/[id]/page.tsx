"use client";

import { useParams } from "next/navigation";
import ChatScreen from "@/components/chat/ChatScreen";

export default function ChatPage() {
	const params = useParams<{ id: string }>();
	return <ChatScreen conversationId={params.id} />;
}