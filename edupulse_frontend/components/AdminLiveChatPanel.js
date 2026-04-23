"use client";

import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { FaPaperPlane } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

const API = "http://localhost:3001";

export default function AdminLiveChatPanel({ busy, setBusy }) {
  const { user } = useContext(AuthContext) || {};
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const socketRef = useRef(null);
  const listEndRef = useRef(null);
  const activeRoomRef = useRef(null);
  const prevJoinedRef = useRef(null);

  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  const loadRooms = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/chat/rooms`);
      setRooms(res.data?.data || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadThread = async (roomKey) => {
    if (!roomKey) {
      console.error('Room key is undefined for loadThread');
      return;
    }
    setBusy(true);
    try {
      const res = await axios.get(`${API}/api/chat/history`, { params: { roomKey } });
      setMessages(res.data?.data || []);
      setActiveRoom(roomKey);
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    const s = io(API, { transports: ["websocket", "polling"] });
    socketRef.current = s;

    s.on("connect", () => {
      s.emit("join_chat", { role: "admin" });
      const ar = activeRoomRef.current;
      if (ar) {
        s.emit("join_chat", { roomKey: ar, role: "admin" });
        prevJoinedRef.current = ar;
      }
    });

    s.on("admin_inbox", () => loadRooms());

    s.on("chat_message", (msg) => {
      loadRooms();
      if (msg?.roomKey && msg.roomKey === activeRoomRef.current) {
        setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
      }
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
      prevJoinedRef.current = null;
    };
  }, [loadRooms]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s?.connected) return;
    const prev = prevJoinedRef.current;
    if (prev && prev !== activeRoom && prev) s.emit("leave_chat", { roomKey: prev });
    prevJoinedRef.current = activeRoom || null;
    if (activeRoom) s.emit("join_chat", { roomKey: activeRoom, role: "admin" });
  }, [activeRoom]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const body = text.trim();
    if (!body || !activeRoom || !socketRef.current?.connected) return;
    const payload = {
      roomKey: activeRoom,
      senderEmail: String(user?.Email || "admin@gmail.com").toLowerCase(),
      senderName: user?.Name || "Admin",
      senderRole: "admin",
      text: body,
    };
    socketRef.current.emit("chat_send", payload, (res) => {
      if (!res?.ok) alert(res?.message || "Send failed");
    });
    setText("");
  };

  return (
    <div className="admin-chat-grid">
      <div className="admin-card">
        <div className="admin-card-head">
          <h3 style={{ margin: 0 }}>Inbox</h3>
          <button type="button" className="secondary-btn" onClick={loadRooms} disabled={busy}>
            Refresh
          </button>
        </div>
        <div className="admin-chat-rooms">
          {rooms.length === 0 && <div className="admin-empty">No conversations yet.</div>}
          {rooms.map((r) => (
            <button
              key={r._id}
              type="button"
              className={`admin-chat-room ${activeRoom === r._id ? "active" : ""}`}
              onClick={() => loadThread(r._id)}
            >
              <span className="mono admin-chat-room-key">{r._id}</span>
              <span className="admin-chat-preview">
                {(r.lastMessage?.text || "—").slice(0, 90)}
                {r.lastMessage?.senderRole ? ` · ${r.lastMessage.senderRole}` : ""}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card admin-chat-thread">
        <h3 style={{ marginTop: 0 }}>{activeRoom ? "Conversation" : "Select a thread"}</h3>
        {!activeRoom ? (
          <p className="admin-empty">Open a student or guest thread from the list.</p>
        ) : (
          <>
            <p className="mono admin-chat-room-label">
              Room: <strong>{activeRoom}</strong>
            </p>
            <div className="admin-chat-messages">
              {messages.map((m) => (
                <div
                  key={m._id}
                  className={`live-chat-bubble ${m.senderRole === "admin" ? "from-admin" : "from-user"}`}
                >
                  <span className="live-chat-meta">
                    {m.senderName || m.senderEmail} · {m.senderRole}
                  </span>
                  <p>{m.text}</p>
                </div>
              ))}
              <div ref={listEndRef} />
            </div>
            <div className="live-chat-input-row">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Reply as admin…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <button type="button" className="live-chat-send" onClick={send} aria-label="Send">
                <FaPaperPlane />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
