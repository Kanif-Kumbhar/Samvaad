import { Server as SocketServer, Socket } from "socket.io";
import prisma from "../config/prisma";

export const setupMessageHandlers = (io: SocketServer, socket: Socket) => {
	const userId = socket.data.userId;

	socket.on(
		"message:send",
		async (data: { conversationId: string; content: string }) => {
			try {
				const { conversationId, content } = data;

				const participant = await prisma.participant.findFirst({
					where: { userId, conversationId },
				});

				if (!participant) {
					socket.emit("error", { message: "Not authorized" });
					return;
				}

				const otherParticipant = await prisma.participant.findFirst({
					where: {
						conversationId,
						userId: { not: userId },
					},
				});

				if (!otherParticipant) {
					socket.emit("error", { message: "Conversation not found" });
					return;
				}

				const message = await prisma.message.create({
					data: {
						content,
						senderId: userId,
						receiverId: otherParticipant.userId,
						conversationId,
						status: "SENT",
					},
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

				await prisma.conversation.update({
					where: { id: conversationId },
					data: { updatedAt: new Date() },
				});

				await prisma.participant.update({
					where: { id: otherParticipant.id },
					data: { unreadCount: { increment: 1 } },
				});

				io.emit("message:new", message);

				const receiver = await prisma.user.findUnique({
					where: { id: otherParticipant.userId },
					select: { isOnline: true },
				});

				if (receiver?.isOnline) {
					await prisma.message.update({
						where: { id: message.id },
						data: { status: "DELIVERED" },
					});

					io.emit("message:status", {
						messageId: message.id,
						status: "DELIVERED",
					});
				}
			} catch (error) {
				console.error("Send message error:", error);
				socket.emit("error", { message: "Failed to send message" });
			}
		}
	);

	socket.on(
		"typing",
		(data: { conversationId: string; userId: string; isTyping: boolean }) => {
			socket.broadcast.emit("typing", data);
		}
	);

	socket.on("message:seen", async (data: { messageId: string }) => {
		try {
			const message = await prisma.message.findUnique({
				where: { id: data.messageId },
			});

			if (!message || message.receiverId !== userId) {
				return;
			}

			await prisma.message.update({
				where: { id: data.messageId },
				data: { status: "SEEN" },
			});

			io.emit("message:status", {
				messageId: data.messageId,
				status: "SEEN",
			});
		} catch (error) {
			console.error("Message seen error:", error);
		}
	});
};