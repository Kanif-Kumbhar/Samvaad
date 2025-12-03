"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Smile, Paperclip, Mic, X, File as FileIcon } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import VoiceRecorder from "./VoiceRecorder";
import { uploadToCloudinary } from "@/lib/upload";
import Image from "next/image";

interface Props {
	conversationId: string;
}

export default function MessageInput({ conversationId }: Props) {
	const [value, setValue] = useState("");
	const [showEmoji, setShowEmoji] = useState(false);
	const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [filePreview, setFilePreview] = useState<string | null>(null);

	const { user, token } = useAuthStore();
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
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
			if (filePreview) URL.revokeObjectURL(filePreview);
		};
	}, [filePreview]);

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

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 10 * 1024 * 1024) {
			alert("File size must be less than 10MB");
			return;
		}

		setSelectedFile(file);

		if (file.type.startsWith("image/")) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setFilePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		} else {
			setFilePreview(null);
		}
	};

	const handleSend = async () => {
		const trimmed = value.trim();
		if (!trimmed && !selectedFile) return;
		if (!token) return;

		const socket = getSocket();
		if (!socket || !user) return;

		try {
			let attachmentUrl;
			let attachmentType;
			let attachmentName;

			if (selectedFile) {
				setUploading(true);
				const result = await uploadToCloudinary(
					selectedFile,
					token,
					setUploadProgress
				);
				attachmentUrl = result.url;
				attachmentType = result.type;
				attachmentName = selectedFile.name;
				setUploading(false);
			}

			socket.emit("message:send", {
				conversationId,
				content: trimmed || "📎 Attachment",
				attachmentUrl,
				attachmentType,
				attachmentName,
			});

			setValue("");
			setSelectedFile(null);
			setFilePreview(null);
			setUploadProgress(0);
			emitTyping(false);

			if (textareaRef.current) {
				textareaRef.current.style.height = "auto";
			}
		} catch (error) {
			console.error("Send error:", error);
			alert("Failed to send message");
			setUploading(false);
		}
	};

	const handleVoiceComplete = async (audioBlob: Blob) => {
		if (!token) return;

		try {
			setShowVoiceRecorder(false);
			setUploading(true);

			const audioFile = new window.File(
				[audioBlob],
				`voice-${Date.now()}.webm`,
				{
					type: "audio/webm",
				}
			);

			const result = await uploadToCloudinary(
				audioFile,
				token,
				setUploadProgress
			);

			const socket = getSocket();
			if (socket) {
				socket.emit("message:send", {
					conversationId,
					content: "🎤 Voice message",
					attachmentUrl: result.url,
					attachmentType: "audio",
					attachmentName: audioFile.name,
				});
			}

			setUploading(false);
			setUploadProgress(0);
		} catch (error) {
			console.error("Voice upload error:", error);
			alert("Failed to send voice message");
			setUploading(false);
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

	if (showVoiceRecorder) {
		return (
			<div className="border-t border-slate-800/50 bg-slate-900/80 backdrop-blur-xl p-4">
				<VoiceRecorder
					onRecordComplete={handleVoiceComplete}
					onCancel={() => setShowVoiceRecorder(false)}
				/>
			</div>
		);
	}

	return (
		<div className="relative border-t border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">

			<AnimatePresence>
				{selectedFile && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						className="p-3 border-b border-slate-800/50"
					>
						<div className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-3">
							{filePreview ? (
								<div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
									<Image
										src={filePreview}
										alt="Preview"
										fill
										className="object-cover"
										unoptimized
									/>
								</div>
							) : (
								<div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
									<FileIcon className="w-8 h-8 text-slate-400" />
								</div>
							)}
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-slate-200 truncate">
									{selectedFile.name}
								</p>
								<p className="text-xs text-slate-500">
									{(selectedFile.size / 1024).toFixed(1)} KB
								</p>
							</div>
							<Button
								size="icon"
								variant="ghost"
								onClick={() => {
									setSelectedFile(null);
									setFilePreview(null);
								}}
								className="text-slate-400 hover:text-red-400 flex-shrink-0"
							>
								<X className="w-4 h-4" />
							</Button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{uploading && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center"
					>
						<div className="text-center">
							<div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
							<p className="text-sm text-slate-300">
								Uploading... {uploadProgress}%
							</p>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

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

			<div className="p-4 flex items-end gap-2">

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

				<div className="flex-1 relative bg-slate-800/50 rounded-2xl border border-slate-700/50 focus-within:border-primary/50 transition-colors">
					<Textarea
						ref={textareaRef}
						placeholder="Type a message..."
						value={value}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						disabled={uploading}
						rows={1}
						className="resize-none border-0 bg-transparent text-slate-100 placeholder:text-slate-500 focus-visible:ring-0 py-3 px-4 pr-12 min-h-[44px] max-h-[120px] custom-scrollbar"
					/>

					<Button
						size="icon"
						variant="ghost"
						onClick={() => fileInputRef.current?.click()}
						disabled={uploading}
						className="absolute right-2 bottom-2 h-8 w-8 text-slate-400 hover:text-primary hover:bg-slate-700/50"
					>
						<Paperclip className="w-4 h-4" />
					</Button>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*,video/*,.pdf,.doc,.docx,.txt"
						onChange={handleFileSelect}
						className="hidden"
					/>
				</div>

				<AnimatePresence mode="wait">
					{value.trim() || selectedFile ? (
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
								disabled={uploading}
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
								onClick={() => setShowVoiceRecorder(true)}
								className="h-10 w-10 shrink-0 text-slate-400 hover:text-primary hover:bg-slate-800/50"
							>
								<Mic className="w-5 h-5" />
							</Button>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}