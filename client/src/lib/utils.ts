import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatMessageTime(date: Date): string {
	const now = new Date();
	const diff = now.getTime() - new Date(date).getTime();
	const hours = diff / (1000 * 60 * 60);

	if (hours < 24) {
		return new Date(date).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}