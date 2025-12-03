import { Response } from "express";
import { AuthRequest } from "../types";
import cloudinary from "../config/cloudinary";

export const getUploadSignature = async (req: AuthRequest, res: Response) => {
	try {
		const { folder } = req.body;
		const timestamp = Math.round(new Date().getTime() / 1000);

		const signature = cloudinary.utils.api_sign_request(
			{
				timestamp,
				folder: folder || "chat-uploads",
			},
			process.env.CLOUDINARY_API_SECRET!
		);

		res.json({
			signature,
			timestamp,
			cloudName: process.env.CLOUDINARY_CLOUD_NAME,
			apiKey: process.env.CLOUDINARY_API_KEY,
		});
	} catch (error) {
		console.error("Upload signature error:", error);
		res.status(500).json({ error: "Failed to generate upload signature" });
	}
};