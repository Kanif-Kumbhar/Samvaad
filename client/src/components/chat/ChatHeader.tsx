"use client";

import { useEffect, useState } from "react";
import { Conversation, User } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Video, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSocket } from "@/lib/socket";

export default function ChatHeader({
	otherUser: initialUser,
}: {
	conversation: Conversation;
	otherUser: User | null;
}) {
	const [otherUser, setOtherUser] = useState(initialUser);

	useEffect(() => {
		if (!initialUser) return;

		const socket = getSocket();
		if (!socket) return;

		const handleStatusUpdate = (data: {
			userId: string;
			isOnline: boolean;
		}) => {
			if (data.userId === initialUser.id) {
				setOtherUser((prev) =>
					prev ? { ...prev, isOnline: data.isOnline } : null
				);
			}
		};

		socket.on("user:status", handleStatusUpdate);

		return () => {
			socket.off("user:status", handleStatusUpdate);
		};
	}, [initialUser]);

	if (!otherUser) return null;

	return (
		<motion.header
			initial={{ y: -20, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			className="h-16 border-b border-slate-800/50 px-4 flex items-center justify-between bg-slate-900/80 backdrop-blur-xl relative z-20"
		>
			{/* User Info */}
			<div className="flex items-center gap-3">
				<div className="relative">
					<Avatar className="h-10 w-10 ring-2 ring-slate-700">
						<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
							{otherUser.username?.[0]?.toUpperCase() ?? "U"}
						</AvatarFallback>
					</Avatar>

					{/* Online Status Dot */}
					<AnimatePresence>
						{otherUser.isOnline && (
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								exit={{ scale: 0 }}
								className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-slate-900"
							/>
						)}
					</AnimatePresence>
				</div>

				<div className="flex flex-col">
					<span className="text-sm font-semibold text-slate-100">
						{otherUser.username}
					</span>

					{/* Status Text with Animation */}
					<AnimatePresence mode="wait">
						{otherUser.isOnline ? (
							<motion.span
								key="online"
								initial={{ opacity: 0, y: -5 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 5 }}
								className="text-xs text-green-400 font-medium flex items-center gap-1"
							>
								<span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
								Online
							</motion.span>
						) : (
							<motion.span
								key="offline"
								initial={{ opacity: 0, y: -5 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 5 }}
								className="text-xs text-slate-500"
							>
								Offline
							</motion.span>
						)}
					</AnimatePresence>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex items-center gap-2">
				<Button
					size="icon"
					variant="ghost"
					className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 h-9 w-9"
				>
					<Phone className="w-4 h-4" />
				</Button>
				<Button
					size="icon"
					variant="ghost"
					className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 h-9 w-9"
				>
					<Video className="w-4 h-4" />
				</Button>
				<Button
					size="icon"
					variant="ghost"
					className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 h-9 w-9"
				>
					<MoreVertical className="w-4 h-4" />
				</Button>
			</div>
		</motion.header>
	);
}