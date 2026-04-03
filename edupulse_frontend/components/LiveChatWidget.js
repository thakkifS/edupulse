"use client";

import { useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { FaComments, FaPaperPlane, FaTimes, FaGraduationCap, FaLightbulb } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

const SOCKET_ORIGIN = "http://localhost:3001";
const CHAT_HISTORY = `${SOCKET_ORIGIN}/api/chat/history`;

function normalizeRoomKey(email) {
  return String(email || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._-]+/g, "_")
    .slice(0, 120);
}

const STUDY_TIPS = [
  "Try 25/5 Pomodoro: one topic per sprint, phone in another room.",
  "Schedule hard modules when your energy peaks; use your weekly planner first.",
  "Single-task for 45 minutes, then stretch — multitasking kills retention.",
  "Teach the idea out loud (Feynman); wherever you stumble is what to revise.",
  "Close extra tabs; match “Study:” blocks in the scheduler like appointments.",
  "Sleep beats cramming: protect your 22:00 wind-down slot in the grid.",
];

export default function LiveChatWidget({ pathname = "" }) {
  const ctx = useContext(AuthContext);
  const user = ctx?.user;
  const ready = ctx?.ready;

  const [open, setOpen] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestOk, setGuestOk] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [tipIdx, setTipIdx] = useState(0);
  const [badge, setBadge] = useState(0);
  const socketRef = useRef(null);
  const listEndRef = useRef(null);
  const openRef = useRef(false);

  const effectiveEmail = user?.Email?.trim().toLowerCase() || (guestOk ? guestEmail.trim().toLowerCase() : "");
  const effectiveName = (user?.Name || guestName.trim() || "Student").slice(0, 120);
  const senderRole =
    user?.role === "admin" ? "admin" : guestOk && !user?.Email ? "guest" : "student";

  const roomKey = useMemo(() => normalizeRoomKey(effectiveEmail), [effectiveEmail]);

  const hideFab = pathname.startsWith("/admin") || user?.role === "admin";

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const onReminderBadge = () => setBadge((n) => Math.min(99, n + 1));
    window.addEventListener("edupulse:inbox-badge", onReminderBadge);
    return () => window.removeEventListener("edupulse:inbox-badge", onReminderBadge);
  }, []);

  useEffect(() => {
    if (!open || hideFab) return;
    const t = window.setInterval(() => setTipIdx((i) => (i + 1) % STUDY_TIPS.length), 10000);
    return () => window.clearInterval(t);
  }, [open, hideFab]);

  const loadHistory = useCallback(async () => {
    if (!roomKey) return;
    try {
      const res = await fetch(`${CHAT_HISTORY}?roomKey=${encodeURIComponent(roomKey)}`);
      const json = await res.json();
      if (json.success) setMessages(json.data || []);
    } catch (e) {
      console.error(e);
    }
  }, [roomKey]);

  useEffect(() => {
    if (!open || hideFab || !roomKey) return;
    loadHistory();
  }, [open, hideFab, roomKey, loadHistory]);

  useEffect(() => {
    if (hideFab || !roomKey) {
      if (socketRef.current) {
        socketRef.current.emit("leave_chat", { roomKey });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }
    const s = io(SOCKET_ORIGIN, { transports: ["websocket", "polling"] });
    socketRef.current = s;
    s.on("connect", () => {
      s.emit("join_chat", { roomKey, role: "student" });
    });
    s.on("chat_message", (msg) => {
      if (normalizeRoomKey(msg.roomKey || "") !== roomKey) return;
      setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
      if (msg.senderRole === "admin" && !openRef.current) {
        setBadge((n) => Math.min(99, n + 1));
      }
    });
    return () => {
      s.emit("leave_chat", { roomKey });
      s.disconnect();
      socketRef.current = null;
    };
  }, [hideFab, roomKey]);

  const toggleFab = () => {
    setOpen((o) => {
      if (!o) {
        setBadge(0);
        return true;
      }
      return false;
    });
  };

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = () => {
    const body = text.trim();
    if (!body || !roomKey || !socketRef.current?.connected) {
      if (!socketRef.current?.connected) alert("Connecting… try again in a moment.");
      return;
    }
    const payload = {
      roomKey,
      senderEmail: effectiveEmail,
      senderName: effectiveName,
      senderRole,
      text: body,
    };
    socketRef.current.emit("chat_send", payload, (res) => {
      if (!res?.ok) alert(res?.message || "Could not send");
    });
    setText("");
  };

  const verifyGuest = () => {
    const em = guestEmail.trim().toLowerCase();
    if (!em.endsWith("@gmail.com")) {
      alert("Please use a @gmail.com address (same style as EduPulse sign-up).");
      return;
    }
    if (!guestName.trim()) {
      alert("Please enter your name.");
      return;
    }
    setGuestOk(true);
  };

  if (hideFab || !ready) return null;

  return (
    <>
      <button
        type="button"
        className="live-chat-fab"
        aria-label={
          badge > 0
            ? `Open live chat with admin, ${badge} notification${badge > 1 ? "s" : ""}`
            : "Open live chat with admin"
        }
        onClick={toggleFab}
      >
        <FaComments />
        {badge > 0 && (
          <span className="live-chat-fab-count" aria-hidden>
            {badge > 9 ? "9+" : badge}
          </span>
        )}
        {!open && badge === 0 && <span className="live-chat-fab-pulse" aria-hidden />}
      </button>

      {open && (
        <div className="live-chat-panel" role="dialog" aria-label="Support chat">
          <div className="live-chat-head">
            <div>
              <h3>Chat with Admin</h3>
              <p className="live-chat-sub">Live when online — your thread is saved after refresh.</p>
            </div>
            <button type="button" className="live-chat-close" aria-label="Close" onClick={() => setOpen(false)}>
              <FaTimes />
            </button>
          </div>

          <div className="live-chat-focus">
            <div className="live-chat-focus-title">
              <FaLightbulb aria-hidden /> Study focus
            </div>
            <p className="live-chat-focus-tip">{STUDY_TIPS[tipIdx]}</p>
            <div className="live-chat-focus-foot">
              <FaGraduationCap aria-hidden /> Short, daily blocks beat last-minute cramming.
            </div>
          </div>

          {!user && !guestOk ? (
            <div className="live-chat-guest">
              <p>Sign in for one-tap chat, or continue as guest:</p>
              <input placeholder="Your name" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
              <input
                placeholder="@gmail.com email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
              <button type="button" className="primary-btn" onClick={verifyGuest}>
                Start chat
              </button>
            </div>
          ) : (
            <>
              <div className="live-chat-messages">
                {messages.length === 0 && (
                  <p className="live-chat-empty">Say hello — an admin will pick up this thread.</p>
                )}
                {messages.map((m) => (
                  <div
                    key={m._id}
                    className={`live-chat-bubble ${m.senderRole === "admin" ? "from-admin" : "from-user"}`}
                  >
                    <span className="live-chat-meta">
                      {m.senderName || m.senderEmail} · {m.senderRole === "admin" ? "Admin" : "You"}
                    </span>
                    <p>{m.text}</p>
                    <span className="live-chat-time">
                      {m.createdAt
                        ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : ""}
                    </span>
                  </div>
                ))}
                <div ref={listEndRef} />
              </div>
              <div className="live-chat-input-row">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message…"
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
      )}
    </>
  );
}
