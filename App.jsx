import { useState, useEffect } from "react";

const SUBJECTS = [
  { id: "mathematics", name: "Mathematics", color: "#1D4ED8", bg: "#DBEAFE", border: "#93C5FD", emoji: "📐" },
  { id: "science", name: "Science", color: "#15803D", bg: "#DCFCE7", border: "#86EFAC", emoji: "🔬" },
  { id: "english", name: "English (L&L)", color: "#7C3AED", bg: "#EDE9FE", border: "#C4B5FD", emoji: "📚" },
  { id: "hindi", name: "Hindi", color: "#B91C1C", bg: "#FEE2E2", border: "#FCA5A5", emoji: "📖" },
  { id: "social-science", name: "Social Science", color: "#B45309", bg: "#FEF3C7", border: "#FCD34D", emoji: "🌏" },
  { id: "sanskrit", name: "Sanskrit", color: "#6D28D9", bg: "#F5F3FF", border: "#DDD6FE", emoji: "🕉️" },
];

const YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];

const POLLS = [
  { id: "p1", question: "Which subject do you find most difficult in CBSE Class 10?", options: ["Mathematics", "Science", "Social Science", "Hindi"] },
  { id: "p2", question: "How many hours do you study daily for board exam preparation?", options: ["2–3 hours", "4–5 hours", "6–7 hours", "8+ hours"] },
  { id: "p3", question: "How helpful have previous year papers been in your preparation?", options: ["Extremely helpful", "Very helpful", "Somewhat helpful", "Not helpful"] },
  { id: "p4", question: "Which resource do you rely on most for board exam preparation?", options: ["NCERT Books", "Sample Papers", "YouTube Videos", "Coaching Notes"] },
  { id: "p5", question: "In which subject do you think it's easiest to score highest marks?", options: ["English", "Social Science", "Hindi", "Mathematics"] },
];

const MARKS_BREAKDOWN = {
  mathematics: [
    { unit: "Number Systems", marks: 6 }, { unit: "Algebra", marks: 20 },
    { unit: "Coordinate Geometry", marks: 6 }, { unit: "Geometry", marks: 15 },
    { unit: "Trigonometry", marks: 12 }, { unit: "Mensuration", marks: 10 },
    { unit: "Statistics & Probability", marks: 11 },
  ],
  science: [
    { unit: "Chemical Substances", marks: 25 }, { unit: "World of Living", marks: 23 },
    { unit: "Natural Phenomena", marks: 12 }, { unit: "Effects of Current", marks: 13 },
    { unit: "Natural Resources", marks: 7 },
  ],
  "social-science": [
    { unit: "History – India & Contemporary World II", marks: 20 },
    { unit: "Geography – Contemporary India II", marks: 20 },
    { unit: "Political Science – Democratic Politics II", marks: 20 },
    { unit: "Economics – Understanding Economic Development", marks: 20 },
  ],
  english: [
    { unit: "Reading Comprehension", marks: 20 }, { unit: "Writing Skills", marks: 20 },
    { unit: "Grammar", marks: 10 }, { unit: "Literature", marks: 30 },
  ],
  hindi: [
    { unit: "Reading (Apathit Gadyansh)", marks: 10 }, { unit: "Writing", marks: 15 },
    { unit: "Grammar", marks: 15 }, { unit: "Literature (Kshitij / Sparsh)", marks: 30 },
    { unit: "Complementary Reader", marks: 10 },
  ],
  sanskrit: [
    { unit: "Unseen Passage", marks: 10 }, { unit: "Creative Writing", marks: 15 },
    { unit: "Grammar (Vyakaran)", marks: 15 }, { unit: "Textbook (Shemushi)", marks: 30 },
    { unit: "Workbook (Abhyaswaan Bhav)", marks: 10 },
  ],
};

const PAPER_YEARS_INFO = {
  2024: "February 2024 – Set 1, 2, 3 available",
  2023: "March 2023 – Set 1, 2, 3 available",
  2022: "Term 1 (Nov 2021) + Term 2 (May 2022)",
  2021: "Special / Compartment exams only (COVID year)",
  2020: "February 2020 – All sets available",
  2019: "March 2019 – Standard & Basic (Mathematics)",
  2018: "March 2018 – Complete paper sets",
  2017: "March 2017 – All sets available",
  2016: "March 2016 – All sets available",
  2015: "March 2015 – All sets available",
};

export default function App() {
  const [tab, setTab] = useState("home");
  const [papersSubject, setPapersSubject] = useState(null);
  const [papersYear, setPapersYear] = useState(2024);

  const [testPhase, setTestPhase] = useState("setup");
  const [selSubject, setSelSubject] = useState(null);
  const [selYear, setSelYear] = useState(2024);
  const [quizData, setQuizData] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showExpl, setShowExpl] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");

  const [pollIdx, setPollIdx] = useState(0);
  const [pollVotes, setPollVotes] = useState({});
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const pv = await window.storage.get("cbse-pollvotes");
        if (pv) setPollVotes(JSON.parse(pv.value));
        const uv = await window.storage.get("cbse-uservotes");
        if (uv) setUserVotes(JSON.parse(uv.value));
      } catch (error) {
        console.warn("Poll storage could not be loaded:", error);
      }
    };
    load();
  }, []);

  const voted = userVotes[POLLS[pollIdx].id] !== undefined;

  const handleVote = async (optIdx) => {
    const poll = POLLS[pollIdx];
    if (userVotes[poll.id] !== undefined) return;
    const newPV = { ...pollVotes };
    if (!newPV[poll.id]) newPV[poll.id] = {};
    newPV[poll.id][optIdx] = (newPV[poll.id][optIdx] || 0) + 1;
    const newUV = { ...userVotes, [poll.id]: optIdx };
    setPollVotes(newPV);
    setUserVotes(newUV);
    try {
      await window.storage.set("cbse-pollvotes", JSON.stringify(newPV));
      await window.storage.set("cbse-uservotes", JSON.stringify(newUV));
    } catch (error) {
      console.warn("Poll vote could not be saved:", error);
    }
  };

  const getPollResults = () => {
    const poll = POLLS[pollIdx];
    const votes = pollVotes[poll.id] || {};
    const total = Object.values(votes).reduce((a, b) => a + b, 0);
    return poll.options.map((opt, i) => ({
      name: opt,
      votes: votes[i] || 0,
      pct: total > 0 ? Math.round(((votes[i] || 0) / total) * 100) : 0,
    }));
  };

  const totalPollVotes = () => {
    const votes = pollVotes[POLLS[pollIdx].id] || {};
    return Object.values(votes).reduce((a, b) => a + b, 0);
  };

  const generateTest = async () => {
    if (!selSubject) return;
    setTestPhase("loading");
    setQuizData([]); setQIdx(0); setUserAnswers({}); setShowExpl(false);
    const subj = SUBJECTS.find(s => s.id === selSubject);
    const msgs = ["Analysing CBSE syllabus...", `Loading ${selYear} paper pattern...`, "Generating 10 questions...", "Almost ready..."];
    let mi = 0;
    setLoadMsg(msgs[0]);
    const iv = setInterval(() => { mi++; if (msgs[mi]) setLoadMsg(msgs[mi]); }, 900);
    try {
      const prompt = `Generate exactly 10 CBSE Class 10 ${subj.name} MCQ questions modeled on the ${selYear} board exam pattern. Cover different chapters from the full syllabus. Return ONLY a valid JSON array (no markdown, no preamble):
[{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correct":0,"explanation":"..."}]
"correct" is the 0-based index of the correct option. Make questions at genuine board-level difficulty.`;

      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
        })
      });
      clearInterval(iv);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate test.");
      const raw = data.text.replace(/```json|```/g, "").trim();
      setQuizData(JSON.parse(raw));
      setTestPhase("quiz");
    } catch {
      clearInterval(iv);
      setTestPhase("setup");
      alert("Something went wrong. Please try again.");
    }
  };

  const handleAnswer = (idx) => {
    if (userAnswers[qIdx] !== undefined) return;
    setUserAnswers(prev => ({ ...prev, [qIdx]: idx }));
    setShowExpl(true);
  };
  const nextQ = () => {
    if (qIdx < quizData.length - 1) { setQIdx(q => q + 1); setShowExpl(false); }
    else setTestPhase("result");
  };

  const getScore = () => Object.entries(userAnswers).filter(([i, a]) => a === quizData[+i]?.correct).length;

  const getGrade = (score) => {
    if (score >= 9) return { grade: "A+", msg: "Outstanding performance! 🏆", color: "#15803D" };
    if (score >= 7) return { grade: "A", msg: "Excellent work! 🌟", color: "#1D4ED8" };
    if (score >= 5) return { grade: "B", msg: "Good job! Keep it up 👍", color: "#D97706" };
    if (score >= 3) return { grade: "C", msg: "Needs more practice 📚", color: "#DC2626" };
    return { grade: "D", msg: "Revise your concepts! 💪", color: "#991B1B" };
  };

  const BAR_COLORS = ["#1D4ED8", "#15803D", "#7C3AED", "#B91C1C", "#D97706"];

  const navItems = [["home", "🏠", "Home"], ["papers", "📄", "Papers"], ["test", "✏️", "Test Series"], ["polls", "📊", "Polls"]];

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", minHeight: "100vh", background: "#F1F5FF", color: "#111827" }}>

      {/* HEADER */}
      <div style={{ background: "#0B1E3D", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", gap: "1rem", height: 58 }}>
          <div style={{ background: "#D4A017", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "#0B1E3D", flexShrink: 0 }}>10</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>CBSE Class 10 Hub</div>
            <div style={{ color: "#93C5FD", fontSize: 11 }}>Previous Papers · AI Test Series · Live Polls</div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {navItems.map(([id, ic, lb]) => (
              <button key={id} onClick={() => setTab(id)} style={{ background: tab === id ? "#D4A017" : "transparent", color: tab === id ? "#0B1E3D" : "#CBD5E1", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: tab === id ? 700 : 400, fontSize: 13 }}>
                <span style={{ marginRight: 4 }}>{ic}</span>{lb}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem" }}>

        {/* ===== HOME ===== */}
        {tab === "home" && (
          <div>
            <div style={{ background: "#0B1E3D", borderRadius: 16, padding: "2rem", marginBottom: "1.5rem", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 160, height: 160, background: "#D4A017", borderRadius: "50%", opacity: 0.07 }} />
              <div style={{ position: "absolute", bottom: -40, right: 60, width: 200, height: 200, background: "#1D4ED8", borderRadius: "50%", opacity: 0.09 }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ color: "#D4A017", fontWeight: 700, fontSize: 11, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>CBSE Board Exam 2024–25</div>
                <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.3 }}>Class 10 Complete<br />Preparation Hub 🎯</h1>
                <p style={{ color: "#94A3B8", fontSize: 14, margin: "0 0 1.5rem", maxWidth: 500 }}>Access previous 10 years of CBSE board question papers, take AI-powered mock tests, and participate in live student polls — all in one place.</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button onClick={() => setTab("papers")} style={{ background: "#D4A017", color: "#0B1E3D", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>📄 Browse Papers</button>
                  <button onClick={() => setTab("test")} style={{ background: "transparent", color: "#fff", border: "1.5px solid #4B5563", borderRadius: 10, padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>✏️ Take a Test</button>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
              {[["60+", "Papers Available", "#1D4ED8", "#DBEAFE"], ["6", "All Subjects", "#15803D", "#DCFCE7"], ["10", "Years Coverage", "#7C3AED", "#EDE9FE"], ["AI", "Powered Tests", "#D97706", "#FEF3C7"]].map(([val, lbl, clr, bg]) => (
                <div key={lbl} style={{ background: bg, borderRadius: 12, padding: "1rem", textAlign: "center", border: `1px solid ${clr}30` }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: clr }}>{val}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{lbl}</div>
                </div>
              ))}
            </div>

            <h2 style={{ fontWeight: 700, fontSize: 17, marginBottom: "0.75rem", color: "#0B1E3D" }}>📚 All Subjects</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
              {SUBJECTS.map(subj => (
                <div key={subj.id} onClick={() => { setTab("papers"); setPapersSubject(subj.id); }} style={{ background: "#fff", borderRadius: 14, padding: "1.25rem", border: `1.5px solid ${subj.border}`, cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: subj.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 10 }}>{subj.emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 4 }}>{subj.name}</div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>10 years · All sets</div>
                  <div style={{ marginTop: 8, fontSize: 12, color: subj.color, fontWeight: 600 }}>View Papers →</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: 14, padding: "1.25rem", border: "1px solid #E5E7EB" }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: "0.75rem", color: "#0B1E3D" }}>💡 Exam Preparation Tips</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {["Read NCERT books thoroughly — 80% of questions come directly from them.", "Solve at least 5 previous year papers per subject before the exam.", "Practice time management — the board paper is 3 hours long.", "Focus on weak chapters and revise all concepts daily."].map((tip, i) => (
                  <div key={i} style={{ background: "#F8FAFC", borderRadius: 8, padding: "0.75rem", fontSize: 13, color: "#374151", borderLeft: "3px solid #D4A017" }}>{tip}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== PAPERS ===== */}
        {tab === "papers" && (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: "1rem", color: "#0B1E3D" }}>📄 Previous Year Question Papers</h2>

            <div style={{ background: "#fff", borderRadius: 14, padding: "1rem", marginBottom: "1rem", border: "1px solid #E5E7EB" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 8 }}>Select Subject:</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => setPapersSubject(null)} style={{ background: !papersSubject ? "#0B1E3D" : "#F3F4F6", color: !papersSubject ? "#fff" : "#374151", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>All Subjects</button>
                {SUBJECTS.map(s => (
                  <button key={s.id} onClick={() => setPapersSubject(s.id)} style={{ background: papersSubject === s.id ? s.color : "#F3F4F6", color: papersSubject === s.id ? "#fff" : "#374151", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                    {s.emoji} {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 14, padding: "1rem", marginBottom: "1rem", border: "1px solid #E5E7EB" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 8 }}>Select Year:</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {YEARS.map(y => (
                  <button key={y} onClick={() => setPapersYear(y)} style={{ background: papersYear === y ? "#D4A017" : "#F3F4F6", color: papersYear === y ? "#0B1E3D" : "#374151", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontWeight: papersYear === y ? 700 : 500, fontSize: 13 }}>{y}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              {(papersSubject ? SUBJECTS.filter(s => s.id === papersSubject) : SUBJECTS).map(subj => (
                <div key={subj.id} style={{ background: "#fff", borderRadius: 14, padding: "1.25rem", border: `1.5px solid ${subj.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: subj.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{subj.emoji}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{subj.name}</div>
                      <div style={{ fontSize: 12, color: "#6B7280" }}>CBSE Board · {papersYear}</div>
                    </div>
                  </div>

                  <div style={{ background: "#F8FAFC", borderRadius: 8, padding: "0.75rem", marginBottom: "0.75rem" }}>
                    <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 2, color: "#0B1E3D" }}>📋 {papersYear} Exam Details</div>
                    <div style={{ fontSize: 12, color: "#6B7280" }}>{PAPER_YEARS_INFO[papersYear]}</div>
                  </div>

                  {MARKS_BREAKDOWN[subj.id] && (
                    <div style={{ marginBottom: "0.75rem" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 6 }}>Unit-wise Marks (out of 80):</div>
                      {MARKS_BREAKDOWN[subj.id].slice(0, 3).map((u, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "2px 0", color: "#374151" }}>
                          <span>{u.unit}</span>
                          <span style={{ fontWeight: 700, color: subj.color }}>{u.marks} marks</span>
                        </div>
                      ))}
                      {MARKS_BREAKDOWN[subj.id].length > 3 && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>+{MARKS_BREAKDOWN[subj.id].length - 3} more units</div>}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setTab("test"); setSelSubject(subj.id); setSelYear(papersYear); }} style={{ flex: 1, background: subj.color, color: "#fff", border: "none", borderRadius: 8, padding: "8px 0", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                      ✏️ Practice Test
                    </button>
                    <button onClick={() => setTab("polls")} style={{ background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 13 }}>
                      📊 Polls
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== TEST SERIES ===== */}
        {tab === "test" && (
          <div>
            {testPhase === "setup" && (
              <div>
                <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: "0.5rem", color: "#0B1E3D" }}>✏️ AI-Powered Test Series</h2>
                <p style={{ color: "#6B7280", fontSize: 14, marginBottom: "1.5rem" }}>Select a subject and year — AI will generate 10 CBSE-pattern questions just for you!</p>

                <div style={{ background: "#fff", borderRadius: 14, padding: "1.5rem", border: "1px solid #E5E7EB", marginBottom: "1rem" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: "0.75rem", color: "#0B1E3D" }}>📚 Select Subject</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    {SUBJECTS.map(subj => (
                      <div key={subj.id} onClick={() => setSelSubject(subj.id)} style={{ border: `2px solid ${selSubject === subj.id ? subj.color : "#E5E7EB"}`, borderRadius: 12, padding: "1rem", cursor: "pointer", background: selSubject === subj.id ? subj.bg : "#fff", transition: "all 0.15s" }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>{subj.emoji}</div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: selSubject === subj.id ? subj.color : "#374151" }}>{subj.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: "#fff", borderRadius: 14, padding: "1.25rem", border: "1px solid #E5E7EB", marginBottom: "1.5rem" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: "0.75rem", color: "#0B1E3D" }}>📅 Select Year</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {YEARS.map(y => (
                      <button key={y} onClick={() => setSelYear(y)} style={{ background: selYear === y ? "#0B1E3D" : "#F3F4F6", color: selYear === y ? "#D4A017" : "#374151", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: selYear === y ? 700 : 500, fontSize: 14 }}>{y}</button>
                    ))}
                  </div>
                </div>

                <button onClick={generateTest} disabled={!selSubject} style={{ width: "100%", background: selSubject ? "#0B1E3D" : "#D1D5DB", color: selSubject ? "#D4A017" : "#fff", border: "none", borderRadius: 12, padding: "14px", fontWeight: 700, fontSize: 16, cursor: selSubject ? "pointer" : "not-allowed" }}>
                  🚀 Start Test {selSubject ? `— ${SUBJECTS.find(s => s.id === selSubject)?.name} (${selYear} Pattern)` : ""}
                </button>

                <div style={{ marginTop: "1rem", background: "#FEF3C7", borderRadius: 10, padding: "0.75rem 1rem", fontSize: 13, color: "#92400E" }}>
                  ⚡ AI generates 10 MCQ questions based on the actual CBSE syllabus and board exam difficulty level.
                </div>
              </div>
            )}

            {testPhase === "loading" && (
              <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                <div style={{ fontSize: 48, marginBottom: "1rem" }}>⚙️</div>
                <h3 style={{ color: "#0B1E3D", fontWeight: 700, fontSize: 20, marginBottom: "0.5rem" }}>Generating Your Test...</h3>
                <p style={{ color: "#6B7280", fontSize: 14 }}>{loadMsg}</p>
                <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center", gap: 6 }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#0B1E3D", opacity: 0.4, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
                </div>
              </div>
            )}

            {testPhase === "quiz" && quizData.length > 0 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div style={{ fontWeight: 700, color: "#0B1E3D", fontSize: 16 }}>Question {qIdx + 1} of {quizData.length}</div>
                  <div style={{ background: "#DBEAFE", color: "#1D4ED8", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
                    {SUBJECTS.find(s => s.id === selSubject)?.emoji} {selYear}
                  </div>
                </div>
                <div style={{ background: "#E5E7EB", borderRadius: 4, height: 6, marginBottom: "1.5rem" }}>
                  <div style={{ background: "#0B1E3D", borderRadius: 4, height: "100%", width: `${((qIdx + 1) / quizData.length) * 100}%`, transition: "width 0.4s" }} />
                </div>

                <div style={{ background: "#fff", borderRadius: 14, padding: "1.5rem", border: "1px solid #E5E7EB", marginBottom: "1rem" }}>
                  <div style={{ fontWeight: 700, fontSize: 17, color: "#111827", lineHeight: 1.5, marginBottom: "1.25rem" }}>
                    Q{qIdx + 1}. {quizData[qIdx]?.question}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {quizData[qIdx]?.options.map((opt, i) => {
                      const answered = userAnswers[qIdx] !== undefined;
                      const isSelected = userAnswers[qIdx] === i;
                      const isCorrect = quizData[qIdx]?.correct === i;
                      let bg = "#F8FAFC", border = "#E5E7EB", color = "#374151";
                      if (answered) {
                        if (isCorrect) { bg = "#DCFCE7"; border = "#15803D"; color = "#14532D"; }
                        else if (isSelected) { bg = "#FEE2E2"; border = "#B91C1C"; color = "#7F1D1D"; }
                      }
                      return (
                        <button key={i} onClick={() => handleAnswer(i)} disabled={answered}
                          style={{ background: bg, border: `2px solid ${border}`, borderRadius: 10, padding: "12px 16px", cursor: answered ? "default" : "pointer", textAlign: "left", fontWeight: 500, fontSize: 14, color, transition: "all 0.15s" }}>
                          {opt} {answered && isCorrect ? "✓" : ""}{answered && isSelected && !isCorrect ? "✗" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {showExpl && (
                  <div style={{ background: "#F0FDF4", borderRadius: 12, padding: "1rem", border: "1px solid #BBF7D0", marginBottom: "1rem" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#15803D", marginBottom: 4 }}>💡 Explanation</div>
                    <div style={{ fontSize: 13, color: "#374151" }}>{quizData[qIdx]?.explanation}</div>
                  </div>
                )}

                {userAnswers[qIdx] !== undefined && (
                  <button onClick={nextQ} style={{ width: "100%", background: "#0B1E3D", color: "#D4A017", border: "none", borderRadius: 12, padding: "12px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                    {qIdx < quizData.length - 1 ? "Next Question →" : "View Results 🏆"}
                  </button>
                )}
              </div>
            )}

            {testPhase === "result" && (
              <div>
                <div style={{ background: "#0B1E3D", borderRadius: 16, padding: "2rem", textAlign: "center", marginBottom: "1.5rem" }}>
                  {(() => {
                    const sc = getScore(); const g = getGrade(sc); return (
                      <>
                        <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
                        <div style={{ fontSize: 48, fontWeight: 700, color: g.color }}>{sc}/{quizData.length}</div>
                        <div style={{ background: g.color, color: "#fff", borderRadius: 20, padding: "4px 20px", display: "inline-block", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Grade {g.grade}</div>
                        <div style={{ color: "#CBD5E1", fontSize: 16, marginBottom: 4 }}>{g.msg}</div>
                        <div style={{ color: "#94A3B8", fontSize: 13 }}>{SUBJECTS.find(s => s.id === selSubject)?.name} · {selYear} Pattern</div>
                      </>
                    )
                  })()}
                </div>

                <div style={{ background: "#fff", borderRadius: 14, padding: "1.25rem", border: "1px solid #E5E7EB", marginBottom: "1rem" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: "0.75rem" }}>📋 Question Summary</div>
                  {quizData.map((q, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < quizData.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: userAnswers[i] === q.correct ? "#DCFCE7" : "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, color: userAnswers[i] === q.correct ? "#15803D" : "#B91C1C", fontWeight: 700 }}>
                        {userAnswers[i] === q.correct ? "✓" : "✗"}
                      </div>
                      <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.4 }}>{q.question.slice(0, 90)}{q.question.length > 90 ? "..." : ""}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setTestPhase("setup"); setQIdx(0); setUserAnswers({}); }} style={{ flex: 1, background: "#0B1E3D", color: "#D4A017", border: "none", borderRadius: 12, padding: "12px", fontWeight: 700, cursor: "pointer" }}>🔄 Retry Test</button>
                  <button onClick={() => { setTestPhase("setup"); setSelSubject(null); }} style={{ flex: 1, background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 12, padding: "12px", fontWeight: 600, cursor: "pointer" }}>📚 Change Subject</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== POLLS ===== */}
        {tab === "polls" && (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: "0.5rem", color: "#0B1E3D" }}>📊 Student Poll Series</h2>
            <p style={{ color: "#6B7280", fontSize: 14, marginBottom: "1.5rem" }}>Share your opinion and see what other students think!</p>

            <div style={{ display: "flex", gap: 6, marginBottom: "1rem", flexWrap: "wrap" }}>
              {POLLS.map((p, i) => (
                <button key={p.id} onClick={() => setPollIdx(i)} style={{ background: pollIdx === i ? "#0B1E3D" : "#fff", color: pollIdx === i ? "#D4A017" : "#374151", border: pollIdx === i ? "none" : "1px solid #E5E7EB", borderRadius: 20, padding: "6px 14px", cursor: "pointer", fontWeight: pollIdx === i ? 700 : 400, fontSize: 13 }}>
                  Poll {i + 1} {userVotes[p.id] !== undefined ? "✓" : ""}
                </button>
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", border: "1.5px solid #E5E7EB", marginBottom: "1rem" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Poll {pollIdx + 1} of {POLLS.length}</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#0B1E3D", lineHeight: 1.4, marginBottom: "1.25rem" }}>{POLLS[pollIdx].question}</div>

              {!voted ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {POLLS[pollIdx].options.map((opt, i) => (
                    <button key={i} onClick={() => handleVote(i)} style={{ background: "#F8FAFC", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "14px 16px", cursor: "pointer", textAlign: "left", fontWeight: 500, fontSize: 15, color: "#374151", transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#0B1E3D"; e.currentTarget.style.background = "#F1F5FF"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#F8FAFC"; }}>
                      {opt}
                    </button>
                  ))}
                  <div style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", marginTop: 4 }}>Results will be shown after voting</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 13, color: "#15803D", fontWeight: 600, marginBottom: "1rem" }}>✅ Vote recorded! Total votes: {totalPollVotes()}</div>
                  {getPollResults().map((item, i) => {
                    const isMyVote = userVotes[POLLS[pollIdx].id] === i;
                    return (
                      <div key={i} style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13, fontWeight: isMyVote ? 700 : 400, color: isMyVote ? "#0B1E3D" : "#374151" }}>
                          <span>{item.name} {isMyVote ? "← your vote" : ""}</span>
                          <span>{item.pct}% ({item.votes} votes)</span>
                        </div>
                        <div style={{ background: "#F3F4F6", borderRadius: 6, height: 12, overflow: "hidden" }}>
                          <div style={{ background: isMyVote ? "#D4A017" : BAR_COLORS[i % BAR_COLORS.length], borderRadius: 6, height: "100%", width: `${item.pct}%`, transition: "width 0.5s" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem" }}>
              <button onClick={() => setPollIdx(p => Math.max(0, p - 1))} disabled={pollIdx === 0} style={{ flex: 1, background: pollIdx === 0 ? "#F3F4F6" : "#0B1E3D", color: pollIdx === 0 ? "#9CA3AF" : "#D4A017", border: "none", borderRadius: 10, padding: "10px", fontWeight: 700, cursor: pollIdx === 0 ? "not-allowed" : "pointer" }}>
                ← Previous Poll
              </button>
              <button onClick={() => setPollIdx(p => Math.min(POLLS.length - 1, p + 1))} disabled={pollIdx === POLLS.length - 1} style={{ flex: 1, background: pollIdx === POLLS.length - 1 ? "#F3F4F6" : "#0B1E3D", color: pollIdx === POLLS.length - 1 ? "#9CA3AF" : "#D4A017", border: "none", borderRadius: 10, padding: "10px", fontWeight: 700, cursor: pollIdx === POLLS.length - 1 ? "not-allowed" : "pointer" }}>
                Next Poll →
              </button>
            </div>

            <div style={{ background: "#fff", borderRadius: 14, padding: "1.25rem", border: "1px solid #E5E7EB" }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: "0.75rem", color: "#0B1E3D" }}>📋 Your Poll Progress</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {POLLS.map((p, i) => (
                  <div key={p.id} onClick={() => setPollIdx(i)} style={{ background: userVotes[p.id] !== undefined ? "#DCFCE7" : "#F3F4F6", borderRadius: 20, padding: "6px 14px", fontSize: 13, color: userVotes[p.id] !== undefined ? "#15803D" : "#6B7280", fontWeight: 600, cursor: "pointer" }}>
                    Poll {i + 1} {userVotes[p.id] !== undefined ? "✓" : "○"}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: "#6B7280" }}>
                {Object.keys(userVotes).length} of {POLLS.length} polls completed
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:1} }`}</style>
    </div>
  );
}
