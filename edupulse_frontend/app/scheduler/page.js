"use client";

import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import HeaderDiffer from "../../components/HeaderDiffer";

const API = "http://localhost:3001/api/scheduler";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMES = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];

const toDateOnly = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const pad2 = (n) => String(n).padStart(2, "0");
const toISODate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

function clamp7Date(startDate, dateStr) {
  const start = toDateOnly(new Date(startDate));
  const end = toDateOnly(addDays(start, 6));
  const d = toDateOnly(new Date(dateStr));
  if (Number.isNaN(d.getTime())) return { ok: false, message: "Invalid date" };
  if (d < start || d > end) return { ok: false, message: "Date must be within 7 days from Start Date" };
  return { ok: true };
}

function buildEmptyGrid(startDate) {
  const start = toDateOnly(new Date(startDate));
  const days = DAY_NAMES.map((name, i) => ({ name, date: toISODate(addDays(start, i)) }));
  const grid = {};
  for (const d of days) {
    grid[d.date] = {};
    for (const t of TIMES) grid[d.date][t] = "";
  }
  return { days, grid };
}

function applyFixedBlocks(grid, days) {
  const fixed = [
    { label: "Breakfast", t: "07:00" },
    { label: "Lunch", t: "12:00" },
    { label: "Tea Time", t: "16:00" },
    { label: "Dinner", t: "19:00" },
    { label: "Rest", t: "20:00" },
    { label: "Sleep", t: "22:00" },
  ];
  for (const d of days) {
    for (const f of fixed) {
      if (grid[d.date]?.[f.t] !== undefined) grid[d.date][f.t] = f.label;
    }
  }
}

function timeBucket(hhmm) {
  const hh = Number(String(hhmm || "").split(":")[0] || 0);
  if (hh >= 20 || hh < 7) return "night";
  if (hh >= 7 && hh < 12) return "morning";
  if (hh >= 12 && hh < 17) return "afternoon";
  return "evening";
}

function preferredSlots(type) {
  // type: "Logical" => night, "Theory" => morning/evening
  if (type === "Logical") return ["21:00", "18:00", "20:00", "19:00", "22:00"];
  return ["09:00", "10:00", "08:00", "17:00", "18:00", "11:00", "14:00", "15:00"];
}

function generateSchedule({ startDate, lectures, events }) {
  const { days, grid } = buildEmptyGrid(startDate);
  applyFixedBlocks(grid, days);

  // Place events first (hard constraints)
  for (const ev of events) {
    const d = toISODate(new Date(ev.date));
    if (!grid[d]) continue;
    const t = (ev.startTime || ev.time || "").slice(0, 5) || "09:00";
    // bucket to nearest hour in TIMES
    const bucket = TIMES.includes(t) ? t : `${pad2(Number(t.split(":")[0] || 9))}:00`;
    const label = `${ev.eventType}${ev.moduleName ? `: ${ev.moduleName}` : ""}`;
    if (grid[d][bucket] === "") grid[d][bucket] = label;
  }

  // Study sessions per module: credits * 2 sessions (each session ~45m with gap)
  const modules = [...lectures].sort((a, b) => Number(b.credit || 0) - Number(a.credit || 0));
  const planItems = [];
  for (const m of modules) {
    const sessions = Math.max(1, Number(m.credit || 0) * 2);
    for (let i = 0; i < sessions; i++) {
      planItems.push({
        moduleName: m.moduleName,
        lectureType: m.lectureType || "Theory",
        credit: Number(m.credit || 0),
      });
    }
  }

  // Fill across week in priority order: higher credits first (already sorted by module)
  let dayIndex = 0;
  for (const item of planItems) {
    let placed = false;
    for (let di = 0; di < days.length && !placed; di++) {
      const d = days[(dayIndex + di) % days.length];
      const prefs = preferredSlots(item.lectureType);
      const slots = [...prefs, ...TIMES]; // fallback
      for (const t of slots) {
        if (grid[d.date][t] === "") {
          grid[d.date][t] = `Study: ${item.moduleName} (45m)`;
          placed = true;
          dayIndex = (dayIndex + 1) % days.length;
          break;
        }
      }
    }
  }

  return { days, grid };
}

function downloadPDF({ studentName, year, semester, startDate, schedule }) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  doc.setFontSize(16);
  doc.text("EduPulse Smart Weekly Scheduler", 40, 40);
  doc.setFontSize(11);
  doc.text(
    `Name: ${studentName}   |   Year: ${year}   |   ${semester}   |   Start Date: ${toISODate(new Date(startDate))}`,
    40,
    62
  );

  const head = [["Day", ...TIMES]];
  const body = schedule.days.map((d) => {
    const row = [`${d.name} (${d.date})`];
    for (const t of TIMES) row.push(schedule.grid[d.date][t] || "");
    return row;
  });

  autoTable(doc, {
    head,
    body,
    startY: 80,
    styles: { fontSize: 7, cellPadding: 3, overflow: "linebreak" },
    headStyles: { fillColor: [32, 60, 86] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`EduPulse_Weekly_Schedule_${toISODate(new Date(startDate))}.pdf`);
}

export default function SchedulerPage() {
  const [step, setStep] = useState("form"); // form | result
  const [busy, setBusy] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [scheduleId, setScheduleId] = useState(null);

  const [survey, setSurvey] = useState({
    email: "",
    studentName: "",
    year: "1",
    semester: "Semester 1",
    startDate: "",
  });

  const [lectures, setLectures] = useState([
    { moduleName: "", credit: 3, lectureType: "Theory", todo: [""] },
  ]);

  const [events, setEvents] = useState([]);

  const weekDates = useMemo(() => {
    if (!survey.startDate) return [];
    const start = toDateOnly(new Date(survey.startDate));
    return Array.from({ length: 7 }).map((_, i) => toISODate(addDays(start, i)));
  }, [survey.startDate]);

  const addLecture = () =>
    setLectures((p) => [...p, { moduleName: "", credit: 3, lectureType: "Theory", todo: [""] }]);
  const removeLecture = (idx) => setLectures((p) => p.filter((_, i) => i !== idx));

  const addTodo = (li) =>
    setLectures((p) => p.map((l, i) => (i === li ? { ...l, todo: [...l.todo, ""] } : l)));
  const removeTodo = (li, ti) =>
    setLectures((p) =>
      p.map((l, i) => (i === li ? { ...l, todo: l.todo.filter((_, j) => j !== ti) } : l))
    );

  const addEvent = () =>
    setEvents((p) => [
      ...p,
      {
        eventType: "Exam",
        moduleName: "",
        description: "",
        date: survey.startDate || "",
        startTime: "09:00",
        endTime: "10:00",
        logicalOrTheory: "Theory",
      },
    ]);
  const removeEvent = (idx) => setEvents((p) => p.filter((_, i) => i !== idx));

  const validate = async () => {
    if (!survey.email.trim() || !survey.email.includes("@")) return "Valid Email is required (for reminders)";
    if (!survey.email.trim().toLowerCase().endsWith("@gmail.com")) return "Email must be a @gmail.com address";
    if (!survey.studentName.trim()) return "Name is required";
    if (!/^[A-Za-z ]+$/.test(survey.studentName.trim())) return "Name must contain letters only";
    if (!/^[1-4]$/.test(String(survey.year))) return "Year must be between 1 and 4";
    if (!survey.startDate) return "Start Date is required";

    // backend conflict check
    const qs = new URLSearchParams({ email: survey.email, startDate: survey.startDate });
    const chkRes = await fetch(`${API}/check?${qs.toString()}`);
    const chk = await chkRes.json();
    if (chk?.exists) {
      return "You already created a schedule for this Start Date. Please use Re-edit.";
    }

    if (!lectures.length) return "Add at least 1 lecture module";
    for (const l of lectures) {
      if (!l.moduleName.trim()) return "Each lecture module must have a name";
      if (!Number.isFinite(Number(l.credit)) || Number(l.credit) <= 0) return "Credits must be a positive number";
      if (!["Logical", "Theory"].includes(l.lectureType)) return "Lecture type must be Logical or Theory";
      for (const t of l.todo) {
        if (t && t.length > 80) return "Todo heading too long (max ~80 chars)";
      }
    }

    for (const e of events) {
      if (!e.eventType) return "Event type is required";
      if (!e.description.trim()) return "Event description is required";
      if (!e.date) return "Event date is required";
      const inWeek = clamp7Date(survey.startDate, e.date);
      if (!inWeek.ok) return inWeek.message;
      if (!e.startTime || !e.endTime) return "Event start and end time are required";
      if (e.endTime <= e.startTime) return "Event end time must be after start time";
      if (e.eventType !== "Other" && !e.moduleName.trim()) return "Module Name is required for this event type";
      if (e.eventType === "Exam" && !["Logical", "Theory"].includes(e.logicalOrTheory))
        return "Exam must be Logical OR Theory";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const err = await validate();
      if (err) {
        alert(err);
        return;
      }

      const scheduleData = generateSchedule({
        startDate: survey.startDate,
        lectures,
        events,
      });

      const payload = {
        ...survey,
        lectures,
        events: events.map((ev) => ({
          eventType: ev.eventType,
          moduleName: ev.moduleName,
          description: ev.description,
          date: ev.date,
          time: `${ev.startTime}-${ev.endTime}`,
          startTime: ev.startTime,
          endTime: ev.endTime,
          logicalOrTheory: ev.logicalOrTheory,
        })),
        generated: scheduleData,
      };

      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to create schedule");
      setScheduleId(json?.data?._id || null);
      setSchedule(scheduleData);
      setStep("result");

      // Auto-download PDF after generating
      downloadPDF({ ...survey, schedule: scheduleData });
    } catch (err) {
      alert(err?.message || "Failed to create schedule");
    } finally {
      setBusy(false);
    }
  };

  const resetAll = () => {
    setStep("form");
    setSchedule(null);
    setScheduleId(null);
    setSurvey({ email: "", studentName: "", year: "1", semester: "Semester 1", startDate: "" });
    setLectures([{ moduleName: "", credit: 3, lectureType: "Theory", todo: [""] }]);
    setEvents([]);
  };

  return (
    <>
      <HeaderDiffer />
      <div className="survey-bg">
        <div className="survey-shell">
          <div className="survey-hero">
            <div>
              <h1 className="survey-title">Smart Weekly Scheduler</h1>
              <p className="survey-sub">
                Credits-based priority + logical/theory time preference + 45-minute study blocks.
              </p>
            </div>
            {step === "result" && (
              <div className="survey-actions-inline">
                <button
                  className="secondary-btn"
                  type="button"
                  onClick={() => {
                    if (schedule) downloadPDF({ ...survey, schedule });
                  }}
                >
                  Download PDF Again
                </button>
                <button className="secondary-btn" type="button" onClick={() => setStep("form")}>
                  Re-edit
                </button>
                <button className="primary-btn" type="button" onClick={resetAll}>
                  New Schedule
                </button>
              </div>
            )}
          </div>

          {step === "form" ? (
            <form className="survey-card" onSubmit={handleSubmit}>
              <section className="survey-section">
                <div className="section-head">
                  <h2>Student Survey</h2>
                  <p>Fill details. Start Date controls the week range.</p>
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label>Email (for reminders)</label>
                    <input
                      value={survey.email}
                      onChange={(e) => setSurvey({ ...survey, email: e.target.value })}
                      placeholder="yourname@gmail.com"
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Name (letters only)</label>
                    <input
                      value={survey.studentName}
                      onChange={(e) => setSurvey({ ...survey, studentName: e.target.value })}
                      placeholder="Full name"
                      required
                    />
                  </div>
                </div>
                <div className="grid-3">
                  <div className="field">
                    <label>Year</label>
                    <select value={survey.year} onChange={(e) => setSurvey({ ...survey, year: e.target.value })}>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Semester</label>
                    <select
                      value={survey.semester}
                      onChange={(e) => setSurvey({ ...survey, semester: e.target.value })}
                    >
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={survey.startDate}
                      onChange={(e) => setSurvey({ ...survey, startDate: e.target.value })}
                      required
                    />
                    {weekDates.length > 0 && (
                      <div className="hint">Week range: {weekDates[0]} → {weekDates[6]}</div>
                    )}
                  </div>
                </div>
              </section>

              <section className="survey-section">
                <div className="section-head">
                  <h2>Lecture Modules & Credits</h2>
                  <p>Add modules, credits, logical/theory, and optional todo headings.</p>
                </div>

                {lectures.map((l, idx) => (
                  <div key={idx} className="admin-card" style={{ padding: 14, marginTop: 12 }}>
                    <div className="admin-row">
                      <div className="admin-field">
                        <label>Module Name</label>
                        <input
                          value={l.moduleName}
                          onChange={(e) =>
                            setLectures((p) => p.map((x, i) => (i === idx ? { ...x, moduleName: e.target.value } : x)))
                          }
                          required
                        />
                      </div>
                      <div className="admin-field">
                        <label>Credits</label>
                        <input
                          type="number"
                          min={1}
                          value={l.credit}
                          onChange={(e) =>
                            setLectures((p) =>
                              p.map((x, i) => (i === idx ? { ...x, credit: Number(e.target.value) } : x))
                            )
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="admin-row">
                      <div className="admin-field">
                        <label>Type</label>
                        <select
                          value={l.lectureType}
                          onChange={(e) =>
                            setLectures((p) =>
                              p.map((x, i) => (i === idx ? { ...x, lectureType: e.target.value } : x))
                            )
                          }
                        >
                          <option value="Theory">Theory</option>
                          <option value="Logical">Logical</option>
                        </select>
                        <div className="hint">
                          Logical modules get more night slots; Theory modules get morning/evening.
                        </div>
                      </div>
                      <div className="admin-field">
                        <label>Todo Headings (optional)</label>
                        {l.todo.map((t, ti) => (
                          <div key={ti} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                            <input
                              value={t}
                              placeholder="e.g. Chapter 1 summary"
                              onChange={(e) =>
                                setLectures((p) =>
                                  p.map((x, i) =>
                                    i === idx
                                      ? { ...x, todo: x.todo.map((tt, j) => (j === ti ? e.target.value : tt)) }
                                      : x
                                  )
                                )
                              }
                            />
                            {l.todo.length > 1 && (
                              <button type="button" className="danger-btn" onClick={() => removeTodo(idx, ti)}>
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" className="secondary-btn" onClick={() => addTodo(idx)}>
                          + Add Todo Heading
                        </button>
                      </div>
                    </div>

                    <div className="admin-actions">
                      {lectures.length > 1 && (
                        <button type="button" className="danger-btn" onClick={() => removeLecture(idx)}>
                          Remove Module
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="survey-actions" style={{ justifyContent: "flex-start" }}>
                  <button type="button" className="secondary-btn" onClick={addLecture}>
                    + Add Module
                  </button>
                </div>
              </section>

              <section className="survey-section">
                <div className="section-head">
                  <h2>Events (Exam, Viva, Lecture Session, Presentation, Spot Test, Other)</h2>
                  <p>Event Date must be within the selected week (7 days).</p>
                </div>

                {events.map((ev, idx) => (
                  <div key={idx} className="admin-card" style={{ padding: 14, marginTop: 12 }}>
                    <div className="admin-row">
                      <div className="admin-field">
                        <label>Event Type</label>
                        <select
                          value={ev.eventType}
                          onChange={(e) =>
                            setEvents((p) => p.map((x, i) => (i === idx ? { ...x, eventType: e.target.value } : x)))
                          }
                        >
                          <option value="Exam">Exam</option>
                          <option value="Viva">Viva</option>
                          <option value="Lecture">Lecture Session</option>
                          <option value="Presentation">Presentation</option>
                          <option value="SpotTest">Spot Test</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="admin-field">
                        <label>Module Name {ev.eventType !== "Other" ? "(required)" : "(optional)"}</label>
                        <input
                          value={ev.moduleName}
                          onChange={(e) =>
                            setEvents((p) => p.map((x, i) => (i === idx ? { ...x, moduleName: e.target.value } : x)))
                          }
                          placeholder="Module name"
                        />
                      </div>
                    </div>

                    {ev.eventType === "Exam" && (
                      <div className="admin-row">
                        <div className="admin-field">
                          <label>Exam Part</label>
                          <div className="chips">
                            {["Theory", "Logical"].map((v) => (
                              <button
                                key={v}
                                type="button"
                                className={`chip ${ev.logicalOrTheory === v ? "active" : ""}`}
                                onClick={() =>
                                  setEvents((p) =>
                                    p.map((x, i) => (i === idx ? { ...x, logicalOrTheory: v } : x))
                                  )
                                }
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="admin-field">
                          <label>Description</label>
                          <input
                            value={ev.description}
                            onChange={(e) =>
                              setEvents((p) => p.map((x, i) => (i === idx ? { ...x, description: e.target.value } : x)))
                            }
                            required
                          />
                        </div>
                      </div>
                    )}

                    {ev.eventType !== "Exam" && (
                      <div className="admin-field">
                        <label>Description</label>
                        <input
                          value={ev.description}
                          onChange={(e) =>
                            setEvents((p) => p.map((x, i) => (i === idx ? { ...x, description: e.target.value } : x)))
                          }
                          required
                        />
                      </div>
                    )}

                    <div className="admin-row">
                      <div className="admin-field">
                        <label>Date</label>
                        <input
                          type="date"
                          value={ev.date}
                          min={survey.startDate || undefined}
                          max={survey.startDate ? toISODate(addDays(new Date(survey.startDate), 6)) : undefined}
                          onChange={(e) =>
                            setEvents((p) => p.map((x, i) => (i === idx ? { ...x, date: e.target.value } : x)))
                          }
                          required
                        />
                      </div>
                      <div className="admin-field">
                        <label>Start Time</label>
                        <input
                          type="time"
                          value={ev.startTime}
                          onChange={(e) =>
                            setEvents((p) => p.map((x, i) => (i === idx ? { ...x, startTime: e.target.value } : x)))
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="admin-row">
                      <div className="admin-field">
                        <label>End Time</label>
                        <input
                          type="time"
                          value={ev.endTime}
                          onChange={(e) =>
                            setEvents((p) => p.map((x, i) => (i === idx ? { ...x, endTime: e.target.value } : x)))
                          }
                          required
                        />
                      </div>
                      <div className="admin-field" style={{ display: "flex", alignItems: "flex-end" }}>
                        <button type="button" className="danger-btn" onClick={() => removeEvent(idx)}>
                          Remove Event
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="survey-actions" style={{ justifyContent: "flex-start" }}>
                  <button type="button" className="secondary-btn" onClick={addEvent} disabled={!survey.startDate}>
                    + Add Event
                  </button>
                  {!survey.startDate && <div className="hint">Select Start Date first to add events.</div>}
                </div>
              </section>

              <div className="survey-actions">
                <button className="primary-btn" type="submit" disabled={busy}>
                  {busy ? "Creating..." : "Create Weekly Schedule (Auto PDF)"}
                </button>
              </div>
            </form>
          ) : (
            <div className="survey-card">
              <section className="survey-section">
                <div className="section-head">
                  <h2>Weekly Scheduler Table</h2>
                  <p>
                    Rows = days. Columns = time blocks. Fixed meals/rest/sleep are included automatically.
                    {scheduleId ? ` (Saved: ${scheduleId})` : ""}
                  </p>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Day</th>
                        {TIMES.map((t) => (
                          <th key={t} style={{ padding: 10, borderBottom: "1px solid #ddd", whiteSpace: "nowrap" }}>
                            {t}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {schedule?.days.map((d) => (
                        <tr key={d.date}>
                          <td style={{ padding: 10, borderBottom: "1px solid #eee", fontWeight: 900 }}>
                            {d.name} <span style={{ opacity: 0.7 }}>({d.date})</span>
                          </td>
                          {TIMES.map((t) => {
                            const v = schedule.grid[d.date][t] || "";
                            const isFixed = ["Breakfast", "Lunch", "Tea Time", "Dinner", "Rest", "Sleep"].includes(v);
                            const isEvent = String(v).startsWith("Exam") || String(v).startsWith("Viva") || String(v).startsWith("Presentation") || String(v).startsWith("Lecture") || String(v).startsWith("SpotTest");
                            return (
                              <td
                                key={t}
                                style={{
                                  padding: 10,
                                  borderBottom: "1px solid #eee",
                                  borderLeft: "1px solid #f1f1f1",
                                  minWidth: 160,
                                  background: isFixed
                                    ? "rgba(255, 207, 0, 0.14)"
                                    : isEvent
                                    ? "rgba(92, 30, 30, 0.10)"
                                    : v
                                    ? "rgba(32, 60, 86, 0.08)"
                                    : "transparent",
                                  fontWeight: isFixed ? 900 : 700,
                                }}
                              >
                                {v}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

