"use client";

import { useEffect, useState } from "react";
import { FaClock } from "react-icons/fa";

/**
 * Avoids hydration mismatch: server and first client paint use a static placeholder;
 * real clock starts only after mount (client-only).
 */
export default function LiveDateTimeClock() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const dateStr = mounted && !isNaN(now.getTime())
    ? now.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "\u2014";

  const timeStr = mounted && !isNaN(now.getTime())
    ? now.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "\u2014";

  return (
    <div className="live-datetime-clock" role="timer" aria-live="polite" aria-atomic="true">
      <span className="live-datetime-icon" aria-hidden>
        <FaClock />
      </span>
      <div className="live-datetime-text">
        <span className="live-datetime-date" suppressHydrationWarning>
          {dateStr}
        </span>
        <span className="live-datetime-time" suppressHydrationWarning>
          {timeStr}
        </span>
      </div>
    </div>
  );
}
