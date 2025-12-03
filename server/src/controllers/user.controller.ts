import { Response } from "express";
import { AuthRequest } from "../types";
import prisma from "../config/prisma";

export const searchUsers = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId!;
		const { q } = req.query;

		if (!q || typeof q !== "string" || q.trim().length < 2) {
			return res
				.status(400)
				.json({ error: "Query must be at least 2 characters" });
		}

		const users = await prisma.user.findMany({
			where: {
				AND: [
					{ id: { not: userId } },
					{
						OR: [
							{ username: { contains: q.trim(), mode: "insensitive" } },
							{ email: { contains: q.trim(), mode: "insensitive" } },
						],
					},
				],
			},
			select: {
				id: true,
				username: true,
				email: true,
				avatar: true,
				isOnline: true,
				lastSeen: true,
			},
			take: 10,
		});

		res.json({ users });
	} catch (error) {
		console.error("Search users error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};