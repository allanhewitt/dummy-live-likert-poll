import { useState, useEffect } from "react";
import { getQuestions, getCurrentQuestion, setCurrentQuestion } from "./api.js";

export default function ControlView() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);

  useEffect(() => {
    getQuestions().then(setQuestions).catch(console.error);
    getCurrentQuestion()
      .then((data) => setCurrentQuestionId(data.currentQuestionId))
      .catch(console.error);
  }, []);

  const handleSetLive = async (id) => {
    await setCurrentQuestion(id);
    setCurrentQuestionId(id);
  };

  const handleClear = async () => {
    await setCurrentQuestion(null);
    setCurrentQuestionId(null);
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Lecturer control</h1>
      <p style={styles.subheading}>Not for projection — keep this on your own device.</p>

      <div style={styles.list}>
        {questions.map((q) => {
          const isLive = q.id === currentQuestionId;
          return (
            <button
              key={q.id}
              onClick={() => handleSetLive(q.id)}
              style={{
                ...styles.questionButton,
                ...(isLive ? styles.questionButtonLive : {}),
              }}
            >
              <span style={styles.questionLabel}>{q.question}</span>
              {isLive && <span style={styles.liveTag}>LIVE</span>}
            </button>
          );
        })}
      </div>

      <button onClick={handleClear} style={styles.clearButton}>
        Clear live question
      </button>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F6F4EF",
    padding: "40px",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    maxWidth: "600px",
    margin: "0 auto",
  },
  heading: { fontSize: "22px", fontWeight: 700, color: "#1F2421", margin: "0 0 4px 0" },
  subheading: { fontSize: "13px", color: "#8A8273", margin: "0 0 28px 0" },
  list: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" },
  questionButton: {
    textAlign: "left",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    borderRadius: "8px",
    border: "1px solid #DCD7CA",
    backgroundColor: "#FFFFFF",
    fontSize: "14px",
    color: "#2A2F2C",
    cursor: "pointer",
  },
  questionButtonLive: {
    borderColor: "#1F5E4D",
    backgroundColor: "#EAF2EE",
  },
  questionLabel: { flex: 1 },
  liveTag: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#1F5E4D",
    letterSpacing: "0.05em",
    marginLeft: "12px",
  },
  clearButton: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #DCD7CA",
    backgroundColor: "#FBFAF7",
    color: "#5C5648",
    fontSize: "14px",
    cursor: "pointer",
  },
};
