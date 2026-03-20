import { io } from "socket.io-client";

// Point this directly to your Node.js server root (not the /api/v1 path)
const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false, // connect manually when user opens messages
});

export default socket;
