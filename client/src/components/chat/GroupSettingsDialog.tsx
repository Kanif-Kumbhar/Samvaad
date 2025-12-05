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
import {
	Users,
	Shield,
	UserMinus,
	UserPlus,
	Loader2,
	Edit2,
	LogOut,
	Crown,
	Search,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { api } from "@/lib/api";
import { Conversation } from "@/types";
import { toast } from "sonner";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
	conversation: Conversation;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface User {
	id: string;
	username: string;
	email: string;
	avatar?: string;
	isOnline: boolean;
}

export default function GroupSettingsDialog({
	conversation,
	open,
	onOpenChange,
}: Props) {
	const [editingName, setEditingName] = useState(false);
	const [groupName, setGroupName] = useState(conversation.groupName || "");
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
	const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

	const { token, user } = useAuthStore();
	const { updateConversation } = useChatStore();
	const router = useRouter();

	const isAdmin = conversation.participants.some(
		(p) => p.id === user?.id && conversation.creatorId === user?.id
	);

	const handleUpdateName = async () => {
		if (!token || !groupName.trim()) return;

		try {
			setLoading(true);
			await api.updateGroup(conversation.id, { groupName }, token);
			updateConversation(conversation.id, { groupName });
			toast.success("Group name updated");
			setEditingName(false);
		} catch (error) {
			console.error("Update name error:", error);
			toast.error("Failed to update group name");
		} finally {
			setLoading(false);
		}
	};

	const handleSearchUsers = async (query: string) => {
		setSearchQuery(query);
		if (!query.trim() || !token) {
			setSearchResults([]);
			return;
		}

		try {
			setLoading(true);
			const data = await api.searchUsers(query, token);
			// Filter out existing members
			const filtered = (data.users || []).filter(
				(u: User) => !conversation.participants.some((p) => p.id === u.id)
			);
			setSearchResults(filtered);
		} catch (error) {
			console.error("Search error:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleAddMember = async (memberId: string) => {
		if (!token) return;

		try {
			setLoading(true);
			await api.addGroupMember(conversation.id, memberId, token);
			toast.success("Member added successfully");
			setSearchQuery("");
			setSearchResults([]);

			// Refresh conversations
			const data = await api.getConversations(token);
			updateConversation(
				conversation.id,
				data.conversations.find((c: Conversation) => c.id === conversation.id)
			);
		} catch (error) {
			console.error("Add member error:", error);
			toast.error("Failed to add member");
		} finally {
			setLoading(false);
		}
	};

	const handleRemoveMember = async (memberId: string) => {
		if (!token) return;

		try {
			setLoading(true);
			await api.removeGroupMember(conversation.id, memberId, token);
			toast.success("Member removed");
			setMemberToRemove(null);

			// Refresh conversations
			const data = await api.getConversations(token);
			updateConversation(
				conversation.id,
				data.conversations.find((c: Conversation) => c.id === conversation.id)
			);
		} catch (error) {
			console.error("Remove member error:", error);
			toast.error("Failed to remove member");
		} finally {
			setLoading(false);
		}
	};

	const handleMakeAdmin = async (memberId: string) => {
		if (!token) return;

		try {
			setLoading(true);
			await api.makeGroupAdmin(conversation.id, memberId, token);
			toast.success("Member promoted to admin");

			// Refresh conversations
			const data = await api.getConversations(token);
			updateConversation(
				conversation.id,
				data.conversations.find((c: Conversation) => c.id === conversation.id)
			);
		} catch (error) {
			console.error("Make admin error:", error);
			toast.error("Failed to promote member");
		} finally {
			setLoading(false);
		}
	};

	const handleLeaveGroup = async () => {
		if (!token) return;

		try {
			setLoading(true);
			await api.leaveGroup(conversation.id, token);
			toast.success("Left group successfully");
			onOpenChange(false);
			router.push("/");

			// Refresh conversations
			const data = await api.getConversations(token);
			const { setConversations } = useChatStore.getState();
			setConversations(data.conversations || []);
		} catch (error) {
			console.error("Leave group error:", error);
			toast.error("Failed to leave group");
		} finally {
			setLoading(false);
			setShowLeaveConfirm(false);
		}
	};

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Users className="w-5 h-5" />
							Group Settings
						</DialogTitle>
						<DialogDescription>
							Manage group members and settings
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6">
						{/* Group Name */}
						<div className="space-y-2">
							<Label>Group Name</Label>
							{editingName ? (
								<div className="flex gap-2">
									<Input
										value={groupName}
										onChange={(e) => setGroupName(e.target.value)}
										placeholder="Enter group name..."
										disabled={loading}
										maxLength={50}
									/>
									<Button
										size="sm"
										onClick={handleUpdateName}
										disabled={loading || !groupName.trim()}
									>
										{loading ? (
											<Loader2 className="w-4 h-4 animate-spin" />
										) : (
											"Save"
										)}
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={() => {
											setEditingName(false);
											setGroupName(conversation.groupName || "");
										}}
										disabled={loading}
									>
										Cancel
									</Button>
								</div>
							) : (
								<div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
									<span className="font-medium">
										{conversation.groupName || "Unnamed Group"}
									</span>
									{isAdmin && (
										<Button
											size="sm"
											variant="ghost"
											onClick={() => setEditingName(true)}
										>
											<Edit2 className="w-4 h-4" />
										</Button>
									)}
								</div>
							)}
						</div>

						{/* Add Members (Admin Only) */}
						{isAdmin && (
							<div className="space-y-2">
								<Label>Add Members</Label>
								<div className="relative">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
									<Input
										placeholder="Search users to add..."
										value={searchQuery}
										onChange={(e) => handleSearchUsers(e.target.value)}
										className="pl-9"
									/>
								</div>

								{/* Search Results */}
								{searchResults.length > 0 && (
									<div className="max-h-[150px] overflow-y-auto space-y-1 border border-slate-800 rounded-lg p-2">
										{searchResults.map((result) => (
											<button
												key={result.id}
												onClick={() => handleAddMember(result.id)}
												disabled={loading}
												className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
											>
												<Avatar className="h-8 w-8">
													<AvatarFallback className="bg-primary text-xs">
														{result.username[0].toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<div className="flex-1 text-left">
													<p className="text-sm font-medium">
														{result.username}
													</p>
													<p className="text-xs text-slate-500">
														{result.email}
													</p>
												</div>
												<UserPlus className="w-4 h-4 text-slate-400" />
											</button>
										))}
									</div>
								)}
							</div>
						)}

						{/* Members List */}
						<div className="space-y-2">
							<Label>Members ({conversation.participants?.length || 0})</Label>
							<div className="space-y-2 max-h-[300px] overflow-y-auto">
								{conversation.participants?.map((participant) => {
									const isCreator = participant.id === conversation.creatorId;
									const isCurrentUser = participant.id === user?.id;

									return (
										<motion.div
											key={participant.id}
											layout
											className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg"
										>
											<Avatar className="h-10 w-10">
												<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
													{participant.username[0].toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2">
													<p className="text-sm font-medium truncate">
														{participant.username}
													</p>
													{isCreator && (
														<div title="Group Creator">
															<Crown className="w-4 h-4 text-yellow-500" />
														</div>
													)}

													{isCurrentUser && (
														<span className="text-xs text-slate-500">
															(You)
														</span>
													)}
												</div>
												<p className="text-xs text-slate-500 truncate">
													{participant.email}
												</p>
											</div>

											{/* Admin Actions */}
											{isAdmin && !isCurrentUser && !isCreator && (
												<div className="flex gap-1">
													<Button
														size="sm"
														variant="ghost"
														onClick={() => handleMakeAdmin(participant.id)}
														disabled={loading}
														title="Make Admin"
													>
														<Shield className="w-4 h-4" />
													</Button>
													<Button
														size="sm"
														variant="ghost"
														onClick={() => setMemberToRemove(participant.id)}
														disabled={loading}
														className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
														title="Remove Member"
													>
														<UserMinus className="w-4 h-4" />
													</Button>
												</div>
											)}
										</motion.div>
									);
								})}
							</div>
						</div>

						{/* Leave Group */}
						<Button
							variant="outline"
							className="w-full text-red-400 border-red-500/50 hover:bg-red-500/10 hover:text-red-300"
							onClick={() => setShowLeaveConfirm(true)}
						>
							<LogOut className="w-4 h-4 mr-2" />
							Leave Group
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Remove Member Confirmation */}
			<AlertDialog
				open={!!memberToRemove}
				onOpenChange={() => setMemberToRemove(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove Member</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to remove this member from the group? This
							action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() =>
								memberToRemove && handleRemoveMember(memberToRemove)
							}
							className="bg-red-600 hover:bg-red-700"
						>
							Remove
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Leave Group Confirmation */}
			<AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Leave Group</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to leave this group?
							{isAdmin &&
								" As the creator, ownership will be transferred to another admin or the oldest member."}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleLeaveGroup}
							className="bg-red-600 hover:bg-red-700"
						>
							Leave Group
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}