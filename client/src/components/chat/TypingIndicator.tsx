"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function TypingIndicator() {
	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0, y: 4 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 4 }}
				className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800/80 text-[10px] text-slate-200"
			>
				<span className="flex gap-0.5">
					<span className="w-1 h-1 rounded-full bg-slate-200 animate-bounce [animation-delay:-0.2s]" />
					<span className="w-1 h-1 rounded-full bg-slate-200 animate-bounce [animation-delay:-0.1s]" />
					<span className="w-1 h-1 rounded-full bg-slate-200 animate-bounce" />
				</span>
				<span>Typing...</span>
			</motion.div>
		</AnimatePresence>
	);
}