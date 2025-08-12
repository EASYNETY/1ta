import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket"], // Ensures better real-time performance
});

export default socket;