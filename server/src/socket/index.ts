import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "../utils/jwt";
import { setupMessageHandlers } from "./handlers";
import prisma from "../config/prisma";

export const initializeSocket = (httpServer: HttpServer) => {
	const io = new SocketServer(httpServer, {
		cors: {
			origin: process.env.CLIENT_URL || "http://localhost:3000",
			credentials: true,
		},
		transports: ["websocket", "polling"],
	});

	io.use(async (socket, next) => {
		try {
			const token = socket.handshake.auth.token;

			if (!token) {
				return next(new Error("Authentication error: No token provided"));
			}

			const decoded = verifyToken(token);
			socket.data.userId = decoded.userId;

			await prisma.user.update({
				where: { id: decoded.userId },
				data: { isOnline: true },
			});

			next();
		} catch (error) {
			next(new Error("Authentication error: Invalid token"));
		}
	});

	io.on("connection", (socket) => {
		console.log(`User connected: ${socket.data.userId}`);

		setupMessageHandlers(io, socket);

		socket.on("disconnect", async () => {
			console.log(`User disconnected: ${socket.data.userId}`);

			await prisma.user.update({
				where: { id: socket.data.userId },
				data: {
					isOnline: false,
					lastSeen: new Date(),
				},
			});
		});
	});

	return io;
};