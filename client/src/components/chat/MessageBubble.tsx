"use client";

import { forwardRef, useState } from "react";
import { Message } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { cn, formatMessageTime } from "@/lib/utils";
import { Check, CheckCheck, Trash2 } from "lucide-react";
import { getSocket } from "@/lib/socket";

interface Props {
	message: Message;
	isLast?: boolean;
}

const MessageBubble = forwardRef<HTMLDivElement, Props>(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	({ message, isLast }, ref) => {
		const { user } = useAuthStore();
		const isMe = message.senderId === user?.id;
		const [isDeleting, setIsDeleting] = useState(false);

		const x = useMotionValue(0);
		const opacity = useTransform(x, [-100, 0], [0, 1]);
		const deleteOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);

		const handleDragEnd = (
			event: MouseEvent | TouchEvent | PointerEvent,
			info: PanInfo
		) => {
			if (info.offset.x < -100) {
				handleDelete();
			}
		};

		const handleDelete = () => {
			setIsDeleting(true);
			const socket = getSocket();
			if (socket) {
				socket.emit("message:delete", { messageId: message.id });
			}
		};

		return (
			<motion.div
				ref={ref}
				layout
				initial={{ opacity: 0, y: 20, scale: 0.95 }}
				animate={{
					opacity: isDeleting ? 0 : 1,
					y: 0,
					scale: 1,
					x: isDeleting ? (isMe ? 200 : -200) : 0,
				}}
				exit={{ opacity: 0, scale: 0.9, x: isMe ? 200 : -200 }}
				transition={{
					type: "spring",
					stiffness: 500,
					damping: 30,
					opacity: { duration: 0.2 },
				}}
				className={cn("flex relative", isMe ? "justify-end" : "justify-start")}
			>
				{/* Delete Icon Background (Only for my messages) */}
				{isMe && (
					<motion.div
						style={{ opacity: deleteOpacity }}
						className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-16 h-full"
					>
						<div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
							<Trash2 className="w-5 h-5 text-red-400" />
						</div>
					</motion.div>
				)}

				{/* Message Bubble */}
				<motion.div
					drag={isMe ? "x" : false}
					dragConstraints={{ left: -120, right: 0 }}
					dragElastic={0.2}
					onDragEnd={handleDragEnd}
					style={{ x: isMe ? x : 0, opacity }}
					whileHover={{ scale: 1.02 }}
					className={cn(
						"group relative max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-lg transition-all",
						isMe
							? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md"
							: "bg-gradient-to-br from-slate-800 to-slate-850 text-slate-100 rounded-bl-md border border-slate-700/50"
					)}
				>
					{/* Message Content */}
					<p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
						{message.content}
					</p>

					{/* Timestamp & Status */}
					<div
						className={cn(
							"flex items-center justify-end gap-1.5 mt-1",
							isMe ? "text-blue-100/70" : "text-slate-400"
						)}
					>
						<span className="text-[11px] font-medium">
							{formatMessageTime(message.createdAt)}
						</span>

						{isMe && (
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: "spring", stiffness: 500, damping: 25 }}
							>
								{message.status === "SEEN" ? (
									<CheckCheck className="w-4 h-4 text-blue-200" />
								) : message.status === "DELIVERED" ? (
									<CheckCheck className="w-4 h-4" />
								) : (
									<Check className="w-4 h-4" />
								)}
							</motion.div>
						)}
					</div>

					{/* Hover Delete Button */}
					{isMe && (
						<motion.button
							initial={{ opacity: 0, scale: 0 }}
							whileHover={{ scale: 1.1 }}
							className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-full flex items-center justify-center"
							onClick={handleDelete}
						>
							<Trash2 className="w-4 h-4 text-red-400" />
						</motion.button>
					)}
				</motion.div>
			</motion.div>
		);
	}
);

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;