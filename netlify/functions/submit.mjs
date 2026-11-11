import { QUIZ, normalizeAnswers, score } from "../lib/questions.mjs";
import { json, attempts, readBody } from "../lib/http.mjs";

const GRACE_SECONDS = 60; // network delay allowance after the timer hits 0

// POST /api/submit { id, answers, expired }
export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = await readBody(req);
  if (!body || !body.id) return json({ error: "Invalid request" }, 400);

  const store = attempts();
  const att = await store.get(String(body.id), { type: "json" });
  if (!att) return json({ error: "Attempt not found. It may have been removed by the admin." }, 404);

  // Already submitted: return the stored result (safe for retries).
  if (att.status === "completed") return json(result(att));

  const now = Date.now();
  const elapsed = Math.floor((now - att.startedAt) / 1000);
  const answers = normalizeAnswers(body.answers);
  const s = score(answers);

  const done = {
    ...att,
    status: "completed",
    submittedAt: now,
    answers,
    results: s.results,
    correct: s.correct,
    total: s.total,
    percent: s.percent,
    passed: s.passed,
    timeTaken: Math.min(elapsed, QUIZ.totalSeconds),
    expired: Boolean(body.expired) || elapsed >= QUIZ.totalSeconds,
    late: elapsed > QUIZ.totalSeconds + GRACE_SECONDS,
  };
  await store.setJSON(done.id, done);
  return json(result(done));
};

function result(att) {
  return {
    name: att.name,
    correct: att.correct,
    total: att.total,
    percent: att.percent,
    passed: att.passed,
    timeTaken: att.timeTaken,
    expired: att.expired,
    review: QUIZ.questions.map((q, k) => ({
      q: q.q,
      options: q.options,
      answer: q.answer,
      yours: att.answers[k],
      ok: att.results[k],
    })),
  };
}

export const config = { path: "/api/submit" };
