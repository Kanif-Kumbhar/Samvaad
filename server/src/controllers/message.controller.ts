import { Response } from "express";
import { AuthRequest } from "../types";
import prisma from "../config/prisma";

export const getMessages = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId!;
		const { conversationId } = req.params;
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 50;
		const skip = (page - 1) * limit;

		const participant = await prisma.participant.findFirst({
			where: {
				userId,
				conversationId,
			},
		});

		if (!participant) {
			return res
				.status(403)
				.json({ error: "Not authorized to view this conversation" });
		}

		const messages = await prisma.message.findMany({
			where: { conversationId },
			orderBy: { createdAt: "asc" },
			skip,
			take: limit,
			include: {
				sender: {
					select: {
						id: true,
						username: true,
						avatar: true,
					},
				},
			},
		});

		const total = await prisma.message.count({
			where: { conversationId },
		});

		await prisma.message.updateMany({
			where: {
				conversationId,
				receiverId: userId,
				status: { in: ["SENT", "DELIVERED"] },
			},
			data: { status: "SEEN" },
		});

		await prisma.participant.update({
			where: { id: participant.id },
			data: { unreadCount: 0 },
		});

		res.json({
			messages,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Get messages error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId!;
		const { messageId } = req.params;

		const message = await prisma.message.findUnique({
			where: { id: messageId },
		});

		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}

		if (message.senderId !== userId) {
			return res
				.status(403)
				.json({ error: "Not authorized to delete this message" });
		}

		await prisma.message.delete({
			where: { id: messageId },
		});

		res.json({ success: true, messageId });
	} catch (error) {
		console.error("Delete message error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};