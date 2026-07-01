import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getQuestions, getResults } from "./api.js";

const SCALE = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

export default function DisplayView() {
  const { questionId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    getQuestions().then(setQuestions).catch(console.error);
  }, []);

  useEffect(() => {
    if (!questionId) {
      setResults([]);
      return;
    }
    const poll = async () => {
      try {
        const data = await getResults(questionId);
        setResults(data);
      } catch (err) {
        console.error(err);
      }
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [questionId]);

  const currentQuestion = questions.find((q) => q.id === questionId);
  const total = results.reduce((sum, r) => sum + r.count, 0);
  const maxCount = Math.max(...results.map((r) => r.count), 1);

  if (!questionId || !currentQuestion) {
    return (
      <div style={styles.page}>
        <p style={styles.idle}>
          {!questionId ? "No question selected" : "That question could not be found"}
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>Live class response</p>
        <h1 style={styles.question}>{currentQuestion.question}</h1>
      </div>

      <div style={styles.chart}>
        {SCALE.map((label) => {
          const match = results.find((r) => r.value === label);
          const count = match ? match.count : 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const barHeight = (count / maxCount) * 100;
          return (
            <div key={label} style={styles.column}>
              <span style={styles.count}>{count}</span>
              <div style={styles.barTrack}>
                <div style={{ ...styles.barFill, height: `${barHeight}%` }} />
              </div>
              <span style={styles.pct}>{pct}%</span>
              <span style={styles.label}>{label}</span>
            </div>
          );
        })}
      </div>

      <div style={styles.footer}>
        <span style={styles.totalCount}>{total} responses</span>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#14201B",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "5vh 6vw",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    color: "#F6F4EF",
    boxSizing: "border-box",
  },
  idle: {
    margin: "auto",
    fontSize: "2vw",
    color: "#8FB6A4",
  },
  header: { marginBottom: "5vh" },
  eyebrow: {
    margin: 0,
    fontSize: "1.1vw",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#8FB6A4",
    fontWeight: 600,
  },
  question: { margin: "10px 0 0 0", fontSize: "3.2vw", lineHeight: 1.2, fontWeight: 700, color: "#FFFFFF" },
  chart: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "2vw",
    alignItems: "end",
    height: "42vh",
  },
  column: { display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" },
  count: { fontSize: "2vw", fontWeight: 700, color: "#FFFFFF", marginBottom: "10px" },
  barTrack: {
    width: "100%",
    flex: 1,
    display: "flex",
    alignItems: "flex-end",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: "8px 8px 0 0",
    overflow: "hidden",
  },
  barFill: { width: "100%", backgroundColor: "#3F8F70", borderRadius: "8px 8px 0 0", transition: "height 0.5s ease" },
  pct: { fontSize: "1.1vw", color: "#8FB6A4", marginTop: "10px" },
  label: { fontSize: "1.05vw", color: "#D8D4C8", marginTop: "4px", textAlign: "center" },
  footer: { marginTop: "5vh", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "1.2vw", color: "#A8A498" },
  totalCount: { fontWeight: 600, color: "#F6F4EF" },
};
