import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const app = express();
app.use(express.json());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
  })
);

// ─── Health check ─────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ─── Get all questions (used to build the student/control views) ─────────
app.get("/questions", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, question, sort_order FROM questions ORDER BY sort_order ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// ─── Get / set which question is currently live ───────────────────────────
app.get("/session/current", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_question_id FROM session_state WHERE id = 1"
    );
    res.json({ currentQuestionId: result.rows[0]?.current_question_id || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch current question" });
  }
});

app.post("/session/current", async (req, res) => {
  const { questionId } = req.body;
  try {
    await pool.query(
      "UPDATE session_state SET current_question_id = $1 WHERE id = 1",
      [questionId || null]
    );
    res.json({ currentQuestionId: questionId || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update current question" });
  }
});

// ─── Submit a response ─────────────────────────────────────────────────────
app.post("/respond", async (req, res) => {
  const { questionId, value } = req.body;
  if (!questionId || !value) {
    return res.status(400).json({ error: "questionId and value are required" });
  }
  try {
    await pool.query(
      "INSERT INTO responses (question_id, value) VALUES ($1, $2)",
      [questionId, value]
    );
    res.status(201).json({ status: "recorded" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to record response" });
  }
});

// ─── Get aggregated results for a question ─────────────────────────────────
app.get("/results/:questionId", async (req, res) => {
  const { questionId } = req.params;
  try {
    const result = await pool.query(
      "SELECT value, COUNT(*)::int AS count FROM responses WHERE question_id = $1 GROUP BY value",
      [questionId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Dummy poll backend running on port ${PORT}`);
});
