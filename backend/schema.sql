-- Dummy polling project schema
-- Run this once against a dedicated database/schema (e.g. gedl_dummy_test)
-- so it stays fully isolated and disposable.

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS responses (
  id SERIAL PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id),
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS session_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  current_question_id TEXT REFERENCES questions(id),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Seed the five dummy questions
INSERT INTO questions (id, question, sort_order) VALUES
  ('q1', 'Do you agree that darts is a sport?', 1),
  ('q2', 'Data should always be cleaned before analysis.', 2),
  ('q3', 'A picture is worth a thousand numbers.', 3),
  ('q4', 'Correlation is enough to justify a policy decision.', 4),
  ('q5', 'Statistics can be used to mislead as easily as inform.', 5)
ON CONFLICT (id) DO NOTHING;

-- Ensure the single session_state row exists, with nothing live yet
INSERT INTO session_state (id, current_question_id) VALUES (1, NULL)
ON CONFLICT (id) DO NOTHING;
