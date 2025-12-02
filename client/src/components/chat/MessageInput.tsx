"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";

interface Props {
	conversationId: string;
}

export default function MessageInput({ conversationId }: Props) {
	const [value, setValue] = useState("");
	const { user } = useAuthStore();
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

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);

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
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="h-16 border-t px-3 flex items-center gap-2 bg-background/80 backdrop-blur">
			<Input
				placeholder="Type a message..."
				value={value}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				className="h-11 bg-slate-900/60 border-slate-800"
			/>
			<Button
				size="icon"
				className="h-11 w-11 rounded-full"
				onClick={handleSend}
			>
				<Send className="w-4 h-4" />
			</Button>
		</div>
	);
}