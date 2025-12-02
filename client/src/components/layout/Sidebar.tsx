"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { api } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, LogOut } from "lucide-react";
import UserSearch from "@/components/chat/UserSearch";

export default function Sidebar() {
	const { user, token, logout } = useAuthStore();
	const { conversations, setConversations, setActiveConversation } =
		useChatStore();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!token) return;
		(async () => {
			const data = await api.getConversations(token);
			setConversations(data.conversations || []);
		})();
	}, [token, setConversations]);

	const handleLogout = () => {
		logout();
		router.replace("/login");
	};

	return (
		<div className="h-full flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
			<div className="px-4 py-4 flex items-center justify-between border-b border-white/10">
				<div className="flex items-center gap-3">
					<div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg">
						<MessageCircle className="w-5 h-5 text-white" />
					</div>
					<div>
						<p className="font-semibold leading-tight">ChatApp</p>
						<p className="text-xs text-white/60">Real-time messaging</p>
					</div>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onClick={handleLogout}
					className="text-white/70 hover:text-white hover:bg-white/10"
				>
					<LogOut className="w-4 h-4" />
				</Button>
			</div>

			<div className="px-3 py-3 border-b border-white/10">
				<UserSearch />
			</div>

			<div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2 space-y-1">
				{conversations.map((c) => (
					<button
						key={c.id}
						onClick={() => {
							setActiveConversation(c.id);
							if (!pathname.startsWith("/chat/")) {
								router.push(`/chat/${c.id}`);
							}
						}}
						className="w-full text-left rounded-lg px-3 py-2 hover:bg-white/5 transition-colors flex items-center gap-3"
					>
						<Avatar className="h-9 w-9">
							<AvatarFallback>
								{c.participants[0]?.username?.[0]?.toUpperCase() ?? "U"}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium truncate">
								{c.participants.map((p) => p.username).join(", ")}
							</p>
							<p className="text-xs text-white/60 truncate">
								{c.lastMessage?.content ?? "No messages yet"}
							</p>
						</div>
						{c.unreadCount > 0 && (
							<span className="text-[10px] px-2 py-1 bg-primary/80 rounded-full">
								{c.unreadCount}
							</span>
						)}
					</button>
				))}
			</div>

			<div className="px-4 py-3 border-t border-white/10 flex items-center gap-3">
				<Avatar className="h-8 w-8">
					<AvatarFallback>
						{user?.username?.[0]?.toUpperCase() ?? "U"}
					</AvatarFallback>
				</Avatar>
				<div className="min-w-0">
					<p className="text-xs font-medium truncate">{user?.username}</p>
					<p className="text-[11px] text-white/50 truncate">{user?.email}</p>
				</div>
			</div>
		</div>
	);
}