"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Trash2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
	onRecordComplete: (audioBlob: Blob) => void;
	onCancel: () => void;
}

export default function VoiceRecorder({ onRecordComplete, onCancel }: Props) {
	const [isRecording, setIsRecording] = useState(false);
	const [recordingTime, setRecordingTime] = useState(0);
	const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const mediaRecorder = new MediaRecorder(stream);
			mediaRecorderRef.current = mediaRecorder;
			chunksRef.current = [];

			mediaRecorder.ondataavailable = (e) => {
				if (e.data.size > 0) {
					chunksRef.current.push(e.data);
				}
			};

			mediaRecorder.onstop = () => {
				const blob = new Blob(chunksRef.current, { type: "audio/webm" });
				setAudioBlob(blob);
				stream.getTracks().forEach((track) => track.stop());
			};

			mediaRecorder.start();
			setIsRecording(true);
			setRecordingTime(0);

			timerRef.current = setInterval(() => {
				setRecordingTime((prev) => prev + 1);
			}, 1000);
		} catch (error) {
			console.error("Error accessing microphone:", error);
			alert("Could not access microphone. Please check permissions.");
		}
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		}
	};

	const handleDelete = () => {
		setAudioBlob(null);
		setRecordingTime(0);
		onCancel();
	};

	const handleSend = () => {
		if (audioBlob) {
			onRecordComplete(audioBlob);
			setAudioBlob(null);
			setRecordingTime(0);
		}
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 20 }}
			className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-2xl border border-slate-700"
		>
			<AnimatePresence mode="wait">
				{!isRecording && !audioBlob && (
					<motion.div
						key="start"
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						exit={{ scale: 0 }}
					>
						<Button
							size="icon"
							onClick={startRecording}
							className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600"
						>
							<Mic className="w-5 h-5" />
						</Button>
					</motion.div>
				)}

				{isRecording && (
					<motion.div
						key="recording"
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						exit={{ scale: 0 }}
						className="flex items-center gap-3 flex-1"
					>
						<Button
							size="icon"
							onClick={stopRecording}
							className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600 animate-pulse"
						>
							<Square className="w-5 h-5" />
						</Button>
						<div className="flex-1">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
								<span className="text-sm font-mono text-red-400">
									Recording {formatTime(recordingTime)}
								</span>
							</div>
							<div className="flex gap-1 mt-2">
								{Array.from({ length: 20 }).map((_, i) => (
									<motion.div
										key={i}
										animate={{
											height: [4, 16, 4],
										}}
										transition={{
											duration: 0.8,
											repeat: Infinity,
											delay: i * 0.1,
										}}
										className="w-1 bg-red-500 rounded-full"
									/>
								))}
							</div>
						</div>
					</motion.div>
				)}

				{audioBlob && !isRecording && (
					<motion.div
						key="recorded"
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						exit={{ scale: 0 }}
						className="flex items-center gap-3 flex-1"
					>
						<div className="flex-1">
							<p className="text-sm text-slate-300">
								Voice note recorded ({formatTime(recordingTime)})
							</p>
						</div>
						<Button
							size="icon"
							variant="ghost"
							onClick={handleDelete}
							className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
						>
							<Trash2 className="w-5 h-5" />
						</Button>
						<Button
							size="icon"
							onClick={handleSend}
							className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700"
						>
							<Send className="w-5 h-5" />
						</Button>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}