"use client";

import { forwardRef, useState } from "react";
import { Message } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { cn, formatMessageTime } from "@/lib/utils";
import {
	Check,
	CheckCheck,
	Trash2,
	Download,
	Play,
	Pause,
	File as FileIcon,
} from "lucide-react";
import { getSocket } from "@/lib/socket";
import Image from "next/image";
import { Button } from "@/components/ui/button";

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
		const [isPlaying, setIsPlaying] = useState(false);
		const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
			null
		);

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

		const handlePlayAudio = () => {
			if (!message.attachmentUrl) return;

			if (audioElement) {
				if (isPlaying) {
					audioElement.pause();
					setIsPlaying(false);
				} else {
					audioElement.play();
					setIsPlaying(true);
				}
			} else {
				const audio = new Audio(message.attachmentUrl);
				audio.onended = () => setIsPlaying(false);
				audio.play();
				setIsPlaying(true);
				setAudioElement(audio);
			}
		};

		const renderAttachment = () => {
			if (!message.attachmentUrl) return null;

			switch (message.attachmentType) {
				case "image":
					return (
						<div className="relative w-full max-w-sm rounded-xl overflow-hidden mb-2 group">
							<Image
								src={message.attachmentUrl}
								alt={message.attachmentName || "Image"}
								width={400}
								height={300}
								className="w-full h-auto"
								unoptimized
							/>
							<a
								href={message.attachmentUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
							>
								<Download className="w-8 h-8 text-white" />
							</a>
						</div>
					);

				case "video":
					return (
						<div className="relative w-full max-w-sm rounded-xl overflow-hidden mb-2">
							<video
								src={message.attachmentUrl}
								controls
								className="w-full h-auto"
							/>
						</div>
					);

				case "audio":
					return (
						<div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl mb-2 min-w-[250px]">
							<Button
								size="icon"
								variant="ghost"
								onClick={handlePlayAudio}
								className="h-10 w-10 rounded-full bg-slate-600 hover:bg-slate-500"
							>
								{isPlaying ? (
									<Pause className="w-5 h-5 text-white" />
								) : (
									<Play className="w-5 h-5 text-white ml-0.5" />
								)}
							</Button>
							<div className="flex-1">
								<p className="text-xs font-medium text-slate-200">
									🎤 Voice Message
								</p>
								<div className="flex gap-0.5 mt-1">
									{Array.from({ length: 20 }).map((_, i) => (
										<div
											key={i}
											className={cn(
												"w-0.5 rounded-full transition-all",
												isPlaying ? "bg-blue-400" : "bg-slate-500",
												isPlaying ? "h-3 animate-pulse" : "h-2"
											)}
											style={{ animationDelay: `${i * 0.1}s` }}
										/>
									))}
								</div>
							</div>
						</div>
					);

				case "file":
					return (
						<a
							href={message.attachmentUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl mb-2 transition-colors group"
						>
							<div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
								<FileIcon className="w-5 h-5 text-slate-300" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-slate-200 truncate">
									{message.attachmentName || "File"}
								</p>
								<p className="text-xs text-slate-400">Click to download</p>
							</div>
							<Download className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
						</a>
					);

				default:
					return null;
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
					{renderAttachment()}

					{message.content && (
						<p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
							{message.content}
						</p>
					)}

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