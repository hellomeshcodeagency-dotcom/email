import { createHash, timingSafeEqual } from "node:crypto";
import { QUIZ } from "../lib/questions.mjs";
import { json, attempts } from "../lib/http.mjs";

// GET    /api/admin/attempts          -> all attempts + questions with answers
// DELETE /api/admin/attempts?id=...   -> remove one attempt
// Header: x-admin-password: <ADMIN_PASSWORD env var>
export default async (req) => {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return json({ error: "ADMIN_PASSWORD is not set in Netlify environment variables." }, 500);
  if (!same(req.headers.get("x-admin-password") || "", expected)) return json({ error: "Unauthorized" }, 401);

  const store = attempts();

  if (req.method === "GET") {
    const { blobs } = await store.list();
    const list = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean);
    return json({
      quiz: { totalSeconds: QUIZ.totalSeconds, passMark: QUIZ.passMark, total: QUIZ.questions.length },
      questions: QUIZ.questions,
      attempts: list,
      serverTime: Date.now(),
    });
  }

  if (req.method === "DELETE") {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return json({ error: "Missing id" }, 400);
    await store.delete(id);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
};

function same(a, b) {
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}

export const config = { path: "/api/admin/attempts" };
