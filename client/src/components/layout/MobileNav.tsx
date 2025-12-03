"use client";

import { useState } from "react";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetTitle,
	SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MessageCircle, Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

export default function MobileNav() {
	const [open, setOpen] = useState(false);

	return (
		<header className="h-14 border-b flex items-center justify-between px-4 bg-background/80 backdrop-blur">
			<div className="flex items-center gap-2">
				<div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
					<MessageCircle className="w-4 h-4 text-primary-foreground" />
				</div>
				<span className="font-semibold text-sm">ChatApp</span>
			</div>

			<Sheet open={open} onOpenChange={setOpen}>
				<SheetTrigger asChild>
					<Button size="icon" variant="ghost" className="md:hidden">
						<Menu className="w-5 h-5" />
					</Button>
				</SheetTrigger>
				<SheetContent side="left" className="p-0 w-[280px]">
					{/* Visually hidden but accessible to screen readers */}
					<VisuallyHidden>
						<SheetTitle>Navigation Menu</SheetTitle>
						<SheetDescription>
							Access your conversations, search for users, and manage your chats
						</SheetDescription>
					</VisuallyHidden>

					{/* Actual visible content */}
					<Sidebar />
				</SheetContent>
			</Sheet>
		</header>
	);
}