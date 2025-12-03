"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Smile, Paperclip, Mic } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";

interface Props {
	conversationId: string;
}

export default function MessageInput({ conversationId }: Props) {
	const [value, setValue] = useState("");
	const [showEmoji, setShowEmoji] = useState(false);
	const [isRecording, setIsRecording] = useState(false);
	const { user } = useAuthStore();
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const typingTimeout = useRef<NodeJS.Timeout | null>(null);
	const canEmit = useRef(true);

	const emitTyping = (isTyping: boolean) => {
		const socket = getSocket();
		if (!socket || !user) return;
		socket.emit("typing", {
			conversationId,
			userId: user.id,
			isTyping,
		});
	};

	useEffect(() => {
		return () => {
			if (typingTimeout.current) clearTimeout(typingTimeout.current);
		};
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setValue(e.target.value);

		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${Math.min(
				textareaRef.current.scrollHeight,
				120
			)}px`;
		}

		if (!canEmit.current) return;
		canEmit.current = false;
		emitTyping(true);

		if (typingTimeout.current) clearTimeout(typingTimeout.current);
		typingTimeout.current = setTimeout(() => {
			emitTyping(false);
			canEmit.current = true;
		}, 3000);
	};

	const handleSend = () => {
		const trimmed = value.trim();
		if (!trimmed) return;
		const socket = getSocket();
		if (!socket || !user) return;

		socket.emit("message:send", {
			conversationId,
			content: trimmed,
		});

		setValue("");
		emitTyping(false);

		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const onEmojiClick = (emojiData: EmojiClickData) => {
		setValue((prev) => prev + emojiData.emoji);
		textareaRef.current?.focus();
	};

	return (
		<div className="relative border-t border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
			{/* Emoji Picker */}
			<AnimatePresence>
				{showEmoji && (
					<motion.div
						initial={{ opacity: 0, y: 20, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 20, scale: 0.95 }}
						transition={{ type: "spring", stiffness: 500, damping: 30 }}
						className="absolute bottom-full left-4 mb-2 z-50"
					>
						<EmojiPicker
							onEmojiClick={onEmojiClick}
							theme={Theme.DARK}
							width={320}
							height={400}
							searchDisabled={false}
							skinTonesDisabled={false}
							previewConfig={{ showPreview: false }}
						/>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Input Container */}
			<div className="p-4 flex items-end gap-2">
				{/* Emoji Button */}
				<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
					<Button
						size="icon"
						variant="ghost"
						className="h-10 w-10 text-slate-400 hover:text-primary hover:bg-slate-800/50 shrink-0"
						onClick={() => setShowEmoji(!showEmoji)}
					>
						<Smile className="w-5 h-5" />
					</Button>
				</motion.div>

				{/* Text Input */}
				<div className="flex-1 relative bg-slate-800/50 rounded-2xl border border-slate-700/50 focus-within:border-primary/50 transition-colors">
					<Textarea
						ref={textareaRef}
						placeholder="Type a message..."
						value={value}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						rows={1}
						className="resize-none border-0 bg-transparent text-slate-100 placeholder:text-slate-500 focus-visible:ring-0 py-3 px-4 min-h-[44px] max-h-[120px] custom-scrollbar"
					/>

					{/* Attachment Button (Inside Input) */}
					<Button
						size="icon"
						variant="ghost"
						className="absolute right-2 bottom-2 h-8 w-8 text-slate-400 hover:text-primary hover:bg-slate-700/50"
					>
						<Paperclip className="w-4 h-4" />
					</Button>
				</div>

				{/* Send/Voice Button */}
				<AnimatePresence mode="wait">
					{value.trim() ? (
						<motion.div
							key="send"
							initial={{ scale: 0, rotate: -180 }}
							animate={{ scale: 1, rotate: 0 }}
							exit={{ scale: 0, rotate: 180 }}
							transition={{ type: "spring", stiffness: 500, damping: 25 }}
						>
							<Button
								size="icon"
								onClick={handleSend}
								className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shrink-0"
							>
								<Send className="w-5 h-5" />
							</Button>
						</motion.div>
					) : (
						<motion.div
							key="voice"
							initial={{ scale: 0, rotate: 180 }}
							animate={{ scale: 1, rotate: 0 }}
							exit={{ scale: 0, rotate: -180 }}
							transition={{ type: "spring", stiffness: 500, damping: 25 }}
						>
							<Button
								size="icon"
								variant="ghost"
								className={`h-10 w-10 shrink-0 ${
									isRecording
										? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
										: "text-slate-400 hover:text-primary hover:bg-slate-800/50"
								}`}
								onClick={() => setIsRecording(!isRecording)}
							>
								<Mic
									className={`w-5 h-5 ${isRecording ? "animate-pulse" : ""}`}
								/>
							</Button>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}