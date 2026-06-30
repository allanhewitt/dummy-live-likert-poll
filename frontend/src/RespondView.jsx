import { useState, useEffect } from "react";
import { getCurrentQuestion, getQuestions, submitResponse, getResults } from "./api.js";

const SCALE = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

export default function RespondView() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load the question list once.
  useEffect(() => {
    getQuestions().then(setQuestions).catch(console.error);
  }, []);

  // Poll for which question is currently live.
  useEffect(() => {
    const poll = async () => {
      try {
        const { currentQuestionId: liveId } = await getCurrentQuestion();
        setCurrentQuestionId((prev) => {
          if (prev !== liveId) {
            setSelected(null);
            setSubmitted(false);
          }
          return liveId;
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentQuestion = questions.find((q) => q.id === currentQuestionId);

  const handleSubmit = async () => {
    if (!selected || !currentQuestionId) return;
    try {
      await submitResponse(currentQuestionId, selected);
      const data = await getResults(currentQuestionId);
      setResults(data);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={styles.page}><p style={styles.idle}>Loading…</p></div>;
  }

  if (!currentQuestion) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={styles.idle}>No active question right now.</p>
        </div>
      </div>
    );
  }

  const total = results.reduce((sum, r) => sum + r.count, 0);
  const maxCount = Math.max(...results.map((r) => r.count), 1);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <p style={styles.eyebrow}>Quick Poll</p>
        <h1 style={styles.question}>{currentQuestion.question}</h1>

        {!submitted ? (
          <>
            <div style={styles.optionsRow}>
              {SCALE.map((label) => (
                <button
                  key={label}
                  onClick={() => setSelected(label)}
                  style={{
                    ...styles.optionButton,
                    ...(selected === label ? styles.optionButtonSelected : {}),
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={selected === null}
              style={{
                ...styles.submitButton,
                opacity: selected === null ? 0.4 : 1,
                cursor: selected === null ? "not-allowed" : "pointer",
              }}
            >
              Submit response
            </button>
          </>
        ) : (
          <div style={styles.resultsBlock}>
            <p style={styles.resultsLabel}>
              Class responses <span style={styles.resultsCount}>({total})</span>
            </p>
            {SCALE.map((label) => {
              const match = results.find((r) => r.value === label);
              const count = match ? match.count : 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const barWidth = (count / maxCount) * 100;
              const isMine = label === selected;
              return (
                <div key={label} style={styles.barRow}>
                  <span style={styles.barLabel}>{label}</span>
                  <div style={styles.barTrack}>
                    <div
                      style={{
                        ...styles.barFill,
                        width: `${barWidth}%`,
                        backgroundColor: isMine ? "#1F5E4D" : "#A8BFB6",
                      }}
                    />
                  </div>
                  <span style={styles.barValue}>
                    {count} <span style={styles.barPct}>({pct}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F6F4EF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "560px",
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    padding: "40px 36px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    border: "1px solid #E8E4DA",
  },
  idle: {
    margin: 0,
    fontSize: "16px",
    color: "#8A8273",
    textAlign: "center",
  },
  eyebrow: {
    margin: 0,
    fontSize: "12px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#8A8273",
    fontWeight: 600,
  },
  question: {
    margin: "10px 0 28px 0",
    fontSize: "24px",
    lineHeight: 1.35,
    color: "#1F2421",
    fontWeight: 600,
  },
  optionsRow: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "24px",
  },
  optionButton: {
    textAlign: "left",
    padding: "14px 16px",
    borderRadius: "8px",
    border: "1px solid #DCD7CA",
    backgroundColor: "#FBFAF7",
    fontSize: "15px",
    color: "#2A2F2C",
    cursor: "pointer",
  },
  optionButtonSelected: {
    borderColor: "#1F5E4D",
    backgroundColor: "#EAF2EE",
    color: "#1F5E4D",
    fontWeight: 600,
  },
  submitButton: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#1F5E4D",
    color: "#FFFFFF",
    fontSize: "15px",
    fontWeight: 600,
  },
  resultsBlock: { display: "flex", flexDirection: "column", gap: "14px" },
  resultsLabel: {
    margin: "0 0 6px 0",
    fontSize: "13px",
    fontWeight: 600,
    color: "#5C5648",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  resultsCount: { fontWeight: 400, color: "#8A8273", textTransform: "none", letterSpacing: 0 },
  barRow: { display: "grid", gridTemplateColumns: "130px 1fr 70px", alignItems: "center", gap: "10px" },
  barLabel: { fontSize: "13px", color: "#3A3F3B" },
  barTrack: { height: "14px", backgroundColor: "#EFEDE6", borderRadius: "7px", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: "7px", transition: "width 0.4s ease" },
  barValue: { fontSize: "13px", color: "#2A2F2C", textAlign: "right" },
  barPct: { color: "#8A8273" },
};
