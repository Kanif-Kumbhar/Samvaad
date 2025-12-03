"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, LogOut, Settings } from "lucide-react";
import UserSearch from "@/components/chat/UserSearch";
import ChatItem from "@/components/chat/ChatItem";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
	const { user, token, logout } = useAuthStore();
	const { conversations, setConversations } = useChatStore();
	const router = useRouter();

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
			<motion.div
				initial={{ y: -20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				className="px-4 py-4 flex items-center justify-between border-b border-slate-800/50"
			>
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
						<MessageCircle className="w-5 h-5 text-white" />
					</div>
					<div>
						<p className="font-bold text-base leading-tight">ChatApp</p>
						<p className="text-[10px] text-slate-400">Always connected</p>
					</div>
				</div>
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="text-slate-400 hover:text-white hover:bg-slate-800/50 h-8 w-8"
					>
						<Settings className="w-4 h-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleLogout}
						className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8"
					>
						<LogOut className="w-4 h-4" />
					</Button>
				</div>
			</motion.div>

			<div className="px-3 py-3 border-b border-slate-800/50">
				<UserSearch />
			</div>

			<div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2">
				<AnimatePresence>
					{conversations.length === 0 ? (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="flex flex-col items-center justify-center h-full text-center px-6 py-12"
						>
							<div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
								<MessageCircle className="w-8 h-8 text-slate-600" />
							</div>
							<p className="text-sm text-slate-400 mb-2">
								No conversations yet
							</p>
							<p className="text-xs text-slate-600">
								Search for users to start chatting
							</p>
						</motion.div>
					) : (
						conversations.map((c) => <ChatItem key={c.id} conversation={c} />)
					)}
				</AnimatePresence>
			</div>

			<motion.div
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				className="px-4 py-3 border-t border-slate-800/50 flex items-center gap-3 bg-slate-900/50"
			>
				<Avatar className="h-9 w-9 ring-2 ring-slate-700">
					<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
						{user?.username?.[0]?.toUpperCase() ?? "U"}
					</AvatarFallback>
				</Avatar>
				<div className="flex-1 min-w-0">
					<p className="text-sm font-semibold truncate">{user?.username}</p>
					<p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
				</div>
				<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
			</motion.div>
		</div>
	);
}