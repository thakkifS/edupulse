import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import HeaderDiffer from "../../components/HeaderDiffer";

const STORAGE_KEY = "edupulse_survey_result";

export default function SurveyResultsPage() {
  const router = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      setData(raw ? JSON.parse(raw) : null);
    } catch {
      setData(null);
    }
  }, []);

  const top3 = useMemo(() => data?.result?.top3 || [], [data]);

  if (!data) {
    return (
      <>
        <HeaderDiffer />
        <div className="page-wrap">
          <div className="card-center">
            <h2>No survey results found</h2>
            <p>Please complete the career survey first.</p>
            <button className="primary-btn" onClick={() => router.push("/survey")}>
              Go to Survey
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderDiffer />
      <div className="survey-bg">
        <div className="survey-shell">
          <div className="survey-hero">
            <div>
              <h1 className="survey-title">Your Top 3 Career Paths</h1>
              <p className="survey-sub">
                Based on your interests, skills, and preferences — here are the best matches.
              </p>
            </div>
            <div className="survey-actions-inline">
              <button className="secondary-btn" onClick={() => router.push("/survey")}>
                Retake Survey
              </button>
              <button
                className="primary-btn"
                onClick={() => {
                  try {
                    window.localStorage.removeItem(STORAGE_KEY);
                  } catch {}
                  router.push("/survey");
                }}
              >
                Clear & Start Fresh
              </button>
            </div>
          </div>

          <div className="results-grid">
            {top3.map((c, idx) => (
              <div key={c.id} className={`result-card ${idx === 0 ? "best" : ""}`}>
                <div className="result-rank">#{idx + 1}</div>
                <div className="result-img">
                  <img src={c.image || "/logo.png"} alt={c.name} />
                </div>
                <h2 className="result-title">{c.name}</h2>
                <p className="result-score">Match score: {Math.round(c.score || 0)}</p>
                <div className="result-badges">
                  <span className="badge">Recommended</span>
                  {idx === 0 && <span className="badge gold">Best Fit</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="card-center" style={{ textAlign: "left" }}>
            <h3 style={{ marginTop: 0 }}>Quick Summary</h3>
            <p style={{ marginBottom: 0 }}>
              <strong>Name:</strong> {data.basic?.fullName} &nbsp;|&nbsp; <strong>Level:</strong>{" "}
              {data.basic?.level}
            </p>
            <p style={{ marginTop: 10, marginBottom: 0 }}>
              <strong>Preferred areas:</strong> {(data.areas || []).join(", ") || "-"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

