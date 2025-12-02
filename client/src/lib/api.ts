const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = {
	login: async (email: string, password: string) => {
		const res = await fetch(`${API_URL}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});
		return res.json();
	},

	register: async (username: string, email: string, password: string) => {
		const res = await fetch(`${API_URL}/auth/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username, email, password }),
		});
		return res.json();
	},

	getConversations: async (token: string) => {
		const res = await fetch(`${API_URL}/conversations`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return res.json();
	},

	getMessages: async (conversationId: string, token: string, page = 1) => {
		const res = await fetch(
			`${API_URL}/messages/${conversationId}?page=${page}&limit=50`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		return res.json();
	},

	searchUsers: async (query: string, token: string) => {
		const res = await fetch(`${API_URL}/users/search?q=${query}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return res.json();
	},

	createConversation: async (participantId: string, token: string) => {
		const res = await fetch(`${API_URL}/conversations`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ participantId }),
		});
		return res.json();
	},
};