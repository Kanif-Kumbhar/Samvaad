"use client";

import { useEffect, useRef } from "react";

export function useNotificationSound() {
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		if (typeof window !== "undefined") {
			audioRef.current = new Audio("/sounds/notification.wav");
			audioRef.current.volume = 0.5;
		}
	}, []);

	const play = () => {
		if (audioRef.current) {
			audioRef.current.currentTime = 0;
			audioRef.current.play().catch((err) => {
				console.log("Audio play failed:", err);
			});
		}
	};

	return { play };
}