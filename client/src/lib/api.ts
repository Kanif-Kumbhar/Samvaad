const API_URL = process.env.NEXT_PUBLIC_API_URL;

const handleResponse = async (res: Response) => {
	const contentType = res.headers.get("content-type");

	if (contentType && contentType.includes("application/json")) {
		return res.json();
	}

	const text = await res.text();
	return { error: text };
};

export const api = {
	login: async (email: string, password: string) => {
		const res = await fetch(`${API_URL}/api/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});
		return handleResponse(res);
	},

	register: async (username: string, email: string, password: string) => {
		const res = await fetch(`${API_URL}/api/auth/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username, email, password }),
		});
		return handleResponse(res);
	},

	getConversations: async (token: string) => {
		const res = await fetch(`${API_URL}/api/conversations`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return handleResponse(res);
	},

	getMessages: async (conversationId: string, token: string, page = 1) => {
		const res = await fetch(
			`${API_URL}/api/messages/${conversationId}?page=${page}&limit=50`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		return handleResponse(res);
	},

	searchUsers: async (query: string, token: string) => {
		const res = await fetch(`${API_URL}/api/users/search?q=${query}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return handleResponse(res);
	},

	createConversation: async (participantId: string, token: string) => {
		const res = await fetch(`${API_URL}/api/conversations`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ participantId }),
		});
		return handleResponse(res);
	},

	deleteMessage: async (messageId: string, token: string) => {
		const res = await fetch(`${API_URL}/api/messages/${messageId}`, {
			method: "DELETE",
			headers: { Authorization: `Bearer ${token}` },
		});
		return handleResponse(res);
	},

	togglePinConversation: async (conversationId: string, token: string) => {
		const res = await fetch(
			`${API_URL}/api/conversations/${conversationId}/pin`,
			{
				method: "PATCH",
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		return handleResponse(res);
	},

	toggleArchiveConversation: async (conversationId: string, token: string) => {
		const res = await fetch(
			`${API_URL}/api/conversations/${conversationId}/archive`,
			{
				method: "PATCH",
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		return handleResponse(res);
	},

	getUploadSignature: async (token: string) => {
		const res = await fetch(`${API_URL}/api/upload/signature`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ folder: "chat-uploads" }),
		});
		return handleResponse(res);
	},

	createGroup: async (
		data: { groupName: string; participantIds: string[]; groupAvatar?: string },
		token: string
	) => {
		const res = await fetch(`${API_URL}/api/groups`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(data),
		});
		return handleResponse(res);
	},

	updateGroup: async (
		conversationId: string,
		data: { groupName?: string; groupAvatar?: string },
		token: string
	) => {
		const res = await fetch(`${API_URL}/api/groups/${conversationId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(data),
		});
		return handleResponse(res);
	},

	addGroupMember: async (
		conversationId: string,
		memberId: string,
		token: string
	) => {
		const res = await fetch(`${API_URL}/api/groups/${conversationId}/members`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ memberId }),
		});
		return handleResponse(res);
	},

	removeGroupMember: async (
		conversationId: string,
		memberId: string,
		token: string
	) => {
		const res = await fetch(
			`${API_URL}/api/groups/${conversationId}/members/${memberId}`,
			{
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		return handleResponse(res);
	},

	makeGroupAdmin: async (
		conversationId: string,
		memberId: string,
		token: string
	) => {
		const res = await fetch(
			`${API_URL}/api/groups/${conversationId}/members/${memberId}/admin`,
			{
				method: "PATCH",
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		return handleResponse(res);
	},

	leaveGroup: async (conversationId: string, token: string) => {
		const res = await fetch(`${API_URL}/api/groups/${conversationId}/leave`, {
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
		});
		return handleResponse(res);
	},
};