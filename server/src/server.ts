import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { initializeSocket } from "./socket";
import { apiLimiter } from "./middleware/rateLimiter";

import authRoutes from "./routes/auth.routes";
import conversationRoutes from "./routes/conversation.routes";
import messageRoutes from "./routes/message.routes";
import userRoutes from "./routes/user.routes";
import uploadRoutes from "./routes/upload.routes";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = initializeSocket(httpServer);

app.use(helmet());
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		credentials: true,
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiLimiter);

app.get("/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);

app.use(
	(
		err: any,
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		console.error("Error:", err);
		res.status(err.status || 500).json({
			error: err.message || "Internal server error",
		});
	}
);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
	console.log(`📡 Socket.io ready for connections`);
});