"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { api } from "@/lib/api";
import { MessageCircle, Search, Users, X } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardHome() {
	const { token } = useAuthStore();
	const { conversations, setConversations } = useChatStore();

	useEffect(() => {
		if (!token) return;

		const fetchConversations = async () => {
			try {
				const data = await api.getConversations(token);
				setConversations(data.conversations || []);
			} catch (error) {
				console.error("Error fetching conversations:", error);
			}
		};

		fetchConversations();
	}, [token, setConversations]);

	return (
		<div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-8">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="text-center space-y-6 max-w-md"
			>
				{/* Icon */}
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
					className="mx-auto w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center shadow-lg"
				>
					<MessageCircle className="w-12 h-12 text-primary" />
				</motion.div>

				{/* Title */}
				<div>
					<h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
						Welcome to ChatApp
					</h1>
					<p className="text-lg text-slate-400 mb-6">
						{conversations.length === 0
							? "Start connecting with people around you"
							: `You have ${conversations.length} active conversation${
									conversations.length !== 1 ? "s" : ""
							  }`}
					</p>
				</div>

				{/* Feature Cards */}
				<div className="grid grid-cols-1 gap-4 text-left">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.3 }}
						className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-slate-800/70 transition-colors"
					>
						<div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
							<Search className="w-5 h-5 text-blue-400" />
						</div>
						<div>
							<h3 className="font-semibold mb-1">Search Users</h3>
							<p className="text-sm text-slate-400">
								Use the search box in the sidebar to find people and start
								chatting
							</p>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.4 }}
						className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-slate-800/70 transition-colors"
					>
						<div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
							<MessageCircle className="w-5 h-5 text-purple-400" />
						</div>
						<div>
							<h3 className="font-semibold mb-1">Real-time Messaging</h3>
							<p className="text-sm text-slate-400">
								Send and receive messages instantly with typing indicators
							</p>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.5 }}
						className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-slate-800/70 transition-colors"
					>
						<div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
							<Users className="w-5 h-5 text-green-400" />
						</div>
						<div>
							<h3 className="font-semibold mb-1">See Who's Online</h3>
							<p className="text-sm text-slate-400">
								Track online status and last seen of your contacts
							</p>
						</div>
					</motion.div>
				</div>

				{/* Quick Tip */}
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6 }}
					className="text-sm text-slate-500 mt-8"
				>
					💡 Tip: Click on any conversation in the sidebar to start chatting
				</motion.p>
			</motion.div>
		</div>
	);
}