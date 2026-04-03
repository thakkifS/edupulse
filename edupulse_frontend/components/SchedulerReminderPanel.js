"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FaBell, FaBellSlash, FaCheckCircle } from "react-icons/fa";

const pad2 = (n) => String(n).padStart(2, "0");
const toISODate = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

function inWeekRange(startDateStr, todayISO) {
  if (!startDateStr) return false;
  const start = new Date(startDateStr + "T12:00:00");
  if (Number.isNaN(start.getTime())) return false;
  for (let i = 0; i < 7; i++) {
    const x = new Date(start);
    x.setDate(start.getDate() + i);
    if (toISODate(x) === todayISO) return true;
  }
  return false;
}

function emitChatBadge() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("edupulse:inbox-badge", { detail: { source: "reminder" } }));
}

export default function SchedulerReminderPanel({ schedule, events, surveyStartDate }) {
  const [mounted, setMounted] = useState(false);
  const [perm, setPerm] = useState("default");
  const [toast, setToast] = useState(null);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    setMounted(true);
    if (typeof Notification !== "undefined") setPerm(Notification.permission);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const id = window.setInterval(() => setClock(new Date()), 60000);
    return () => window.clearInterval(id);
  }, [mounted]);

  const todayISO = useMemo(() => toISODate(clock), [clock]);

  const todayInPlan = useMemo(() => {
    if (!schedule?.days || !surveyStartDate) return null;
    if (!inWeekRange(surveyStartDate, todayISO)) return null;
    const day = schedule.days.find((d) => d.date === todayISO);
    if (!day) return null;
    const slots = [];
    for (const t of Object.keys(schedule.grid[todayISO] || {}).sort()) {
      const label = schedule.grid[todayISO][t];
      if (label) slots.push({ time: t, label });
    }
    return { dayName: day.name, slots };
  }, [schedule, surveyStartDate, todayISO]);

  const todayEvents = useMemo(() => {
    if (!Array.isArray(events)) return [];
    return events.filter((e) => e.date === todayISO);
  }, [events, todayISO]);

  const requestNotif = useCallback(async () => {
    if (typeof Notification === "undefined") {
      alert("Notifications are not supported in this browser.");
      return;
    }
    const p = await Notification.requestPermission();
    setPerm(p);
  }, []);

  useEffect(() => {
    if (perm !== "granted" || !schedule?.grid || !surveyStartDate) return;
    if (!inWeekRange(surveyStartDate, todayISO)) return;

    const tick = () => {
      const now = new Date();
      const hh = pad2(now.getHours());
      const mm = pad2(now.getMinutes());
      const key = `${hh}:${mm}`;
      const label = schedule.grid[todayISO]?.[key];
      if (!label) return;
      const dedupe = `edupulse_slot_${todayISO}_${key}`;
      if (sessionStorage.getItem(dedupe)) return;
      sessionStorage.setItem(dedupe, "1");
      const title = "EduPulse schedule";
      const body = `${key} — ${label}`;
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification(title, { body, icon: "/Logo1.png" });
      }
      setToast(body);
      emitChatBadge();
      window.setTimeout(() => setToast(null), 8000);
    };

    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, [perm, schedule, surveyStartDate, todayISO]);

  useEffect(() => {
    if (perm !== "granted" || !Array.isArray(events) || !todayEvents.length) return;

    const tick = () => {
      const now = new Date();
      const hh = pad2(now.getHours());
      const mm = pad2(now.getMinutes());
      const key = `${hh}:${mm}`;
      for (const ev of todayEvents) {
        const st = String(ev.startTime || "").slice(0, 5);
        if (st !== key) continue;
        const dedupe = `edupulse_ev_${todayISO}_${st}_${ev.moduleName || ""}`;
        if (sessionStorage.getItem(dedupe)) continue;
        sessionStorage.setItem(dedupe, "1");
        const title = `Event: ${ev.eventType || "Reminder"}`;
        const body = `${ev.moduleName ? ev.moduleName + " — " : ""}${ev.description || ""}`.trim();
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification(title, { body: body || "Starting now", icon: "/Logo1.png" });
        }
        setToast(body || "Event starting");
        emitChatBadge();
        window.setTimeout(() => setToast(null), 8000);
      }
    };

    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, [perm, events, todayEvents, todayISO]);

  if (!mounted) {
    return (
      <div className="scheduler-reminder-panel scheduler-reminder-panel--hydrate">
        <div className="scheduler-reminder-head">
          <h3 className="scheduler-reminder-title">Reminders</h3>
        </div>
        <p className="scheduler-reminder-hint">Syncing date &amp; reminders…</p>
      </div>
    );
  }

  return (
    <div className="scheduler-reminder-panel">
      <div className="scheduler-reminder-head">
        <h3 className="scheduler-reminder-title">Reminders</h3>
        {perm === "granted" ? (
          <span className="scheduler-reminder-badge ok">
            <FaCheckCircle aria-hidden /> Alerts on
          </span>
        ) : perm === "denied" ? (
          <span className="scheduler-reminder-badge muted">
            <FaBellSlash aria-hidden /> Blocked in browser
          </span>
        ) : (
          <button type="button" className="scheduler-reminder-enable" onClick={requestNotif}>
            <FaBell aria-hidden /> Enable alerts
          </button>
        )}
      </div>
      <p className="scheduler-reminder-hint">
        We notify at each scheduled hour (and event start times) for <strong>today</strong> while this tab is open.
      </p>

      {toast && (
        <div className="scheduler-toast" role="status">
          {toast}
        </div>
      )}

      {!todayInPlan && (
        <p className="scheduler-reminder-empty">Today is outside this plan week — open a schedule that includes today.</p>
      )}

      {todayInPlan && (
        <div className="scheduler-reminder-section">
          <h4>Today ({todayInPlan.dayName})</h4>
          <ul className="scheduler-reminder-list">
            {todayInPlan.slots.map((s) => (
              <li key={s.time}>
                <span className="scheduler-reminder-time">{s.time}</span>
                <span className="scheduler-reminder-label">{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {todayEvents.length > 0 && (
        <div className="scheduler-reminder-section">
          <h4>Events today</h4>
          <ul className="scheduler-reminder-list">
            {todayEvents.map((ev, i) => (
              <li key={i}>
                <span className="scheduler-reminder-time">{ev.startTime}</span>
                <span className="scheduler-reminder-label">
                  {ev.eventType}
                  {ev.moduleName ? `: ${ev.moduleName}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
