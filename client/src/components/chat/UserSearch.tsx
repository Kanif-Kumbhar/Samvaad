"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { api } from "@/lib/api";
import { User } from "@/types";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserSearch() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<User[]>([]);
	const { token } = useAuthStore();
	const { addConversation, setActiveConversation } = useChatStore();
	const router = useRouter();

	const handleSearch = async (value: string) => {
		setQuery(value);
		if (!token || value.trim().length < 2) {
			setResults([]);
			return;
		}
		const data = await api.searchUsers(value.trim(), token);
		setResults(data.users || []);
	};

	const handleStartChat = async (userId: string) => {
		if (!token) return;
		const data = await api.createConversation(userId, token);
		if (data.conversation) {
			addConversation(data.conversation);
			setActiveConversation(data.conversation.id);
			router.push(`/chat/${data.conversation.id}`);
			setQuery("");
			setResults([]);
		}
	};

	return (
		<div className="relative">
			<div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-2">
				<Search className="w-4 h-4 text-slate-500" />
				<Input
					value={query}
					onChange={(e) => handleSearch(e.target.value)}
					placeholder="Search users..."
					className="border-0 focus-visible:ring-0 h-8 bg-transparent text-xs"
				/>
			</div>
			{results.length > 0 && (
				<div className="absolute z-20 mt-1 w-full rounded-lg bg-slate-900 border border-slate-800 shadow-lg max-h-64 overflow-y-auto custom-scrollbar">
					{results.map((u) => (
						<button
							key={u.id}
							onClick={() => handleStartChat(u.id)}
							className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center justify-between"
						>
							<span>{u.username}</span>
							<span className="text-[10px] text-slate-400">{u.email}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}