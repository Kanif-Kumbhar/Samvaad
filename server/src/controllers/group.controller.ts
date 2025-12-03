import { Response } from "express";
import { AuthRequest } from "../types";
import prisma from "../config/prisma";
import { body, validationResult } from "express-validator";

export const createGroupValidation = [
	body("groupName")
		.trim()
		.isLength({ min: 1, max: 50 })
		.withMessage("Group name must be between 1 and 50 characters"),
	body("participantIds")
		.isArray({ min: 1 })
		.withMessage("At least one participant is required"),
];

export const createGroup = async (req: AuthRequest, res: Response) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const userId = req.userId!;
		const { groupName, participantIds, groupAvatar } = req.body;

		const users = await prisma.user.findMany({
			where: { id: { in: participantIds } },
		});

		if (users.length !== participantIds.length) {
			return res.status(400).json({ error: "Some users not found" });
		}

		const conversation = await prisma.conversation.create({
			data: {
				isGroup: true,
				groupName,
				groupAvatar,
				creatorId: userId,
				participants: {
					create: [
						{
							userId,
							role: "ADMIN",
						},
						...participantIds
							.filter((id: string) => id !== userId)
							.map((id: string) => ({
								userId: id,
								role: "MEMBER",
							})),
					],
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
							},
						},
					},
				},
				creator: {
					select: {
						id: true,
						username: true,
					},
				},
			},
		});

		res.status(201).json({ conversation });
	} catch (error) {
		console.error("Create group error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const updateGroup = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId!;
		const { conversationId } = req.params;
		const { groupName, groupAvatar } = req.body;

		const participant = await prisma.participant.findFirst({
			where: {
				userId,
				conversationId,
				role: "ADMIN",
			},
		});

		if (!participant) {
			return res.status(403).json({ error: "Only admins can update group" });
		}

		const conversation = await prisma.conversation.update({
			where: { id: conversationId },
			data: {
				groupName: groupName || undefined,
				groupAvatar: groupAvatar || undefined,
			},
			include: {
				participants: {
					include: {
						user: {
							select: {
								id: true,
								username: true,
								avatar: true,
								isOnline: true,
							},
						},
					},
				},
			},
		});

		res.json({ conversation });
	} catch (error) {
		console.error("Update group error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const addGroupMember = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId!;
		const { conversationId } = req.params;
		const { memberId } = req.body;

		const participant = await prisma.participant.findFirst({
			where: {
				userId,
				conversationId,
				role: "ADMIN",
			},
		});

		if (!participant) {
			return res.status(403).json({ error: "Only admins can add members" });
		}

		const existingMember = await prisma.participant.findFirst({
			where: {
				userId: memberId,
				conversationId,
			},
		});

		if (existingMember) {
			return res.status(400).json({ error: "User is already a member" });
		}

		await prisma.participant.create({
			data: {
				userId: memberId,
				conversationId,
				role: "MEMBER",
			},
		});

		res.json({ success: true });
	} catch (error) {
		console.error("Add member error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const removeGroupMember = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId!;
		const { conversationId, memberId } = req.params;

		const participant = await prisma.participant.findFirst({
			where: {
				userId,
				conversationId,
				role: "ADMIN",
			},
		});

		if (!participant) {
			return res.status(403).json({ error: "Only admins can remove members" });
		}

		const conversation = await prisma.conversation.findUnique({
			where: { id: conversationId },
			select: { creatorId: true },
		});

		if (conversation?.creatorId === memberId) {
			return res.status(400).json({ error: "Cannot remove group creator" });
		}

		await prisma.participant.deleteMany({
			where: {
				userId: memberId,
				conversationId,
			},
		});

		res.json({ success: true });
	} catch (error) {
		console.error("Remove member error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const makeAdmin = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId!;
		const { conversationId, memberId } = req.params;

		const participant = await prisma.participant.findFirst({
			where: {
				userId,
				conversationId,
				role: "ADMIN",
			},
		});

		if (!participant) {
			return res.status(403).json({ error: "Only admins can promote members" });
		}

		await prisma.participant.updateMany({
			where: {
				userId: memberId,
				conversationId,
			},
			data: {
				role: "ADMIN",
			},
		});

		res.json({ success: true });
	} catch (error) {
		console.error("Make admin error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const leaveGroup = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId!;
		const { conversationId } = req.params;

		const conversation = await prisma.conversation.findUnique({
			where: { id: conversationId },
			select: { creatorId: true },
		});

		if (conversation?.creatorId === userId) {
			const nextAdmin = await prisma.participant.findFirst({
				where: {
					conversationId,
					userId: { not: userId },
					role: "ADMIN",
				},
			});

			if (nextAdmin) {
				await prisma.conversation.update({
					where: { id: conversationId },
					data: { creatorId: nextAdmin.userId },
				});
			} else {
				const oldestMember = await prisma.participant.findFirst({
					where: {
						conversationId,
						userId: { not: userId },
					},
					orderBy: { joinedAt: "asc" },
				});

				if (oldestMember) {
					await prisma.conversation.update({
						where: { id: conversationId },
						data: { creatorId: oldestMember.userId },
					});
					await prisma.participant.update({
						where: { id: oldestMember.id },
						data: { role: "ADMIN" },
					});
				}
			}
		}

		await prisma.participant.deleteMany({
			where: {
				userId,
				conversationId,
			},
		});

		res.json({ success: true });
	} catch (error) {
		console.error("Leave group error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};