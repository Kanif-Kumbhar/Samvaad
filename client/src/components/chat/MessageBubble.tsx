"use client";

import { Message } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { cn, formatMessageTime } from "@/lib/utils";

export default function MessageBubble({ message }: { message: Message }) {
	const { user } = useAuthStore();
	const isMe = message.senderId === user?.id;

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 8, scale: 0.98 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			className={cn("flex mb-1", isMe ? "justify-end" : "justify-start")}
		>
			<div
				className={cn(
					"max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm",
					isMe
						? "bg-primary text-primary-foreground rounded-br-sm"
						: "bg-slate-800 text-slate-50 rounded-bl-sm"
				)}
			>
				<p className="whitespace-pre-wrap break-words">{message.content}</p>
				<div className="mt-1 flex items-center justify-end gap-1">
					<span className="text-[10px] opacity-70">
						{formatMessageTime(message.createdAt)}
					</span>
					{isMe && (
						<span className="text-[10px] opacity-80">
							{message.status === "seen"
								? "Seen"
								: message.status === "delivered"
								? "Delivered"
								: "Sent"}
						</span>
					)}
				</div>
			</div>
		</motion.div>
	);
}