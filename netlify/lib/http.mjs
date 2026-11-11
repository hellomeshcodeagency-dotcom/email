import { getStore } from "@netlify/blobs";

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export const attempts = () => getStore({ name: "quiz-attempts", consistency: "strong" });

export async function readBody(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
