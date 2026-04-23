const { Server } = require("socket.io");
const ChatMessage = require("../models/ChatMessage");
const { normalizeRoomKey } = require("../Utils/roomKey");

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected: " + socket.id);

    socket.on("send_message", (data) => {
      io.emit("receive_message", data);
    });

    socket.on("join_chat", ({ roomKey, role }) => {
      if (role === "admin") socket.join("admin_all");
      if (roomKey && typeof roomKey === "string") {
        const rk = normalizeRoomKey(roomKey);
        if (rk) socket.join(rk);
      }
    });

    socket.on("leave_chat", ({ roomKey }) => {
      if (!roomKey || typeof roomKey !== "string") return;
      socket.leave(normalizeRoomKey(roomKey));
    });

    socket.on("chat_send", async (payload, ack) => {
      try {
        const { roomKey, senderEmail, senderName, senderRole, text } = payload || {};
        const rk = normalizeRoomKey(roomKey || senderEmail || "");
        const email = String(senderEmail || "").trim().toLowerCase();
        const body = String(text || "").trim();

        if (!rk || !email || !body) {
          const err = "roomKey, senderEmail and text are required";
          if (typeof ack === "function") ack({ ok: false, message: err });
          return;
        }

        const role =
          senderRole === "admin" ? "admin" : senderRole === "guest" ? "guest" : "student";

        if (role !== "admin" && normalizeRoomKey(email) !== rk) {
          const err = "You can only post to your own chat room";
          if (typeof ack === "function") ack({ ok: false, message: err });
          return;
        }

        const doc = await ChatMessage.create({
          roomKey: rk,
          senderEmail: email,
          senderName: String(senderName || "").trim().slice(0, 120),
          senderRole: role,
          text: body.slice(0, 2000),
        });

        const plain = doc.toObject();
        if (rk) {
          io.to(rk).emit("chat_message", plain);
        }
        io.to("admin_all").emit("admin_inbox", { roomKey: rk, message: plain });
        if (typeof ack === "function") ack({ ok: true, data: plain });
      } catch (e) {
        console.error("chat_send error:", e.message);
        if (typeof ack === "function") ack({ ok: false, message: e.message });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected: " + socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { initSocket, getIO };