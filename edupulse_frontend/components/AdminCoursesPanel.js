import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:3001/api/courses";
const N = 50;
const LETTERS = ["A", "B", "C", "D"];

function emptyQuestions() {
  return Array.from({ length: N }, () => ({
    prompt: "",
    options: ["", "", "", ""],
    correctIndex: 0,
  }));
}

export default function AdminCoursesPanel({ busy, setBusy }) {
  const [courses, setCourses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [openIdx, setOpenIdx] = useState(0);
  const [form, setForm] = useState({
    courseCode: "",
    name: "",
    imageUrl: "",
    description: "",
    questions: emptyQuestions(),
  });

  const loadCourses = useCallback(async () => {
    const res = await axios.get(API);
    setCourses(res.data?.data || []);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await loadCourses();
      } catch (e) {
        console.error(e);
      }
    })();
  }, [loadCourses]);

  const setQField = (qi, field, value) => {
    setForm((prev) => {
      const questions = prev.questions.map((q, i) => (i === qi ? { ...q, [field]: value } : q));
      return { ...prev, questions };
    });
  };

  const setOption = (qi, oi, value) => {
    setForm((prev) => {
      const questions = prev.questions.map((q, i) => {
        if (i !== qi) return q;
        const options = q.options.map((o, j) => (j === oi ? value : o));
        return { ...q, options };
      });
      return { ...prev, questions };
    });
  };

  const validate = () => {
    if (!form.courseCode.trim()) return "Course code is required";
    if (!form.name.trim()) return "Course name is required";
    for (let i = 0; i < N; i++) {
      const q = form.questions[i];
      if (!String(q.prompt).trim()) return `Question ${i + 1}: enter the question text`;
      for (let j = 0; j < 4; j++) {
        if (!String(q.options[j]).trim()) return `Question ${i + 1}: option ${LETTERS[j]} is empty`;
      }
      if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) {
        return `Question ${i + 1}: pick the correct answer`;
      }
    }
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);
    setBusy(true);
    try {
      const payload = {
        courseCode: form.courseCode.trim(),
        name: form.name.trim(),
        imageUrl: form.imageUrl.trim(),
        description: form.description.trim(),
        questions: form.questions.map((q) => ({
          prompt: q.prompt.trim(),
          options: q.options.map((o) => o.trim()),
          correctIndex: Number(q.correctIndex),
        })),
      };
      if (editingId) {
        await axios.put(`${API}/${editingId}`, payload);
        alert("Course updated");
      } else {
        await axios.post(API, payload);
        alert("Course created");
      }
      setEditingId(null);
      setForm({ courseCode: "", name: "", imageUrl: "", description: "", questions: emptyQuestions() });
      setOpenIdx(0);
      await loadCourses();
    } catch (e2) {
      alert(e2.response?.data?.message || e2.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const editCourse = async (courseListRow) => {
    const rawId = courseListRow.id || courseListRow._id;
    const id = String(rawId);
    setBusy(true);
    try {
      const res = await axios.get(`${API}/admin/${id}`);
      const c = res.data?.data;
      if (!c) throw new Error("Course not found");
      setEditingId(id);
      setForm({
        courseCode: c.courseCode || "",
        name: c.name || "",
        imageUrl: c.imageUrl || "",
        description: c.description || "",
        questions:
          Array.isArray(c.questions) && c.questions.length === N
            ? c.questions.map((q) => {
                const opts = Array.isArray(q.options) ? q.options : [];
                return {
                  prompt: q.prompt || "",
                  options: [0, 1, 2, 3].map((j) => String(opts[j] ?? "")),
                  correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
                };
              })
            : emptyQuestions(),
      });
      setOpenIdx(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      alert(e.response?.data?.message || e.message || "Load failed");
    } finally {
      setBusy(false);
    }
  };

  const deleteCourse = async (id) => {
    if (!confirm("Delete this course and all its questions?")) return;
    setBusy(true);
    try {
      await axios.delete(`${API}/${id}`);
      if (editingId === id) {
        setEditingId(null);
        setForm({ courseCode: "", name: "", imageUrl: "", description: "", questions: emptyQuestions() });
      }
      await loadCourses();
    } catch (e) {
      alert(e.response?.data?.message || e.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const q = form.questions[openIdx] || form.questions[0];

  return (
    <div className="admin-grid admin-grid-courses">
      <div className="admin-card">
        <h3 style={{ marginTop: 0 }}>
          {editingId ? `Edit course` : "Add course"} · {N} MCQs
        </h3>
        <p className="admin-course-hint">Set four options per item and select the correct one. Pass mark for learners is 80%.</p>
        <form onSubmit={submit} className="admin-form">
          <div className="admin-row">
            <div className="admin-field">
              <label>Course code</label>
              <input
                value={form.courseCode}
                onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
                placeholder="HTML101"
                disabled={!!editingId}
                required
              />
            </div>
            <div className="admin-field">
              <label>Course name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="HTML Fundamentals"
                required
              />
            </div>
          </div>
          <div className="admin-row">
            <div className="admin-field">
              <label>Image URL</label>
              <input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="admin-field">
              <label>Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short blurb for the catalog"
              />
            </div>
          </div>

          <div className="admin-mcq-shell">
            <div className="admin-mcq-picker">
              <label className="admin-mcq-picker-label">Jump to question</label>
              <select value={openIdx} onChange={(e) => setOpenIdx(Number(e.target.value))} className="admin-mcq-select">
                {Array.from({ length: N }, (_, i) => (
                  <option key={i} value={i}>
                    Question {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-mcq-editor">
              <div className="admin-field">
                <label>Question {openIdx + 1}</label>
                <textarea
                  rows={3}
                  value={q.prompt}
                  onChange={(e) => setQField(openIdx, "prompt", e.target.value)}
                  placeholder="Enter the question…"
                />
              </div>
              <div className="admin-options-grid">
                {[0, 1, 2, 3].map((oi) => (
                  <div key={oi} className="admin-field admin-option-row">
                    <label>Option {LETTERS[oi]}</label>
                    <div className="admin-option-inline">
                      <input
                        type="radio"
                        name={`correct-${openIdx}`}
                        checked={q.correctIndex === oi}
                        onChange={() => setQField(openIdx, "correctIndex", oi)}
                        aria-label={`Mark ${LETTERS[oi]} as correct`}
                      />
                      <input
                        value={q.options[oi]}
                        onChange={(e) => setOption(openIdx, oi, e.target.value)}
                        placeholder={`Answer choice ${LETTERS[oi]}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="admin-mcq-nav">
                <button
                  type="button"
                  className="secondary-btn"
                  disabled={openIdx === 0}
                  onClick={() => setOpenIdx((i) => Math.max(0, i - 1))}
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  disabled={openIdx >= N - 1}
                  onClick={() => setOpenIdx((i) => Math.min(N - 1, i + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="admin-actions">
            {editingId && (
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setEditingId(null);
                  setForm({ courseCode: "", name: "", imageUrl: "", description: "", questions: emptyQuestions() });
                  setOpenIdx(0);
                }}
              >
                Cancel
              </button>
            )}
            <button className="primary-btn" type="submit" disabled={busy}>
              {busy ? "Saving…" : editingId ? "Update course" : "Create course"}
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-head">
          <h3 style={{ margin: 0 }}>Courses ({courses.length})</h3>
          <button className="secondary-btn" type="button" onClick={loadCourses} disabled={busy}>
            Refresh
          </button>
        </div>
        <div className="admin-table">
          <div className="admin-thead admin-cols-courses">
            <div>Code</div>
            <div>Name</div>
            <div>Actions</div>
          </div>
          {courses.map((c) => {
            const cid = String(c.id || c._id);
            return (
              <div key={cid} className="admin-trow admin-cols-courses">
                <div className="mono">{c.courseCode}</div>
                <div>{c.name}</div>
                <div className="admin-btns">
                  <button type="button" className="secondary-btn" onClick={() => editCourse(c)} disabled={busy}>
                    Edit
                  </button>
                  <button type="button" className="danger-btn" onClick={() => deleteCourse(cid)} disabled={busy}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
          {courses.length === 0 && <div className="admin-empty">No courses yet.</div>}
        </div>
      </div>
    </div>
  );
}
