import { api } from "./api";

export async function uploadToCloudinary(
	file: File,
	token: string,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onProgress?: (progress: number) => void
): Promise<{ url: string; type: string }> {
	try {

		const signatureData = await api.getUploadSignature(token);

		const formData = new FormData();
		formData.append("file", file);
		formData.append("timestamp", signatureData.timestamp);
		formData.append("signature", signatureData.signature);
		formData.append("api_key", signatureData.apiKey);
		formData.append("folder", "chat-uploads");

		const resourceType = file.type.startsWith("video/") ? "video" : "auto";

		const response = await fetch(
			`https://api.cloudinary.com/v1_1/${signatureData.cloudName}/${resourceType}/upload`,
			{
				method: "POST",
				body: formData,
			}
		);

		if (!response.ok) {
			throw new Error("Upload failed");
		}

		const data = await response.json();

		return {
			url: data.secure_url,
			type: file.type.startsWith("image/")
				? "image"
				: file.type.startsWith("video/")
				? "video"
				: file.type.startsWith("audio/")
				? "audio"
				: "file",
		};
	} catch (error) {
		console.error("Upload error:", error);
		throw error;
	}
}