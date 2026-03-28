import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import HeaderDiffer from "../../components/HeaderDiffer";
import { loadBestProgress } from "../../lib/qaProgress";
import { FaGraduationCap, FaSearch } from "react-icons/fa";

const API = "http://localhost:3001/api/courses";

export default function QAPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [bestMap, setBestMap] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(API);
        const list = res.data?.data || [];
        if (!cancelled) {
          setCourses(list);
          const m = {};
          list.forEach((c) => {
            const id = c.id || c._id;
            if (id) {
              const b = loadBestProgress(String(id));
              if (b) m[String(id)] = b;
            }
          });
          setBestMap(m);
        }
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || e.message || "Failed to load courses");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return courses;
    return courses.filter((c) => {
      const name = String(c.name || "").toLowerCase();
      const code = String(c.courseCode || "").toLowerCase();
      const desc = String(c.description || "").toLowerCase();
      return name.includes(s) || code.includes(s) || desc.includes(s);
    });
  }, [courses, q]);

  return (
    <>
      <HeaderDiffer />
      <div className="qa-page">
        <div className="qa-shell">
          <div className="qa-hero">
            <div className="qa-hero-text">
              <p className="qa-kicker">
                <FaGraduationCap aria-hidden /> Course MCQ practice
              </p>
              <h1 className="qa-title">Q &amp; A courses</h1>
              <p className="qa-sub">
                Pick a track (HTML, CSS, JavaScript, and more). Each course has 50 multiple-choice questions. Pass mark is{" "}
                <strong>80%</strong>—progress is saved for your best score.
              </p>
            </div>
            <div className="qa-search-wrap">
              <FaSearch className="qa-search-icon" aria-hidden />
              <input
                className="qa-search"
                placeholder="Search by course name or code…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Search courses"
              />
            </div>
          </div>

          {loading && <div className="qa-hint">Loading courses…</div>}
          {error && !loading && (
            <div className="qa-error">
              {error}
              <div className="qa-error-sub">Start the API on port 3001 and ensure MongoDB is running.</div>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="qa-empty">
              No courses match your search.
              {courses.length === 0 && (
                <span>
                  {" "}
                  Ask an admin to add courses in the <Link href="/admin">Admin Dashboard</Link>.
                </span>
              )}
            </div>
          )}

          <div className="qa-grid">
            {filtered.map((c) => {
              const id = String(c.id || c._id);
              const img = c.imageUrl?.trim()
                ? c.imageUrl
                : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80";
              const best = bestMap[id];
              return (
                <article key={id} className="qa-card">
                  <div className="qa-card-visual">
                    <img src={img} alt="" className="qa-card-img" />
                    <div className="qa-card-shine" />
                    <span className="qa-chip">{c.courseCode || "COURSE"}</span>
                  </div>
                  <div className="qa-card-body">
                    <h2 className="qa-card-title">{c.name}</h2>
                    {c.description ? <p className="qa-card-desc">{c.description}</p> : null}
                    <div className="qa-card-meta">
                      <span className="qa-pill">50 MCQs</span>
                      {best ? (
                        <span className={`qa-pill ${best.passed ? "qa-pill-pass" : "qa-pill-neutral"}`}>
                          Best: {best.percent}% {best.passed ? "· Passed" : "· Keep going"}
                        </span>
                      ) : (
                        <span className="qa-pill qa-pill-muted">Not attempted</span>
                      )}
                    </div>
                    <Link href={`/qa/${id}`} className="qa-card-btn">
                      Start course
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
