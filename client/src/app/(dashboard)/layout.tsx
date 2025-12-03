"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	const { user, token, isHydrated } = useAuthStore();
	const router = useRouter();

	useEffect(() => {
		if (isHydrated && !token) {
			router.replace("/login");
		}
	}, [isHydrated, token, router]);

	// Wait for hydration
	if (!isHydrated) {
		return (
			<div className="h-screen w-full flex items-center justify-center bg-slate-950">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	// Redirecting to login
	if (!token || !user) {
		return (
			<div className="h-screen w-full flex items-center justify-center bg-slate-950">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="h-screen w-full flex bg-slate-950">
			{/* Desktop Sidebar */}
			<div className="hidden md:flex w-[320px] border-r border-slate-800 flex-col">
				<Sidebar />
			</div>

			{/* Main Content */}
			<div className="flex-1 flex flex-col">
				{/* Mobile Header */}
				<div className="md:hidden">
					<MobileNav />
				</div>

				{/* Page Content */}
				<main className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] md:h-screen overflow-hidden">
					{children}
				</main>
			</div>
		</div>
	);
}