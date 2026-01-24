import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";
import { API_BASE } from "./api";

let socket: Socket | null = null;

export const getSocket = async () => {
  if (!socket) {
    const token = await AsyncStorage.getItem("accessToken");

    // Auto-detect URL from API_BASE (remove http/https and port if needed, or just use API_BASE)
    // Socket.io client usually expects the base URL.

    socket = io(API_BASE, {
      auth: {
        token: token,
      },
      transports: ["websocket"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket?.id);
    });

    socket.on("connect_error", (err: any) => {
      console.error("[Socket] Connection error:", err.message);
    });

    socket.on("disconnect", (reason: any) => {
      console.log("[Socket] Disconnected:", reason);
    });
  }

  // Update token if it changed (re-auth logic if needed, but simple for now)
  return socket;
};

export const joinDoubtRoom = (socket: Socket, doubtId: string) => {
  // We can emit an event to join the room, OR the backend handles "join_room".
  // Backend code (Step 33) shows general 'connection' and 'join_class' events.
  // I added 'emitToUser' logic in backend but didn't explicitly implement `join_doubt` handler in backend SocketService yet.
  // However, backend doubtRoutes emits to `doubt_${doubtId}`.
  // Socket.io default adapter allows joining rooms.
  // I need to ADD a handler in backend `SocketService` or `server.ts` to allow client to join arbitrary rooms?
  // OR I can use the default `socket` instance in `server.ts` to listen for join events.
  // Let's assume I need to add `socket.on('join_doubt', ...)` in backend.

  socket.emit("join_doubt", doubtId);
};

export const leaveDoubtRoom = (socket: Socket, doubtId: string) => {
  socket.emit("leave_doubt", doubtId);
};
