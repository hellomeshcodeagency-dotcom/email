import { QUIZ, publicQuestions } from "../lib/questions.mjs";
import { json, attempts, readBody } from "../lib/http.mjs";

// POST /api/start  { name }  -> new attempt
// POST /api/start  { id }    -> resume an unfinished attempt
export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = await readBody(req);
  if (!body) return json({ error: "Invalid request" }, 400);

  const store = attempts();
  const now = Date.now();

  if (body.id) {
    const att = await store.get(String(body.id), { type: "json" });
    if (!att) return json({ error: "Attempt not found" }, 404);
    if (att.status !== "in_progress") return json({ error: "already_submitted" }, 409);
    return json(payload(att, now));
  }

  const name = String(body.name || "").trim().replace(/\s+/g, " ").slice(0, 80);
  if (name.length < 2) return json({ error: "Please enter your full name." }, 400);

  const att = {
    id: crypto.randomUUID(),
    name,
    quiz: QUIZ.key,
    status: "in_progress",
    startedAt: now,
    total: QUIZ.questions.length,
    userAgent: (req.headers.get("user-agent") || "").slice(0, 200),
  };
  await store.setJSON(att.id, att);
  return json(payload(att, now));
};

function payload(att, now) {
  return {
    id: att.id,
    name: att.name,
    elapsed: Math.floor((now - att.startedAt) / 1000),
    totalSeconds: QUIZ.totalSeconds,
    questions: publicQuestions(),
  };
}

export const config = { path: "/api/start" };
