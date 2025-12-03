"use client";

import { motion } from "framer-motion";

interface Props {
	username?: string;
}

export default function TypingIndicator({ username }: Props) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10, scale: 0.9 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: 10, scale: 0.9 }}
			className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl rounded-bl-md bg-slate-800/80 border border-slate-700/50 shadow-lg backdrop-blur-sm"
		>
			<div className="flex gap-1">
				{[0, 1, 2].map((i) => (
					<motion.span
						key={i}
						animate={{
							y: [0, -8, 0],
							opacity: [0.5, 1, 0.5],
						}}
						transition={{
							duration: 1,
							repeat: Infinity,
							delay: i * 0.15,
							ease: "easeInOut",
						}}
						className="w-2 h-2 rounded-full bg-slate-400"
					/>
				))}
			</div>
			<span className="text-xs text-slate-400 font-medium">
				{username || "Someone"} is typing
			</span>
		</motion.div>
	);
}