import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = (token: string): Socket => {
	if (!socket) {
		socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
			auth: { token },
			transports: ["websocket"],
		});
	}
	return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
};