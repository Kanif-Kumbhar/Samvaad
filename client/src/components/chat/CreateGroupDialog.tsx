"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Users, Search, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface User {
	id: string;
	username: string;
	email: string;
	avatar?: string;
	isOnline: boolean;
}

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

export default function CreateGroupDialog({
	open,
	onOpenChange,
	onSuccess,
}: Props) {
	const [groupName, setGroupName] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<User[]>([]);
	const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [creating, setCreating] = useState(false);
	const { token } = useAuthStore();

	const handleSearch = async (query: string) => {
		setSearchQuery(query);
		if (!query.trim() || !token) {
			setSearchResults([]);
			return;
		}

		try {
			setLoading(true);
			const data = await api.searchUsers(query, token);
			const filtered = (data.users || []).filter(
				(u: User) => !selectedUsers.some((s) => s.id === u.id)
			);
			setSearchResults(filtered);
		} catch (error) {
			console.error("Search error:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSelectUser = (user: User) => {
		if (!selectedUsers.some((u) => u.id === user.id)) {
			setSelectedUsers([...selectedUsers, user]);
			setSearchResults(searchResults.filter((u) => u.id !== user.id));
			setSearchQuery("");
		}
	};

	const handleRemoveUser = (userId: string) => {
		setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
	};

	const handleCreateGroup = async () => {
		if (!groupName.trim()) {
			toast.error("Please enter a group name");
			return;
		}

		if (selectedUsers.length === 0) {
			toast.error("Please select at least one member");
			return;
		}

		if (!token) return;

		try {
			setCreating(true);
			const participantIds = selectedUsers.map((u) => u.id);
			await api.createGroup({ groupName, participantIds }, token);

			toast.success("Group created successfully!");
			setGroupName("");
			setSelectedUsers([]);
			setSearchQuery("");
			setSearchResults([]);
			onSuccess();
			onOpenChange(false);
		} catch (error) {
			console.error("Create group error:", error);
			toast.error("Failed to create group");
		} finally {
			setCreating(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create Group Chat</DialogTitle>
					<DialogDescription>
						Add members to your new group conversation
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="groupName">Group Name</Label>
						<Input
							id="groupName"
							placeholder="Enter group name..."
							value={groupName}
							onChange={(e) => setGroupName(e.target.value)}
							maxLength={50}
						/>
					</div>

					{selectedUsers.length > 0 && (
						<div className="space-y-2">
							<Label>Members ({selectedUsers.length})</Label>
							<div className="flex flex-wrap gap-2">
								<AnimatePresence>
									{selectedUsers.map((user) => (
										<motion.div
											key={user.id}
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.8 }}
											className="flex items-center gap-2 bg-slate-800 rounded-full pl-2 pr-3 py-1"
										>
											<Avatar className="h-6 w-6">
												<AvatarFallback className="bg-primary text-xs">
													{user.username[0].toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<span className="text-sm">{user.username}</span>
											<button
												onClick={() => handleRemoveUser(user.id)}
												className="text-slate-400 hover:text-white"
											>
												<X className="w-3 h-3" />
											</button>
										</motion.div>
									))}
								</AnimatePresence>
							</div>
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="search">Add Members</Label>
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
							<Input
								id="search"
								placeholder="Search users..."
								value={searchQuery}
								onChange={(e) => handleSearch(e.target.value)}
								className="pl-9"
							/>
						</div>

						<div className="max-h-[200px] overflow-y-auto space-y-1">
							{loading ? (
								<div className="flex items-center justify-center py-8">
									<Loader2 className="w-6 h-6 animate-spin text-primary" />
								</div>
							) : searchResults.length > 0 ? (
								searchResults.map((user) => (
									<button
										key={user.id}
										onClick={() => handleSelectUser(user)}
										className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors"
									>
										<Avatar className="h-8 w-8">
											<AvatarFallback className="bg-primary">
												{user.username[0].toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 text-left">
											<p className="text-sm font-medium">{user.username}</p>
											<p className="text-xs text-slate-500">{user.email}</p>
										</div>
									</button>
								))
							) : searchQuery ? (
								<p className="text-sm text-slate-500 text-center py-4">
									No users found
								</p>
							) : null}
						</div>
					</div>
				</div>

				<div className="flex gap-2 justify-end mt-4">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={creating}
					>
						Cancel
					</Button>
					<Button
						onClick={handleCreateGroup}
						disabled={
							creating || !groupName.trim() || selectedUsers.length === 0
						}
					>
						{creating ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Creating...
							</>
						) : (
							<>
								<Users className="w-4 h-4 mr-2" />
								Create Group
							</>
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}