"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	MessageCircle,
	LogOut,
	Settings,
	Search,
	X,
	Users,
} from "lucide-react";
import UserSearch from "@/components/chat/UserSearch";
import ChatItem from "@/components/chat/ChatItem";
import CreateGroupDialog from "@/components/chat/CreateGroupDialog";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
	const { user, token, logout } = useAuthStore();
	const { conversations, setConversations } = useChatStore();
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [showCreateGroup, setShowCreateGroup] = useState(false);

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

	const handleGroupCreated = async () => {
		if (!token) return;
		const data = await api.getConversations(token);
		setConversations(data.conversations || []);
	};

	const filteredConversations = conversations.filter((conv) => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();

		// For groups, search by group name
		if (conv.isGroup) {
			return conv.groupName?.toLowerCase().includes(query);
		}

		// For 1-on-1, search by username
		const usernameMatch = conv.participants.some((p) =>
			p.username.toLowerCase().includes(query)
		);

		const messageMatch = conv.lastMessage?.content
			.toLowerCase()
			.includes(query);

		return usernameMatch || messageMatch;
	});

	const pinnedChats = filteredConversations.filter(
		(c) => c.isPinned && !c.isArchived
	);
	const regularChats = filteredConversations.filter(
		(c) => !c.isPinned && !c.isArchived
	);
	const archivedChats = filteredConversations.filter((c) => c.isArchived);

	return (
		<div className="h-full flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
			{/* Header */}
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
						<p className="font-bold text-base leading-tight">Samvaad</p>
						<p className="text-[10px] text-slate-400">Always connected</p>
					</div>
				</div>
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setShowCreateGroup(true)}
						className="text-slate-400 hover:text-white hover:bg-slate-800/50 h-8 w-8"
						title="Create Group"
					>
						<Users className="w-4 h-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="text-slate-400 hover:text-white hover:bg-slate-800/50 h-8 w-8"
						title="Settings"
					>
						<Settings className="w-4 h-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleLogout}
						className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8"
						title="Logout"
					>
						<LogOut className="w-4 h-4" />
					</Button>
				</div>
			</motion.div>

			{/* New User Search */}
			<div className="px-3 py-3 border-b border-slate-800/50">
				<UserSearch />
			</div>

			{/* Search Chats */}
			<div className="px-3 py-3 border-b border-slate-800/50">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
					<Input
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search conversations..."
						className="h-9 pl-9 pr-9 bg-slate-900/80 border-slate-800 focus-visible:border-primary/50 text-sm"
					/>
					{searchQuery && (
						<Button
							size="icon"
							variant="ghost"
							onClick={() => setSearchQuery("")}
							className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-500 hover:text-white"
						>
							<X className="w-3 h-3" />
						</Button>
					)}
				</div>
			</div>

			{/* Conversations List */}
			<div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2">
				<AnimatePresence>
					{filteredConversations.length === 0 && !searchQuery ? (
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
							<p className="text-xs text-slate-600 mb-4">
								Search for users or create a group
							</p>
							<Button
								size="sm"
								onClick={() => setShowCreateGroup(true)}
								className="bg-primary hover:bg-primary/90"
							>
								<Users className="w-4 h-4 mr-2" />
								Create Group
							</Button>
						</motion.div>
					) : filteredConversations.length === 0 ? (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="flex flex-col items-center justify-center h-full text-center px-6 py-12"
						>
							<p className="text-sm text-slate-400">No chats found</p>
							<p className="text-xs text-slate-600">
								Try a different search term
							</p>
						</motion.div>
					) : (
						<>
							{/* Pinned Chats */}
							{pinnedChats.length > 0 && (
								<div className="mb-4">
									<p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
										Pinned
									</p>
									{pinnedChats.map((c) => (
										<ChatItem key={c.id} conversation={c} />
									))}
								</div>
							)}

							{/* Regular Chats */}
							{regularChats.length > 0 && (
								<div>
									{pinnedChats.length > 0 && (
										<p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2 mt-2">
											All Chats
										</p>
									)}
									{regularChats.map((c) => (
										<ChatItem key={c.id} conversation={c} />
									))}
								</div>
							)}

							{/* Archived Chats */}
							{archivedChats.length > 0 && (
								<div className="mt-4">
									<p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
										Archived ({archivedChats.length})
									</p>
									{archivedChats.map((c) => (
										<ChatItem key={c.id} conversation={c} />
									))}
								</div>
							)}
						</>
					)}
				</AnimatePresence>
			</div>

			{/* User Profile Footer */}
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

			{/* Create Group Dialog */}
			<CreateGroupDialog
				open={showCreateGroup}
				onOpenChange={setShowCreateGroup}
				onSuccess={handleGroupCreated}
			/>
		</div>
	);
}