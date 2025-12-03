import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import prisma from "../config/prisma";
import { generateToken } from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ error: errors.array()[0].msg });
		}

		const { username, email, password } = req.body;

		// Check if user exists
		const existingUser = await prisma.user.findFirst({
			where: { OR: [{ email }, { username }] },
		});

		if (existingUser) {
			return res.status(400).json({ error: "User already exists" });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create user
		const user = await prisma.user.create({
			data: {
				username,
				email,
				password: hashedPassword,
			},
			select: {
				id: true,
				username: true,
				email: true,
				avatar: true,
				isOnline: true,
				lastSeen: true,
			},
		});

		const token = generateToken(user.id);

		res.status(201).json({ user, token });
	} catch (error) {
		console.error("Register error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ error: errors.array()[0].msg });
		}

		const { email, password } = req.body;

		// Find user
		const user = await prisma.user.findUnique({ where: { email } });

		if (!user) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		// Verify password
		const isValidPassword = await bcrypt.compare(password, user.password);

		if (!isValidPassword) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		// Update online status
		await prisma.user.update({
			where: { id: user.id },
			data: { isOnline: true },
		});

		const token = generateToken(user.id);

		res.json({
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				avatar: user.avatar,
				isOnline: true,
				lastSeen: user.lastSeen,
			},
			token,
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};