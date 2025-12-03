export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Message {
	id: string;
	content: string;
	senderId: string;
	receiverId: string;
	conversationId: string;
	status: "SENT" | "DELIVERED" | "SEEN";
	createdAt: Date;
	updatedAt: Date;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TypingData {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}