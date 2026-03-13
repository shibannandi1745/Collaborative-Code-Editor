import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { db } from "@workspace/db";
import { roomMembersTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  path: "/api/socket.io",
});

// Track active typing users per room
const typingUsers = new Map<string, Set<string>>(); // roomId -> Set of userIds

io.on("connection", (socket) => {
  let currentUserId: string | null = null;
  let currentRoomId: string | null = null;

  socket.on("join-room", async (data: { roomId: string; userId: string }) => {
    const { roomId, userId } = data;
    currentUserId = userId;
    currentRoomId = roomId;

    socket.join(roomId);

    // Add to DB if not already member
    try {
      await db.insert(roomMembersTable).values({ roomId, userId }).onConflictDoNothing();
      await db.update(usersTable).set({ status: "online", currentRoomId: roomId }).where(eq(usersTable.id, userId));
    } catch (_e) {
      // ignore
    }

    socket.to(roomId).emit("user-joined", { userId });
    io.to(roomId).emit("room-members-updated", { roomId });
  });

  socket.on("leave-room", async (data: { roomId: string; userId: string }) => {
    const { roomId, userId } = data;
    socket.leave(roomId);

    try {
      await db.delete(roomMembersTable).where(
        and(eq(roomMembersTable.roomId, roomId), eq(roomMembersTable.userId, userId))
      );
      await db.update(usersTable).set({ currentRoomId: null }).where(eq(usersTable.id, userId));
    } catch (_e) {
      // ignore
    }

    socket.to(roomId).emit("user-left", { userId });
    io.to(roomId).emit("room-members-updated", { roomId });
  });

  socket.on("code-change", (data: { roomId: string; fileId: string; content: string; userId: string }) => {
    socket.to(data.roomId).emit("code-change", data);
  });

  socket.on("cursor-move", (data: { roomId: string; fileId: string; line: number; column: number; userId: string; username: string; color: string }) => {
    socket.to(data.roomId).emit("cursor-move", data);
  });

  socket.on("user-typing", (data: { roomId: string; userId: string; username: string; fileId: string }) => {
    const { roomId, userId } = data;
    if (!typingUsers.has(roomId)) {
      typingUsers.set(roomId, new Set());
    }
    typingUsers.get(roomId)!.add(userId);
    socket.to(roomId).emit("user-typing", data);
  });

  socket.on("user-stopped-typing", (data: { roomId: string; userId: string; fileId: string }) => {
    const { roomId, userId } = data;
    if (typingUsers.has(roomId)) {
      typingUsers.get(roomId)!.delete(userId);
    }
    socket.to(roomId).emit("user-stopped-typing", data);
  });

  socket.on("file-selected", (data: { roomId: string; userId: string; fileId: string; filename: string }) => {
    socket.to(data.roomId).emit("file-selected", data);
  });

  socket.on("file-created", (data: { roomId: string; file: object }) => {
    socket.to(data.roomId).emit("file-created", data);
  });

  socket.on("file-deleted", (data: { roomId: string; fileId: string }) => {
    socket.to(data.roomId).emit("file-deleted", data);
  });

  socket.on("terminal-output", (data: { roomId: string; output: string }) => {
    io.to(data.roomId).emit("terminal-output", data);
  });

  socket.on("language-change", (data: { roomId: string; language: string; userId: string }) => {
    socket.to(data.roomId).emit("language-change", data);
  });

  socket.on("disconnect", async () => {
    if (currentUserId && currentRoomId) {
      socket.to(currentRoomId).emit("user-left", { userId: currentUserId });
      try {
        await db.delete(roomMembersTable).where(
          and(
            eq(roomMembersTable.roomId, currentRoomId),
            eq(roomMembersTable.userId, currentUserId)
          )
        );
        await db.update(usersTable)
          .set({ status: "offline", currentRoomId: null })
          .where(eq(usersTable.id, currentUserId));
      } catch (_e) {
        // ignore
      }
    }
  });
});

httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
