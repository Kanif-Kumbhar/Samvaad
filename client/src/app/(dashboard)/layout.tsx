"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/Mobilenav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	const { user, token } = useAuthStore();
	const router = useRouter();

	useEffect(() => {
		if (!token) router.replace("/login");
	}, [token, router]);

	if (!token || !user) return null;

	return (
		<div className="h-screen w-full flex bg-background">
			<div className="hidden md:flex w-[320px] border-r flex-col">
				<Sidebar />
			</div>
			<div className="flex-1 flex flex-col">
				<div className="md:hidden">
					<MobileNav />
				</div>
				<main className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] md:h-screen">
					{children}
				</main>
			</div>
		</div>
	);
}