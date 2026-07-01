// Single place to change the backend URL.
// Local dev: http://localhost:4000
// Once deployed: your Coolify backend service URL.
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export async function getQuestions() {
  const res = await fetch(`${API_BASE}/questions`);
  if (!res.ok) throw new Error("Failed to fetch questions");
  return res.json();
}

export async function submitResponse(questionId, value) {
  const res = await fetch(`${API_BASE}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionId, value }),
  });
  if (!res.ok) throw new Error("Failed to submit response");
  return res.json();
}

export async function getResults(questionId) {
  const res = await fetch(`${API_BASE}/results/${questionId}`);
  if (!res.ok) throw new Error("Failed to fetch results");
  return res.json();
}
