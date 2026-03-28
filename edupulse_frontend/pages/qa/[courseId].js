import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import HeaderDiffer from "../../components/HeaderDiffer";
import { saveBestProgress } from "../../lib/qaProgress";
import { FaCheckCircle, FaRedo, FaArrowLeft } from "react-icons/fa";

const API_BASE = "http://localhost:3001/api/courses";

export default function CourseQuizPage() {
  const router = useRouter();
  const { courseId } = router.query;
  const id = courseId ? String(courseId) : "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState(() => Array(50).fill(null));
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const loadQuiz = useCallback(async () => {
    if (!id || !router.isReady) return;
    setLoading(true);
    setError("");
    setResult(null);
    setAnswers(Array(50).fill(null));
    setCurrent(0);
    try {
      const res = await axios.get(`${API_BASE}/quiz/${id}`);
      setQuiz(res.data?.data || null);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Could not load quiz");
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  }, [id, router.isReady]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  const answeredCount = useMemo(() => answers.filter((a) => a !== null).length, [answers]);
  const progressPct = useMemo(() => Math.round((answeredCount / 50) * 1000) / 10, [answeredCount]);

  const pick = (optionIndex) => {
    if (result) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = optionIndex;
      return next;
    });
  };

  const submit = async () => {
    if (!quiz || result) return;
    const firstMissing = answers.findIndex((a) => a === null);
    if (firstMissing !== -1) {
      setCurrent(firstMissing);
      alert(`Please answer all 50 questions. Missing: #${firstMissing + 1}.`);
      return;
    }
    await doSubmit(answers);
  };

  const doSubmit = async (arr) => {
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE}/${id}/submit`, { answers: arr });
      const data = res.data?.data;
      setResult(data);
      if (data) {
        saveBestProgress(id, {
          percent: data.percent,
          passed: data.passed,
          correct: data.correct,
        });
      }
    } catch (e) {
      alert(e.response?.data?.message || e.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const retry = () => {
    setResult(null);
    setAnswers(Array(50).fill(null));
    setCurrent(0);
    loadQuiz();
  };

  const qNow = quiz?.questions?.[current];

  return (
    <>
      <HeaderDiffer />
      <div className="qa-quiz-page">
        <div className="qa-quiz-shell">
          <div className="qa-quiz-top">
            <Link href="/qa" className="qa-back">
              <FaArrowLeft aria-hidden /> All courses
            </Link>
            {quiz && (
              <div className="qa-quiz-hero">
                <div className="qa-quiz-title-block">
                  <p className="qa-kicker small">{quiz.courseCode}</p>
                  <h1 className="qa-quiz-title">{quiz.name}</h1>
                  <p className="qa-quiz-sub">50 questions · Pass at {quiz.passPercent ?? 80}%</p>
                </div>
                {quiz.imageUrl ? (
                  <img src={quiz.imageUrl} alt="" className="qa-quiz-thumb" />
                ) : null}
              </div>
            )}
          </div>

          {loading && <div className="qa-hint">Loading quiz…</div>}
          {error && !loading && <div className="qa-error">{error}</div>}

          {result && (
            <div className={`qa-result ${result.passed ? "pass" : "fail"}`}>
              <div className="qa-result-inner">
                {result.passed ? <FaCheckCircle className="qa-result-icon" /> : null}
                <h2>{result.passed ? "You passed!" : "Not quite yet"}</h2>
                <p className="qa-result-score">
                  Score: <strong>{result.correct}</strong> / {result.total} ({result.percent}%)
                </p>
                <p className="qa-result-rule">Required to pass: {result.passPercent}%</p>
                <div className="qa-result-actions">
                  <button type="button" className="primary-btn" onClick={retry}>
                    <FaRedo aria-hidden /> Retry quiz
                  </button>
                  <Link href="/qa" className="secondary-btn qa-link-btn">
                    Back to courses
                  </Link>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && quiz && !result && qNow && (
            <div className="qa-quiz-card">
              <div className="qa-quiz-progress">
                <div className="qa-quiz-progress-row">
                  <span className="progress-label">Your progress</span>
                  <span className="progress-pct">{progressPct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="qa-quiz-qnav">
                  {Array.from({ length: 50 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`qa-dot ${i === current ? "active" : ""} ${answers[i] !== null ? "done" : ""}`}
                      onClick={() => setCurrent(i)}
                      aria-label={`Question ${i + 1}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="qa-question">
                <p className="qa-q-label">
                  Question {current + 1} <span className="muted">/ 50</span>
                </p>
                <h2 className="qa-q-text">{qNow.prompt}</h2>
                <div className="qa-options">
                  {qNow.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`qa-option ${answers[current] === idx ? "selected" : ""}`}
                      onClick={() => pick(idx)}
                    >
                      <span className="qa-option-key">{String.fromCharCode(65 + idx)}</span>
                      <span className="qa-option-txt">{opt}</span>
                    </button>
                  ))}
                </div>
                <div className="qa-q-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    disabled={current === 0}
                    onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                  >
                    Previous
                  </button>
                  {current < 49 ? (
                    <button type="button" className="primary-btn" onClick={() => setCurrent((c) => Math.min(49, c + 1))}>
                      Next
                    </button>
                  ) : null}
                  <button type="button" className="primary-btn" onClick={submit} disabled={submitting}>
                    {submitting ? "Submitting…" : "Submit quiz"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
