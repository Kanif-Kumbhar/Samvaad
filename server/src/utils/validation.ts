import { body } from "express-validator";

export const registerValidation = [
	body("username")
		.trim()
		.isLength({ min: 3, max: 30 })
		.withMessage("Username must be 3-30 characters"),
	body("email").isEmail().normalizeEmail().withMessage("Invalid email address"),
	body("password")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters"),
];

export const loginValidation = [
	body("email").isEmail().normalizeEmail().withMessage("Invalid email address"),
	body("password").notEmpty().withMessage("Password is required"),
];

export const messageValidation = [
	body("content").trim().notEmpty().withMessage("Message content is required"),
	body("conversationId").isUUID().withMessage("Invalid conversation ID"),
];