import { Response } from "express";
import { AuthRequest } from "../types";
import prisma from "../config/prisma";

export const getConversations = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId!;

		const participants = await prisma.participant.findMany({
			where: { userId },
			include: {
				conversation: {
					include: {
						participants: {
							where: { userId: { not: userId } },
							include: {
								user: {
									select: {
										id: true,
										username: true,
										email: true,
										avatar: true,
										isOnline: true,
										lastSeen: true,
									},
								},
							},
						},
						messages: {
							orderBy: { createdAt: "desc" },
							take: 1,
						},
					},
				},
			},
			orderBy: {
				conversation: {
					updatedAt: "desc",
				},
			},
		});

		const conversations = participants.map((p) => ({
			id: p.conversation.id,
			participants: p.conversation.participants.map((part) => part.user),
			lastMessage: p.conversation.messages[0] || null,
			unreadCount: p.unreadCount,
			isPinned: p.conversation.isPinned,
			isArchived: p.conversation.isArchived,
			createdAt: p.conversation.createdAt,
			updatedAt: p.conversation.updatedAt,
		}));

		res.json({ conversations });
	} catch (error) {
		console.error("Get conversations error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const createConversation = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId!;
		const { participantId } = req.body;

		if (!participantId) {
			return res.status(400).json({ error: "Participant ID is required" });
		}

		if (participantId === userId) {
			return res
				.status(400)
				.json({ error: "Cannot create conversation with yourself" });
		}

		const existingConversation = await prisma.conversation.findFirst({
			where: {
				participants: {
					every: {
						userId: { in: [userId, participantId] },
					},
				},
			},
			include: {
				participants: {
					include: {
						user: {
							select: {
								id: true,
								username: true,
								email: true,
								avatar: true,
								isOnline: true,
								lastSeen: true,
							},
						},
					},
				},
			},
		});

		if (existingConversation) {
			const formattedConversation = {
				id: existingConversation.id,
				participants: existingConversation.participants.map((p) => p.user),
				lastMessage: null,
				unreadCount: 0,
				isPinned: existingConversation.isPinned,
				isArchived: existingConversation.isArchived,
				createdAt: existingConversation.createdAt,
				updatedAt: existingConversation.updatedAt,
			};
			return res.json({ conversation: formattedConversation });
		}

		const conversation = await prisma.conversation.create({
			data: {
				participants: {
					create: [{ userId }, { userId: participantId }],
				},
			},
			include: {
				participants: {
					include: {
						user: {
							select: {
								id: true,
								username: true,
								email: true,
								avatar: true,
								isOnline: true,
								lastSeen: true,
							},
						},
					},
				},
			},
		});

		const formattedConversation = {
			id: conversation.id,
			participants: conversation.participants.map((p) => p.user),
			lastMessage: null,
			unreadCount: 0,
			isPinned: conversation.isPinned,
			isArchived: conversation.isArchived,
			createdAt: conversation.createdAt,
			updatedAt: conversation.updatedAt,
		};

		res.status(201).json({ conversation: formattedConversation });
	} catch (error) {
		console.error("Create conversation error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const togglePinConversation = async (
	req: AuthRequest,
	res: Response
) => {
	try {
		const userId = req.userId!;
		const { conversationId } = req.params;
		const participant = await prisma.participant.findFirst({
			where: { userId, conversationId },
		});

		if (!participant) {
			return res.status(403).json({ error: "Not authorized" });
		}

		const conversation = await prisma.conversation.update({
			where: { id: conversationId },
			data: {
				isPinned: {
					set: !(
						await prisma.conversation.findUnique({
							where: { id: conversationId },
						})
					)?.isPinned,
				},
			},
		});

		res.json({ success: true, isPinned: conversation.isPinned });
	} catch (error) {
		console.error("Toggle pin error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const toggleArchiveConversation = async (
	req: AuthRequest,
	res: Response
) => {
	try {
		const userId = req.userId!;
		const { conversationId } = req.params;

		const participant = await prisma.participant.findFirst({
			where: { userId, conversationId },
		});

		if (!participant) {
			return res.status(403).json({ error: "Not authorized" });
		}

		const conversation = await prisma.conversation.update({
			where: { id: conversationId },
			data: {
				isArchived: {
					set: !(
						await prisma.conversation.findUnique({
							where: { id: conversationId },
						})
					)?.isArchived,
				},
			},
		});

		res.json({ success: true, isArchived: conversation.isArchived });
	} catch (error) {
		console.error("Toggle archive error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};