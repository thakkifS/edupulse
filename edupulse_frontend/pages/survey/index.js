import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import HeaderDiffer from "../../components/HeaderDiffer";
import { INTEREST_ITEMS, SKILL_ITEMS, scoreSurvey } from "../../lib/careerSurvey";

const STORAGE_KEY = "edupulse_survey_result";

const RadioRow = ({ name, value, onChange, required }) => {
  return (
    <div className="scale-row" role="radiogroup" aria-label={name}>
      {[1, 2, 3, 4, 5].map((n) => (
        <label key={n} className={`scale-pill ${Number(value) === n ? "active" : ""}`}>
          <input
            type="radio"
            name={name}
            value={n}
            checked={Number(value) === n}
            onChange={(e) => onChange(Number(e.target.value))}
            required={required}
          />
          <span>{n}</span>
        </label>
      ))}
    </div>
  );
};

export default function SurveyPage() {
  const router = useRouter();
  const [basic, setBasic] = useState({
    fullName: "",
    level: "",
  });
  const [interest, setInterest] = useState(() =>
    Object.fromEntries(INTEREST_ITEMS.map((i) => [i.key, ""]))
  );
  const [skills, setSkills] = useState(() =>
    Object.fromEntries(SKILL_ITEMS.map((i) => [i.key, ""]))
  );
  const [prefs, setPrefs] = useState({
    workType: "",
    team: "",
    pressure: "",
  });
  const [motivation, setMotivation] = useState({
    priority: "",
    learn: "",
  });
  const [areas, setAreas] = useState([]);
  const [open, setOpen] = useState({
    dream: "",
    challenge: "",
  });

  const progress = useMemo(() => {
    const totalRequired =
      2 +
      INTEREST_ITEMS.length +
      SKILL_ITEMS.length +
      3 +
      2 +
      1;
    let done = 0;
    if (basic.fullName.trim()) done += 1;
    if (basic.level) done += 1;
    done += INTEREST_ITEMS.filter((i) => interest[i.key]).length;
    done += SKILL_ITEMS.filter((i) => skills[i.key]).length;
    if (prefs.workType) done += 1;
    if (prefs.team) done += 1;
    if (prefs.pressure) done += 1;
    if (motivation.priority) done += 1;
    if (motivation.learn) done += 1;
    if (areas.length > 0) done += 1;
    return Math.round((done / totalRequired) * 100);
  }, [basic, interest, skills, prefs, motivation, areas]);

  const toggleArea = (value) => {
    setAreas((prev) => {
      if (prev.includes(value)) return prev.filter((x) => x !== value);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, value];
    });
  };

  const validate = () => {
    if (!basic.fullName.trim()) return "Full Name is required";
    if (!/^[A-Za-z ]+$/.test(basic.fullName.trim())) return "Full Name must contain letters only";
    if (!basic.level) return "Please select your current level of study";

    for (const item of INTEREST_ITEMS) {
      if (!interest[item.key]) return `Please rate: "${item.label}"`;
    }
    for (const item of SKILL_ITEMS) {
      if (!skills[item.key]) return `Please rate your skill: "${item.label}"`;
    }

    if (!prefs.workType) return "Please select your preferred work type";
    if (!prefs.team) return "Please select your team preference";
    if (!prefs.pressure) return "Please select how you handle pressure";
    if (!motivation.priority) return "Please select what matters most in a career";
    if (!motivation.learn) return "Please select your learning willingness";
    if (areas.length === 0) return "Please select at least 1 preferred IT career area (up to 3)";

    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      alert(err);
      return;
    }

    const result = scoreSurvey({
      basic,
      interest,
      skills,
      prefs,
      motivation,
      areas,
      open,
    });

    const payload = {
      submittedAt: new Date().toISOString(),
      basic,
      interest,
      skills,
      prefs,
      motivation,
      areas,
      open,
      result,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}

    router.push("/survey/results");
  };

  return (
    <>
      <HeaderDiffer />
      <div className="survey-bg">
        <div className="survey-shell">
          <div className="survey-hero">
            <div>
              <h1 className="survey-title">EduPulse Career Survey</h1>
              <p className="survey-sub">
                Answer honestly. We&apos;ll recommend your top 3 IT career paths.
              </p>
            </div>
            <div className="survey-progress">
              <div className="progress-label">Progress</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-pct">{progress}%</div>
            </div>
          </div>

          <form className="survey-card" onSubmit={handleSubmit}>
            <section className="survey-section">
              <div className="section-head">
                <h2>Section 1: Basic Information</h2>
                <p>Tell us who you are and your current study level.</p>
              </div>

              <div className="grid-2">
                <div className="field">
                  <label>Full Name</label>
                  <input
                    value={basic.fullName}
                    onChange={(e) => setBasic({ ...basic, fullName: e.target.value })}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="field">
                  <label>Current level of study</label>
                  <div className="chips">
                    {[
                      { v: "school", l: "School (O/L / A/L)" },
                      { v: "diploma", l: "Diploma" },
                      { v: "ug", l: "Undergraduate" },
                      { v: "pg", l: "Postgraduate" },
                    ].map((opt) => (
                      <button
                        key={opt.v}
                        type="button"
                        className={`chip ${basic.level === opt.v ? "active" : ""}`}
                        onClick={() => setBasic({ ...basic, level: opt.v })}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="survey-section">
              <div className="section-head">
                <h2>Section 2: Interest Assessment</h2>
                <p>Rate each statement from 1 to 5 (1 = Strongly Disagree, 5 = Strongly Agree)</p>
              </div>

              <div className="table">
                <div className="trow thead">
                  <div className="tcell statement">Statement</div>
                  <div className="tcell scale">1 2 3 4 5</div>
                </div>
                {INTEREST_ITEMS.map((item) => (
                  <div key={item.key} className="trow">
                    <div className="tcell statement">{item.label}</div>
                    <div className="tcell scale">
                      <RadioRow
                        name={`interest-${item.key}`}
                        value={interest[item.key]}
                        onChange={(v) => setInterest({ ...interest, [item.key]: v })}
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="survey-section">
              <div className="section-head">
                <h2>Section 3: Skill Self-Assessment</h2>
                <p>Rate your current skill level (1 = No skill, 5 = Advanced)</p>
              </div>

              <div className="table">
                <div className="trow thead">
                  <div className="tcell statement">Skill Area</div>
                  <div className="tcell scale">1 2 3 4 5</div>
                </div>
                {SKILL_ITEMS.map((item) => (
                  <div key={item.key} className="trow">
                    <div className="tcell statement">{item.label}</div>
                    <div className="tcell scale">
                      <RadioRow
                        name={`skill-${item.key}`}
                        value={skills[item.key]}
                        onChange={(v) => setSkills({ ...skills, [item.key]: v })}
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="survey-section">
              <div className="section-head">
                <h2>Section 4: Work Preference & Personality</h2>
                <p>Choose the option that best describes you.</p>
              </div>

              <div className="grid-3">
                <div className="field">
                  <label>I prefer work that is</label>
                  <select
                    value={prefs.workType}
                    onChange={(e) => setPrefs({ ...prefs, workType: e.target.value })}
                    required
                  >
                    <option value="">Select</option>
                    <option value="logical">Highly logical and structured</option>
                    <option value="creative">Creative and visual</option>
                    <option value="analytical">Investigative and analytical</option>
                    <option value="investigative">Security/investigation focused</option>
                    <option value="practical">Practical and hands-on</option>
                  </select>
                </div>
                <div className="field">
                  <label>I prefer working</label>
                  <select
                    value={prefs.team}
                    onChange={(e) => setPrefs({ ...prefs, team: e.target.value })}
                    required
                  >
                    <option value="">Select</option>
                    <option value="independent">Independently</option>
                    <option value="team">In a team</option>
                    <option value="lead">Leading a team</option>
                  </select>
                </div>
                <div className="field">
                  <label>I handle pressure and deadlines</label>
                  <select
                    value={prefs.pressure}
                    onChange={(e) => setPrefs({ ...prefs, pressure: e.target.value })}
                    required
                  >
                    <option value="">Select</option>
                    <option value="very">Very well</option>
                    <option value="moderate">Moderately</option>
                    <option value="poorly">Poorly</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="survey-section">
              <div className="section-head">
                <h2>Section 5: Career Motivation</h2>
                <p>Tell us what you value and your willingness to learn.</p>
              </div>

              <div className="grid-2">
                <div className="field">
                  <label>What matters most to you?</label>
                  <select
                    value={motivation.priority}
                    onChange={(e) => setMotivation({ ...motivation, priority: e.target.value })}
                    required
                  >
                    <option value="">Select</option>
                    <option value="salary">High salary</option>
                    <option value="stability">Job stability</option>
                    <option value="learning">Innovation & learning</option>
                    <option value="helping">Helping others</option>
                    <option value="balance">Work-life balance</option>
                  </select>
                </div>
                <div className="field">
                  <label>Willing to continuously learn new technologies?</label>
                  <select
                    value={motivation.learn}
                    onChange={(e) => setMotivation({ ...motivation, learn: e.target.value })}
                    required
                  >
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="maybe">Maybe</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="survey-section">
              <div className="section-head">
                <h2>Section 6: Preferred IT Career Areas</h2>
                <p>Select up to 3 areas you are most interested in.</p>
              </div>

              <div className="pill-grid">
                {[
                  "Software Developer",
                  "Web Developer",
                  "Mobile App Developer",
                  "Data Analyst / Data Scientist",
                  "AI / Machine Learning Engineer",
                  "Cybersecurity Analyst",
                  "Cloud / DevOps Engineer",
                  "Network Engineer",
                  "UI/UX Designer",
                  "QA / Software Tester",
                  "IT Support / System Administrator",
                ].map((label) => (
                  <button
                    key={label}
                    type="button"
                    className={`pill ${areas.includes(label) ? "active" : ""}`}
                    onClick={() => toggleArea(label)}
                    aria-pressed={areas.includes(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="hint">Selected: {areas.length}/3</div>
            </section>

            <section className="survey-section">
              <div className="section-head">
                <h2>Section 7: Open-Ended (Optional)</h2>
                <p>Share your goals (optional).</p>
              </div>

              <div className="grid-2">
                <div className="field">
                  <label>What is your dream IT job?</label>
                  <textarea
                    rows={4}
                    value={open.dream}
                    onChange={(e) => setOpen({ ...open, dream: e.target.value })}
                    placeholder="Example: AI Engineer at a top tech company..."
                  />
                </div>
                <div className="field">
                  <label>What is your biggest challenge in learning IT?</label>
                  <textarea
                    rows={4}
                    value={open.challenge}
                    onChange={(e) => setOpen({ ...open, challenge: e.target.value })}
                    placeholder="Example: Time management, math foundations, confidence..."
                  />
                </div>
              </div>
            </section>

            <div className="survey-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  const quick = scoreSurvey({
                    basic,
                    interest,
                    skills,
                    prefs,
                    motivation,
                    areas,
                    open,
                  });
                  alert(
                    `Preview (Top 3):\n1) ${quick.top3[0]?.name || "-"}\n2) ${quick.top3[1]?.name || "-"}\n3) ${quick.top3[2]?.name || "-"}`
                  );
                }}
              >
                Preview
              </button>
              <button type="submit" className="primary-btn">
                Submit Survey
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

